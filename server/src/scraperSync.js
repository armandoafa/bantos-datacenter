export async function syncScrapedData(scrapedData, pool, tenantId) {
  console.log('[ScraperSync] Iniciando volcado inteligente a BD para tenant:', tenantId);

  const parseMoney = (str) => {
    if (!str) return 0;
    const num = str.replace(/[^0-9.-]+/g,"");
    return parseFloat(num) || 0;
  };

  const parseDate = (str) => {
    if (!str || str === '-') return null;
    try { return new Date(str); } catch(e) { return null; }
  };

  const clientSignaturesMap = {};

  // 1. Clientes -> client_history
  for (const row of (scrapedData.clients || [])) {
    try {
      if (row.length < 3) continue;
      // Heuristic extraction
      const clientNumber = row.find(c => /^C\d{6,12}$/.test(c)) || row[0];
      const nameParts = row.filter(c => /^[a-zA-Z\s]{3,}$/.test(c) && !['Signed', 'Pending', 'Active'].includes(c));
      const fullName = (nameParts[0] || row[1]) + ' ' + (nameParts[1] || row[2] || '');
      const upyaId = `C-${clientNumber.replace(/[^A-Za-z0-9]/g, '')}`;
      // Extraer firma si existe en este cliente
      const sigCol = row.find(c => c.startsWith('SIG:'));
      if (sigCol) {
        clientSignaturesMap[upyaId] = sigCol.replace('SIG:', '');
      }

      await pool.query(
        'INSERT INTO client_history (upya_id, client_number, tenant_id, name) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name)',
        [upyaId, clientNumber, tenantId, fullName.trim()]
      );
    } catch(e) {}
  }

  // 2. Contratos -> contract_history
  for (const row of (scrapedData.contracts || [])) {
    try {
      if (row.length < 5) continue;
      const contractNumber = row.find(c => /^[a-zA-Z0-9]{8,15}$/.test(c) && !/^\d+$/.test(c) && !['ACCEPTED', 'PENDING', 'REJECTED', 'COMPLETED', 'PROCESSING', 'LOCKED', 'ENABLED'].includes(c.toUpperCase())) || row[0];
      const paidStr = row.find(c => /^(PEN|USD|MXN|GTQ|COP|EUR|GBP) [\d,.]+$/.test(c)) || row[5] || '0';
      const status = row.find(c => ['Locked', 'Enabled', 'Pending', 'Completed'].includes(c)) || row[7] || 'Pending';
      const lastUpdateStr = row.find(c => c.includes('2025') || c.includes('2026')) || row[8];
      const dealName = row[1];
      const clientName = row.find(c => /^[a-zA-Z\s]{6,}$/.test(c)) || row[3] || 'Desconocido';
      
      const paidValue = parseMoney(paidStr);
      const createdAt = parseDate(lastUpdateStr);

      let repaymentFrequency = null;
      let repaymentAmount = null;
      const dealUpper = (dealName || '').toUpperCase();
      if (dealUpper.includes(' CS ') || dealUpper.match(/\bCS\b/)) repaymentFrequency = 7;
      else if (dealUpper.includes(' CQ ') || dealUpper.match(/\bCQ\b/)) repaymentFrequency = 15;
      else if (dealUpper.includes(' CM ') || dealUpper.match(/\bCM\b/)) repaymentFrequency = 30;
      else if (dealUpper.includes(' CD ') || dealUpper.match(/\bCD\b/)) repaymentFrequency = 1;

      const amountMatch = dealUpper.match(/\bC[SQMD]\s*(\d+(?:\.\d+)?)\b/);
      if (amountMatch) {
          repaymentAmount = parseFloat(amountMatch[1]);
      }

      const upyaId = contractNumber; 
      let clientId = `C-DUMMY`;
      const [cRows] = await pool.query('SELECT upya_id FROM client_history WHERE name LIKE ? AND tenant_id = ?', [`%${clientName.split(' ')[0]}%`, tenantId]);
      if (cRows.length > 0) clientId = cRows[0].upya_id;
      else await pool.query('INSERT INTO client_history (upya_id, tenant_id, name) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name)', [clientId, tenantId, clientName]);

      // Usar la firma guardada del cliente
      const signatureImage = clientSignaturesMap[clientId] || null;

      await pool.query(
        `INSERT INTO contract_history 
         (contract_number, tenant_id, client_id, status, product_name, deal_name, total_value, paid_value, created_at_upya, upya_id, repayment_frequency, repayment_amount, signature_image)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE status=VALUES(status), paid_value=VALUES(paid_value), repayment_frequency=VALUES(repayment_frequency), repayment_amount=VALUES(repayment_amount), signature_image=COALESCE(VALUES(signature_image), signature_image)`,
        [contractNumber, tenantId, clientId, status.toLowerCase(), dealName, dealName, 0, paidValue, createdAt || new Date(), upyaId, repaymentFrequency, repaymentAmount, signatureImage]
      );
    } catch(e) {}
  }

  // 3. Pagos -> payments
  for (const row of (scrapedData.payments || [])) {
    try {
      if (row.length < 4) continue;
      const method = row.find(c => ['CASH', 'MOBILE_MONEY', 'CARD', 'BANK_TRANSFER', 'WEB'].includes(c.toUpperCase())) || row[0] || 'CASH';
      const status = row.find(c => ['ACCEPTED', 'PENDING', 'REJECTED', 'COMPLETED'].includes(c.toUpperCase())) || row[1] || 'ACCEPTED';
      const dateStr = row.find(c => c.includes('2026') || c.includes('2025'));
      const txId = row.find(c => /^\d{8,12}$/.test(c)) || Math.floor(Math.random()*100000000).toString();
      const contractId = row.find(c => /^[a-zA-Z0-9]{8,15}$/.test(c) && !/^\d+$/.test(c) && !['ACCEPTED', 'PENDING', 'REJECTED', 'COMPLETED', 'PROCESSING'].includes(c.toUpperCase())) || null;
      const amountStr = row.find(c => /^(PEN|USD|MXN|GTQ|COP|EUR|GBP) [\d,.]+$/.test(c)) || '0';
      const amount = parseMoney(amountStr);
      console.log(`[ScraperSync Debug] TxID: ${txId} | Contract: ${contractId} | AmountStr: "${amountStr}" | Parsed Amount: ${amount}`);

      let clientId = null;
      if (contractId) {
          const [cRows] = await pool.query('SELECT client_id FROM contract_history WHERE contract_number = ? AND tenant_id = ?', [contractId, tenantId]);
          if (cRows.length > 0) clientId = cRows[0].client_id;
      }
      
      await pool.query(
        `INSERT INTO payments (upya_id, transaction_id, tenant_id, contract_id, client_id, amount, method, status, payment_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE amount=VALUES(amount), status=VALUES(status), method=VALUES(method)`,
        [`PAY-${txId}`, txId, tenantId, contractId, clientId, amount, method, status, parseDate(dateStr) || new Date()]
      );
    } catch(e) {}
  }

  // 4. Productos -> products
  for (const row of (scrapedData.inventory || [])) {
    try {
      if (row.length < 5) continue;
      const category = row.find(c => ['Smartphone', 'Solar', 'TV', 'Accessories'].includes(c)) || row[0];
      const name = row[1];
      const manufacturer = row[2];
      const reference = row.find(c => /^\d{6,12}$/.test(c)) || row[4]; 
      
      const upyaId = reference || `PROD-${name.substring(0,10)}`;

      await pool.query(
        `INSERT INTO products (upya_id, tenant_id, name, category, reference, manufacturer, status) 
         VALUES (?, ?, ?, ?, ?, ?, 'Active')
         ON DUPLICATE KEY UPDATE name=VALUES(name)`,
        [upyaId, tenantId, name, category, reference, manufacturer]
      );
    } catch(e) {}
  }
  
  // 4b. Dispositivos -> inventory
  for (const row of (scrapedData.assets || [])) {
    try {
      if (row.length < 3) continue;
      const serialNumber = row.find(c => /^[A-Z0-9]{12,20}$/.test(c)) || row[0];
      const status = row.find(c => ['Active', 'Locked', 'Unlocked', 'Pending'].includes(c)) || 'Active';
      const model = row.find(c => c !== serialNumber && c !== status && c.length > 3) || 'Generic';
      
      const upyaId = `INV-${serialNumber}`;

      await pool.query(
        `INSERT INTO inventory (upya_id, serial_number, tenant_id, model, status) 
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE status=VALUES(status)`,
        [upyaId, serialNumber, tenantId, model, status]
      );
    } catch(e) {}
  }

  // 5. Deals -> payment_plans
  for (const row of (scrapedData.actions || [])) {
    try {
      if (row.length < 4) continue;
      const type = row.find(c => ['PAYG', 'CASH', 'CREDIT'].includes(c)) || row[0];
      const name = row[1];
      const productName = row[2];
      const status = row.find(c => ['Active', 'Pending', 'Inactive'].includes(c)) || 'Active';
      
      const upyaId = `DEAL-${name.substring(0,15)}`;

      await pool.query(
        `INSERT INTO payment_plans (upya_id, tenant_id, type, name, product_name, total_cost, status) 
         VALUES (?, ?, ?, ?, ?, 'Open', ?)
         ON DUPLICATE KEY UPDATE type=VALUES(type), name=VALUES(name), status=VALUES(status)`,
        [upyaId, tenantId, type, name, productName, status]
      );
    } catch(e) {}
  }

  console.log('[ScraperSync] Volcado finalizado.');
}
