import pool from './src/config/db.js';

async function migrate() {
  try {
    console.log('Connected to DB, running migration...');
    
    const columns = [
      "ALTER TABLE tenant_settings ADD COLUMN whitelabel_name VARCHAR(255) DEFAULT NULL",
      "ALTER TABLE tenant_settings ADD COLUMN whitelabel_logo TEXT DEFAULT NULL",
      "ALTER TABLE tenant_settings ADD COLUMN upfront_type VARCHAR(50) DEFAULT 'Monto'",
      "ALTER TABLE tenant_settings ADD COLUMN interest_type VARCHAR(50) DEFAULT 'Porciento'",
      "ALTER TABLE client_history ADD COLUMN created_by_user_id INT DEFAULT NULL",
      "ALTER TABLE org_structure ADD COLUMN is_central_store TINYINT(1) DEFAULT 0",
      "UPDATE org_structure SET is_central_store = 1 WHERE tenant_id = 'c-romel' AND type = 'Manager' AND (name LIKE '%Tienda Central%' OR name LIKE '%Central%')",
      `CREATE TABLE IF NOT EXISTS tenant_api_keys (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tenant_id VARCHAR(100) NOT NULL,
        name VARCHAR(255) NOT NULL,
        api_key VARCHAR(100) NOT NULL UNIQUE,
        api_secret_hash VARCHAR(255) NOT NULL,
        scopes TEXT DEFAULT NULL,
        status ENUM('active', 'revoked') DEFAULT 'active',
        created_by_user_id INT NULL,
        last_used_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_tenant (tenant_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
    ];

    for (let q of columns) {
      try {
        await pool.query(q);
        console.log('Success:', q);
      } catch (e) {
        if (e.code !== 'ER_DUP_FIELDNAME') console.log('error:', e.message);
        else console.log('already exists for query:', q);
      }
    }
    
    console.log('Migration complete.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
