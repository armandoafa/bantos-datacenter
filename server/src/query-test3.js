import pool from './config/db.js';

async function run() {
  try {
    const [rows] = await pool.query("SHOW CREATE TABLE user_scopes");
    console.log(rows[0]['Create Table']);
  } catch (e) {
    console.error(e.message);
  }
  pool.end();
}
run();
