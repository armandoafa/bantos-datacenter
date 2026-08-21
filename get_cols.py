import subprocess
try:
    ssh_cmd = "ssh -o StrictHostKeyChecking=no root@72.62.128.126 'cd /var/www/bantos.cloud/bantos-datacenter/server && node -e \"import dotenv from \\\"dotenv\\\"; dotenv.config(); import mysql from \\\"mysql2/promise\\\"; async function run() { const pool = mysql.createPool({ host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASS, database: process.env.DB_NAME }); try { const [cols] = await pool.query(\\\"SHOW COLUMNS FROM tenant_settings\\\"); console.log(cols); } catch(e) { console.error(e); } pool.end(); } run();\"'"
    result = subprocess.run(ssh_cmd, shell=True, capture_output=True, text=True)
    print(result.stdout)
except Exception as e:
    print(e)
