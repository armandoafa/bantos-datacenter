import mysql from 'mysql2/promise';

async function test() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'rootpassword', // need to find the password, or check existing test_db.js
    database: 'bantos_datacenter'
  });
  
  try {
    const [invRows] = await pool.query('SELECT count(*) as count FROM inventory WHERE tenant_id = "c-romel"');
    console.log("Inventory count:", invRows[0].count);
    
    const [invSample] = await pool.query('SELECT serial_number FROM inventory WHERE tenant_id = "c-romel" LIMIT 5');
    console.log("Inventory sample:", invSample);

    const [trusRows] = await pool.query('SELECT count(*) as count FROM trustonic_devices WHERE tenant_id = "c-romel"');
    console.log("Trustonic count:", trusRows[0].count);
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
test();
