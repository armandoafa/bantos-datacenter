import pool from './src/config/db.js';

async function run() {
  try {
    const [rows] = await pool.query(`
      SELECT id, upya_id, transaction_id, client_id, amount, method, status, payment_date
      FROM payments 
      WHERE payment_date >= '2026-08-20' AND payment_date < '2026-08-21' AND amount = 5
    `);
    console.log(JSON.stringify(rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}
run();
