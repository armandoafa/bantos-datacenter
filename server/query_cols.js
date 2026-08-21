import dotenv from 'dotenv';
dotenv.config();
import mysql from 'mysql2/promise';
async function run() {
  const pool = mysql.createPool({ host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASS, database: process.env.DB_NAME });
  try {
    const [cols] = await pool.query('SHOW COLUMNS FROM tenant_settings');
    console.log(cols);
  } catch(e) { console.error(e); }
  pool.end();
}
run();
