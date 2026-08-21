import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    const [rows] = await pool.query("SHOW CREATE TABLE user_scopes");
    console.log(rows[0]['Create Table']);
  } catch (e) {
    console.error(e.message);
  }
  pool.end();
}
run();
