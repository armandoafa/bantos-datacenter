import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

async function run() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  try {
    const [rows] = await pool.query("SHOW CREATE TABLE client_history");
    console.log('--- client_history ---');
    console.log(rows[0]['Create Table']);
    
    const [rows2] = await pool.query("SHOW CREATE TABLE contract_history");
    console.log('--- contract_history ---');
    console.log(rows2[0]['Create Table']);

    const [rows3] = await pool.query("SHOW CREATE TABLE payments");
    console.log('--- payments ---');
    console.log(rows3[0]['Create Table']);
  } catch (e) {
    console.error(e.message);
  }
  pool.end();
}
run();
