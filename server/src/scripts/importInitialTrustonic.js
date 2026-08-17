import fs from 'fs';
import path from 'path';
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

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

async function run() {
  const refDir = '/var/www/bantos.cloud/bantos-datacenter/insight-client/ref';
  const files = fs.readdirSync(refDir).filter(f => f.endsWith('.csv'));
  
  console.log(`>>> Encontrados ${files.length} archivos CSV en ref.`);
  
  for (const file of files) {
    const filePath = path.join(refDir, file);
    console.log(`>>> Procesando archivo: ${file}`);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').filter(l => l.trim().length > 0);
    if (lines.length <= 1) continue;
    
    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase());
    
    const tenantIdx = headers.findIndex(h => h.includes('tenant'));
    const imei1Idx = headers.findIndex(h => h.includes('imei') || h.includes('sn'));
    const imei2Idx = headers.findIndex(h => h.includes('imei2'));
    const serviceIdx = headers.findIndex(h => h.includes('service'));
    const statusIdx = headers.findIndex(h => h.includes('state') || h.includes('status'));
    const brandIdx = headers.findIndex(h => h.includes('brand'));
    const modelIdx = headers.findIndex(h => h.includes('model'));
    const lastChangeIdx = headers.findIndex(h => h.includes('changed') || h.includes('change'));
    const lastConnIdx = headers.findIndex(h => h.includes('checkin') || h.includes('connection'));
    const lastActionIdx = headers.findIndex(h => h.includes('last action') || h.includes('action'));

    let count = 0;
    for (let i = 1; i < lines.length; i++) {
      const cols = parseCSVLine(lines[i]);
      const imei1 = imei1Idx !== -1 ? cols[imei1Idx] : null;
      if (!imei1 || !/^\d+$/.test(imei1)) continue;
      
      const tenantId = tenantIdx !== -1 ? cols[tenantIdx] : 'bantos-msp';
      const imei2 = imei2Idx !== -1 ? cols[imei2Idx] : null;
      const service = serviceIdx !== -1 ? cols[serviceIdx] : 'PREPAID';
      const status = statusIdx !== -1 ? cols[statusIdx] : 'Active';
      const brand = brandIdx !== -1 ? cols[brandIdx] : null;
      const model = modelIdx !== -1 ? cols[modelIdx] : null;
      
      let lastChangeVal = lastChangeIdx !== -1 ? cols[lastChangeIdx] : null;
      let lastConnVal = lastConnIdx !== -1 ? cols[lastConnIdx] : null;
      
      // Intentar parsear las fechas o usar actual
      let lastChange = new Date();
      if (lastChangeVal) {
        const d = new Date(lastChangeVal);
        if (!isNaN(d.getTime())) lastChange = d;
      }
      
      let lastConn = null;
      if (lastConnVal) {
        const d = new Date(lastConnVal);
        if (!isNaN(d.getTime())) lastConn = d;
      }
      
      const lastAction = lastActionIdx !== -1 && cols[lastActionIdx] ? cols[lastActionIdx] : 'Carga Inicial (Consolidado)';

      // Insert/Update dispositivo
      await pool.query(
        `INSERT INTO trustonic_devices (imei1, imei2, tenant_id, service, status, brand, model, last_change, last_connection) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE 
         status=VALUES(status), last_change=VALUES(last_change), last_connection=VALUES(last_connection)`,
        [imei1, imei2 || null, tenantId || 'bantos-msp', service, status, brand, model, lastChange, lastConn]
      );

      // Insert log histórico
      await pool.query(
        `INSERT IGNORE INTO trustonic_logs (imei1, tenant_id, operation_date, operation_type, status, comment) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [imei1, tenantId || 'bantos-msp', lastChange, lastAction, status, 'Importado de reporte inicial']
      );
      
      count++;
    }
    console.log(`>>> Guardados/Actualizados ${count} dispositivos desde ${file}`);
  }
  
  await pool.end();
  console.log('>>> Importación inicial completada con éxito.');
}

run().catch(console.error);
