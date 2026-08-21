import pool from './src/config/db.js';

async function run() {
  try {
    const [c] = await pool.query("SHOW COLUMNS FROM client_history");
    console.log('client_history columns:', c.map(col => col.Field).join(', '));
    const [co] = await pool.query("SHOW COLUMNS FROM contract_history");
    console.log('contract_history columns:', co.map(col => col.Field).join(', '));
    const [p] = await pool.query("SHOW COLUMNS FROM payments");
    console.log('payments columns:', p.map(col => col.Field).join(', '));
  } catch (e) {
    console.error(e.message);
  }
  pool.end();
}
run();
