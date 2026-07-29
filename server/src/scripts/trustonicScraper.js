import puppeteer from 'puppeteer';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'adminbantosprompt',
  password: process.env.DB_PASSWORD || 'adminbantosprompt2026',
  database: process.env.DB_NAME || 'bantosprompt502301_db',
  waitForConnections: true,
  connectionLimit: 10
});

async function getLastOperationDate() {
  const [rows] = await pool.query('SELECT MAX(last_change) as lastDate FROM trustonic_devices');
  return rows[0].lastDate ? new Date(rows[0].lastDate) : new Date(0);
}

async function flushDevices(batch) {
  if (batch.length === 0) return;
  const placeholders = batch.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
  const values = [];
  for (const item of batch) {
    values.push(item.imei1, item.imei2, item.tenantId, item.service, item.status, item.brand, item.model, item.lastChange, item.lastConn);
  }
  const query = `
    INSERT INTO trustonic_devices (imei1, imei2, tenant_id, service, status, brand, model, last_change, last_connection)
    VALUES ${placeholders}
    ON DUPLICATE KEY UPDATE
    status=VALUES(status), last_change=VALUES(last_change), last_connection=VALUES(last_connection)
  `;
  await pool.query(query, values);
}

async function flushLogs(batch) {
  if (batch.length === 0) return;
  const placeholders = batch.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');
  const values = [];
  for (const item of batch) {
    values.push(item.imei1, item.tenantId, item.lastChange, item.lastAction, item.status, item.comment);
  }
  const query = `
    INSERT IGNORE INTO trustonic_logs (imei1, tenant_id, operation_date, operation_type, status, comment)
    VALUES ${placeholders}
  `;
  await pool.query(query, values);
}

