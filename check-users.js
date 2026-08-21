import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config({ path: 'server/.env' });

async function run() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const [rows] = await pool.query("DESCRIBE users");
  console.log("users columns:", rows.map(r => r.Field));
  pool.end();
}
run();
