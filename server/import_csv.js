import 'dotenv/config';
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import pool from './src/config/db.js';

async function importData() {
  console.log('Reading CSV file...');
  const csvData = fs.readFileSync('/var/www/bantos.cloud/bantos-datacenter/server/Summary.csv', 'utf-8');
  
  const records = parse(csvData, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true
  });

  console.log(`Found ${records.length} records. Importing to database...`);
  
  let inserted = 0;
  for (const record of records) {
    const imei = record['IMEI/SN'];
    if (!imei) continue;
    
    const tenant = record['Tenant id'] || 'bantos-msp';
    const service = record['Service'];
    
    // Solo importar PREPAID y POSTPAID
    if (service !== 'PREPAID' && service !== 'POSTPAID') {
      continue;
    }

    const tac = imei.substring(0, 8);
    const brand = record['Brand'];
    const model = record['Model'];
    const status = record['Current state'];
    
    let expiration = null;
    if (record['Expiration timestamp']) {
      expiration = record['Expiration timestamp'].split(' ')[0];
    }
    
    await pool.query(
        `INSERT INTO trustonic_inventory (imei, tenant, service, tac, brand, model, status, expiration_date, last_sync) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW()) 
         ON DUPLICATE KEY UPDATE 
         tenant=VALUES(tenant), service=VALUES(service), tac=VALUES(tac), brand=VALUES(brand), model=VALUES(model), status=VALUES(status), expiration_date=VALUES(expiration_date), last_sync=NOW()`,
        [imei, tenant, service, tac, brand, model, status, expiration]
    );
    inserted++;
  }
  
  console.log(`Import completed successfully! ${inserted} devices imported.`);
  process.exit(0);
}

importData().catch(console.error);