export async function runTrustonicSync() {
  console.log('>>> Iniciando proceso de sincronización con Trustonic...');
  let browser;
  let newRecordsCount = 0;

  try {
    const lastDate = await getLastOperationDate();
    console.log(`>>> Buscando registros posteriores a: ${lastDate.toISOString()}`);

    const user = process.env.TRUSTONIC_USER;
    const pass = process.env.TRUSTONIC_PASS;
    const tenant = process.env.TRUSTONIC_TENANT || 'bantos-msp';

    if (!user || !pass) {
      throw new Error('Credenciales TRUSTONIC_USER o TRUSTONIC_PASS no configuradas en .env');
    }

    browser = await puppeteer.launch({
      headless: true, // Use headless mode for VPS
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage();
    
    // Configurar intercepción para atrapar la data en formato JSON directamente del API (opción A)
    let interceptedData = [];
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('/api/') && (url.includes('report') || url.includes('device'))) {
        try {
          if (response.request().method() !== 'OPTIONS' && response.ok()) {
            const json = await response.json();
            const items = json.items || json.data || json;
            if (Array.isArray(items)) {
              interceptedData = interceptedData.concat(items);
            }
          }
        } catch (e) {
          // ignore
        }
      }
    });

    // 1. Login
    console.log('>>> Navegando a Login...');
    await page.goto('https://portal.cloud.trustonic.com/login', { waitUntil: 'networkidle2' });
    
    await page.waitForSelector('input[name="username"], input[type="text"]', { timeout: 10000 });
    
    const inputs = await page.$$('input');
    for (const input of inputs) {
      const name = await (await input.getProperty('name')).jsonValue();
      const type = await (await input.getProperty('type')).jsonValue();
      
      if (name.toLowerCase().includes('user') || name.toLowerCase().includes('email') || type === 'email') {
        await input.type(user);
      } else if (type === 'password') {
        await input.type(pass);
      } else if (name.toLowerCase().includes('tenant') || name.toLowerCase().includes('account') || name.toLowerCase().includes('workspace')) {
        await input.type(tenant);
      }
    }
    
    const submitBtn = await page.$('button[type="submit"], input[type="submit"], button:not([type="button"])');
    if (submitBtn) {
      await submitBtn.click();
    } else {
      await page.keyboard.press('Enter');
    }

    // 2. Navegar a Reportes
    console.log('>>> Navegando a Reportes...');
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => console.log('Navegación lenta, continuando...'));
    await page.goto('https://portal.cloud.trustonic.com/reports', { waitUntil: 'networkidle2' });
    
    await new Promise(r => setTimeout(r, 8000));
    
    let dataToProcess = interceptedData;
    
    if (dataToProcess.length === 0) {
      console.log('>>> No se atraparon datos por red, intentando extraer tabla del DOM...');
      const tableRows = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('table tr, .table-row, [role="row"]'));
        return rows.slice(1).map(row => {
          const cells = Array.from(row.querySelectorAll('td, .table-cell, [role="gridcell"]')).map(cell => cell.innerText.trim());
          return cells;
        });
      });
      
      if (tableRows.length > 0) {
        dataToProcess = tableRows.map(cells => ({
          policyAssignmentTimestamp: cells[0], // Created_at (col 0)
          imei: cells[1] || cells[2], // asumiendo imei
          currentPolicy: cells[3] || 'Active', 
          deviceModelName: cells[4] || '', 
          owner: cells[5] || tenant
        }));
      }
    }

    console.log(`>>> Se extrajeron ${dataToProcess.length} registros (en crudo). Filtrando...`);

    let devicesBatch = [];
    let logsBatch = [];
    const batchLimit = 1000;

    for (const row of dataToProcess) {
      let rowDate = new Date();
      if (row.policyAssignmentTimestamp || row.Created_at || row.created_at || row.createdAt || row.date) {
        const dateStr = row.policyAssignmentTimestamp || row.Created_at || row.created_at || row.createdAt || row.date;
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) rowDate = d;
      }

      if (rowDate <= lastDate) {
        continue;
      }

      const imei1 = row.imei || row.IMEI || row.deviceId ? String(row.imei || row.IMEI || row.deviceId).trim() : null;
      if (!imei1 || !/^\d+$/.test(imei1)) continue;
      
      const rawOwner = row.owner || row.tenant || row.TenantId || row.Workspace ? String(row.owner || row.tenant || row.TenantId || row.Workspace).trim() : '';
      const tenantId = rawOwner.replace(/^\//, '') || tenant;
      
      const status = row.currentPolicy || row.status || row.Status ? String(row.currentPolicy || row.status || row.Status).trim() : 'Active';
      const deviceModelName = row.deviceModelName || row.model || row.Model ? String(row.deviceModelName || row.model || row.Model).trim() : '';
      
      let brand = null;
      let model = null;
      if (deviceModelName) {
        const parts = deviceModelName.split(' ');
        brand = parts[0];
        model = parts.slice(1).join(' ') || deviceModelName;
      }
      
      const lastAction = 'Actualización Web Scraper';

      devicesBatch.push({
        imei1, imei2: null, tenantId, service: 'PREPAID', status, brand, model, lastChange: rowDate, lastConn: rowDate
      });

      logsBatch.push({
        imei1, tenantId, lastChange: rowDate, lastAction, status, comment: 'Importado vía Scraper (Sync)'
      });

      if (devicesBatch.length >= batchLimit) {
        await flushDevices(devicesBatch);
        await flushLogs(logsBatch);
        newRecordsCount += devicesBatch.length;
        devicesBatch = [];
        logsBatch = [];
      }
    }

    if (devicesBatch.length > 0) {
      await flushDevices(devicesBatch);
      await flushLogs(logsBatch);
      newRecordsCount += devicesBatch.length;
    }

    console.log(`>>> Sincronización completada. Registros insertados: ${newRecordsCount}`);
    
    await pool.query(
      'INSERT INTO operation_logs (tenant_id, process_type, process_id, detail, status) VALUES (?, ?, ?, ?, ?)',
      [tenant, 'SYNC_TRUSTONIC', 'WEB_SCRAPER', JSON.stringify({ newRecords: newRecordsCount, date: new Date().toISOString() }), 'SUCCESS']
    );

    return { success: true, message: `Sincronización exitosa. Registros nuevos: ${newRecordsCount}`, count: newRecordsCount };

  } catch (error) {
    console.error('>>> Error en Sincronización Trustonic:', error);
    
    await pool.query(
      'INSERT INTO operation_logs (tenant_id, process_type, process_id, detail, status) VALUES (?, ?, ?, ?, ?)',
      ['bantos-msp', 'SYNC_TRUSTONIC', 'WEB_SCRAPER', JSON.stringify({ error: error.message }), 'FAILED']
    );
    
    return { success: false, message: `Error durante sincronización: ${error.message}` };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

if (process.argv[1] && process.argv[1].endsWith('trustonicScraper.js')) {
  runTrustonicSync().then(() => pool.end());
}
