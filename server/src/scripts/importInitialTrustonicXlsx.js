import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import xlsx from 'xlsx';

const { readFile, utils } = xlsx;

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'adminbantosprompt',
  password: process.env.DB_PASSWORD || 'adminbantosprompt2026',
  database: process.env.DB_NAME || 'bantosprompt502301_db',
  waitForConnections: true,
  connectionLimit: 10
});

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

async function run() {
  const ref2Dir = '/var/www/bantos.cloud/bantos-datacenter/insight-client/ref/2.0';
  const files = fs.readdirSync(ref2Dir).filter(f => f.endsWith('.xlsx'));
  
  console.log(`>>> Encontrados ${files.length} archivos XLSX en ref/2.0.`);
  
  for (const file of files) {
    const filePath = path.join(ref2Dir, file);
    console.log(`>>> Cargando y leyendo archivo: ${file} (puede tomar unos segundos)...`);
    
    const workbook = readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = utils.sheet_to_json(sheet);
    
    console.log(`>>> Procesando ${rows.length} filas desde ${file}...`);
    if (rows.length === 0) continue;

    let devicesBatch = [];
    let logsBatch = [];
    const batchLimit = 1000;
    let count = 0;

    for (const row of rows) {
      const imei1 = row.imei ? String(row.imei).trim() : null;
      if (!imei1 || !/^\d+$/.test(imei1)) continue;
      
      const rawOwner = row.owner ? String(row.owner).trim() : '';
      const tenantId = rawOwner.replace(/^\//, '') || 'bantos-msp';
      
      const status = row.currentPolicy ? String(row.currentPolicy).trim() : 'Active';
      const deviceModelName = row.deviceModelName ? String(row.deviceModelName).trim() : '';
      
      let brand = null;
      let model = null;
      if (deviceModelName) {
        const parts = deviceModelName.split(' ');
        brand = parts[0];
        model = parts.slice(1).join(' ') || deviceModelName;
      }
      
      let lastChange = new Date();
      if (row.policyAssignmentTimestamp) {
        const d = new Date(row.policyAssignmentTimestamp);
        if (!isNaN(d.getTime())) lastChange = d;
      }
      
      let lastConn = null;
      if (row.lastContactTimestamp) {
        const d = new Date(row.lastContactTimestamp);
        if (!isNaN(d.getTime())) lastConn = d;
      }
      
      const lastAction = row.desiredPolicyName ? `Policy: ${row.desiredPolicyName}` : 'Carga Inicial (Consolidado 2.0)';

      devicesBatch.push({
        imei1, imei2: null, tenantId, service: 'PREPAID', status, brand, model, lastChange, lastConn
      });

      logsBatch.push({
        imei1, tenantId, lastChange, lastAction, status, comment: 'Importado de reporte consolidado 2.0'
      });

      if (devicesBatch.length >= batchLimit) {
        await flushDevices(devicesBatch);
        await flushLogs(logsBatch);
        count += devicesBatch.length;
        devicesBatch = [];
        logsBatch = [];
      }
    }

    // Flush remaining
    if (devicesBatch.length > 0) {
      await flushDevices(devicesBatch);
      await flushLogs(logsBatch);
      count += devicesBatch.length;
    }

    console.log(`>>> Guardados/Actualizados ${count} dispositivos desde ${file}`);
  }
  
  await pool.end();
  console.log('>>> Importación inicial 2.0 completada con éxito.');
}

run().catch(console.error);
