import pool from './src/config/db.js';

async function migrate() {
  try {
    console.log('Connected to DB, running migration...');
    
    const columns = [
      "ALTER TABLE tenant_settings ADD COLUMN whitelabel_name VARCHAR(255) DEFAULT NULL",
      "ALTER TABLE tenant_settings ADD COLUMN whitelabel_logo TEXT DEFAULT NULL",
      "ALTER TABLE tenant_settings ADD COLUMN upfront_type VARCHAR(50) DEFAULT 'Monto'",
      "ALTER TABLE tenant_settings ADD COLUMN interest_type VARCHAR(50) DEFAULT 'Porciento'",
      "ALTER TABLE client_history ADD COLUMN created_by_user_id INT DEFAULT NULL"
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
