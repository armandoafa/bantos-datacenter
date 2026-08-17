import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function run() {
  const [rows] = await pool.query('SELECT store_id, agent, COUNT(*) as count FROM client_history GROUP BY store_id, agent');
  console.log('Client History breakdown:', rows);
  process.exit(0);
}
run();
