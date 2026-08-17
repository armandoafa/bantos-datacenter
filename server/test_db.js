import pool from './src/config/db.js';
(async () => {
  const [rows] = await pool.query('SELECT upya_id, contract_number, status, LENGTH(signature_image) as sig_len FROM contract_history WHERE upya_id = "A83132828" OR contract_number = "A83132828"');
  console.log(rows);
  process.exit();
})();
