import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

(async () => {
  const hash = await bcrypt.hash('123456!', 10);
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'adminbantosprompt',
    password: process.env.DB_PASS || 'adminbantosprompt2026',
    database: process.env.DB_NAME || 'bantosprompt502301_db',
  });
  
  await pool.query(
    'INSERT INTO users (upya_id, tenant_id, username, password, contact_name, role) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE password=VALUES(password), tenant_id=VALUES(tenant_id)',
    ['armando.tecmobile_id', 'tecmobile', 'armando.tecmobile', hash, 'Armando Tecmobile', 'admin']
  );
  
  console.log('User created/updated');
  process.exit(0);
})();
