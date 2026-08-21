const mysql = require('mysql2/promise');
require('dotenv').config({ path: 'server/.env' });
async function run() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  
  const [users] = await pool.query('SELECT u.id, u.username, u.role as global_role FROM users u WHERE u.tenant_id = ?', ['c-romel']);
  console.log("Users:", users.length, users);
  
  const [usersJoin] = await pool.query(`SELECT u.id, u.username, COALESCE(u.contact_name, u.username) as contact_name, u.email, u.role as global_role, u.store_id, 
              s.org_id, s.role as scope_role, o.name as org_name
       FROM users u 
       LEFT JOIN user_scopes s ON u.id = s.user_id 
       LEFT JOIN org_structure o ON s.org_id = o.id
       WHERE u.tenant_id = ?`, ['c-romel']);
  console.log("Users with join:", usersJoin.length, usersJoin);

  const [orgs] = await pool.query('SELECT * FROM org_structure WHERE tenant_id = ?', ['c-romel']);
  console.log("Orgs:", orgs.length, orgs);
  
  pool.end();
}
run();
