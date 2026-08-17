import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

async function run() {
  const [prods] = await pool.query('SELECT id, name, model, reference FROM products WHERE name LIKE "%MOTO G06%"');
  console.log('Products:', prods);
  const [inv] = await pool.query('SELECT id, model, variant, status, assigned_to_user_id FROM inventory WHERE model LIKE "%MOTO G06%"');
  console.log('Inventory:', inv);
  process.exit();
}
run();
