import pool from './config/db.js';

async function seedSotelo() {
  const tenantId = 'sotelo';
  console.log(`Starting mock data injection for tenant: ${tenantId}...`);

  try {
    // 1. Create mock clients
    const clients = [
      { upya_id: 'upya-client-001', client_number: 'C-001', name: 'Juan Perez', email: 'juan.perez@example.com', status: 'Active' },
      { upya_id: 'upya-client-002', client_number: 'C-002', name: 'Maria Garcia', email: 'maria.garcia@example.com', status: 'Active' },
      { upya_id: 'upya-client-003', client_number: 'C-003', name: 'Carlos Lopez', email: 'carlos.lopez@example.com', status: 'Inactive' },
      { upya_id: 'upya-client-004', client_number: 'C-004', name: 'Ana Martinez', email: 'ana.martinez@example.com', status: 'Active' },
      { upya_id: 'upya-client-005', client_number: 'C-005', name: 'Luis Rodriguez', email: 'luis.rodriguez@example.com', status: 'Active' }
    ];

    for (const c of clients) {
      await pool.query(
        'INSERT INTO client_history (upya_id, client_number, tenant_id, name, email, status) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name), status=VALUES(status)',
        [c.upya_id, c.client_number, tenantId, c.name, c.email, c.status]
      );
    }
    console.log('✅ Inserted 5 clients.');

    // 2. Create mock products
    const products = [
      { upya_id: 'upya-prod-001', name: 'Solar Home System 50W', category: 'Solar', reference: 'SHS-50', base_value: 500.00 },
      { upya_id: 'upya-prod-002', name: 'Solar TV 24"', category: 'Appliance', reference: 'STV-24', base_value: 200.00 },
      { upya_id: 'upya-prod-003', name: 'Cookstove Pro', category: 'Biomass', reference: 'CK-PRO', base_value: 50.00 }
    ];

    for (const p of products) {
      await pool.query(
        'INSERT INTO products (upya_id, tenant_id, name, category, reference, base_value, status) VALUES (?, ?, ?, ?, ?, ?, "Active") ON DUPLICATE KEY UPDATE name=VALUES(name)',
        [p.upya_id, tenantId, p.name, p.category, p.reference, p.base_value]
      );
    }
    console.log('✅ Inserted 3 products.');

    // 3. Create mock contracts
    const contracts = [
      { upya_id: 'upya-contract-001', contract_number: 'CON-1001', client_id: 'upya-client-001', client_number: 'C-001', product_name: 'Solar Home System 50W', deal_name: 'PAYGO 12 Months', total_value: 500.00, paid_value: 150.00, status: 'Active' },
      { upya_id: 'upya-contract-002', contract_number: 'CON-1002', client_id: 'upya-client-002', client_number: 'C-002', product_name: 'Solar TV 24"', deal_name: 'Cash Sale', total_value: 200.00, paid_value: 200.00, status: 'Completed' },
      { upya_id: 'upya-contract-003', contract_number: 'CON-1003', client_id: 'upya-client-004', client_number: 'C-004', product_name: 'Solar Home System 50W', deal_name: 'PAYGO 24 Months', total_value: 600.00, paid_value: 50.00, status: 'Active' },
      { upya_id: 'upya-contract-004', contract_number: 'CON-1004', client_id: 'upya-client-005', client_number: 'C-005', product_name: 'Cookstove Pro', deal_name: 'PAYGO 6 Months', total_value: 50.00, paid_value: 10.00, status: 'Active' },
      { upya_id: 'upya-contract-005', contract_number: 'CON-1005', client_id: 'upya-client-001', client_number: 'C-001', product_name: 'Cookstove Pro', deal_name: 'Cash Sale', total_value: 50.00, paid_value: 50.00, status: 'Completed' }
    ];

    for (const c of contracts) {
      await pool.query(
        'INSERT INTO contract_history (upya_id, contract_number, tenant_id, client_id, client_number, product_name, deal_name, total_value, paid_value, status, created_at_upya) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE status=VALUES(status), paid_value=VALUES(paid_value)',
        [c.upya_id, c.contract_number, tenantId, c.client_id, c.client_number, c.product_name, c.deal_name, c.total_value, c.paid_value, c.status]
      );
    }
    console.log('✅ Inserted 5 contracts.');

    // 4. Create mock inventory
    const inventory = [
      { upya_id: 'upya-inv-001', serial_number: 'SN-SHS-001', model: 'Solar Home System 50W', status: 'Deployed' },
      { upya_id: 'upya-inv-002', serial_number: 'SN-STV-001', model: 'Solar TV 24"', status: 'Deployed' },
      { upya_id: 'upya-inv-003', serial_number: 'SN-SHS-002', model: 'Solar Home System 50W', status: 'Deployed' },
      { upya_id: 'upya-inv-004', serial_number: 'SN-SHS-003', model: 'Solar Home System 50W', status: 'In Stock' },
      { upya_id: 'upya-inv-005', serial_number: 'SN-CK-001', model: 'Cookstove Pro', status: 'In Stock' }
    ];

    for (const i of inventory) {
      await pool.query(
        'INSERT INTO inventory (upya_id, serial_number, tenant_id, model, status) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE status=VALUES(status)',
        [i.upya_id, i.serial_number, tenantId, i.model, i.status]
      );
    }
    console.log('✅ Inserted 5 inventory items.');

    // 5. Create mock payments
    const payments = [
      { upya_id: 'upya-pay-001', transaction_id: 'TXN-001', contract_id: 'upya-contract-001', client_id: 'upya-client-001', amount: 50.00, method: 'Mobile Money', status: 'Completed' },
      { upya_id: 'upya-pay-002', transaction_id: 'TXN-002', contract_id: 'upya-contract-001', client_id: 'upya-client-001', amount: 100.00, method: 'Cash', status: 'Completed' },
      { upya_id: 'upya-pay-003', transaction_id: 'TXN-003', contract_id: 'upya-contract-002', client_id: 'upya-client-002', amount: 200.00, method: 'Mobile Money', status: 'Completed' },
      { upya_id: 'upya-pay-004', transaction_id: 'TXN-004', contract_id: 'upya-contract-003', client_id: 'upya-client-004', amount: 50.00, method: 'Bank Transfer', status: 'Completed' },
      { upya_id: 'upya-pay-005', transaction_id: 'TXN-005', contract_id: 'upya-contract-004', client_id: 'upya-client-005', amount: 10.00, method: 'Mobile Money', status: 'Completed' }
    ];

    for (const p of payments) {
      await pool.query(
        'INSERT INTO payments (upya_id, transaction_id, tenant_id, contract_id, client_id, amount, method, status, payment_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE status=VALUES(status)',
        [p.upya_id, p.transaction_id, tenantId, p.contract_id, p.client_id, p.amount, p.method, p.status]
      );
    }
    console.log('✅ Inserted 5 payments.');

    console.log(`\n🎉 Mock data injection for ${tenantId} completed successfully!`);
    
  } catch (error) {
    console.error('❌ Error during mock data injection:', error);
  } finally {
    process.exit(0);
  }
}

seedSotelo();
