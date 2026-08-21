import pool from './config/db.js';

async function run() {
  try {
    const [rows] = await pool.query("SHOW CREATE TABLE client_history");
    console.log(rows[0]['Create Table']);
    const [rows2] = await pool.query("SHOW CREATE TABLE deals");
    console.log(rows2[0]['Create Table']);
  } catch (e) {
    console.error(e.message);
  }
  pool.end();
}
run();
