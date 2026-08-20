import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function migrate() {
  try {
    const pool = mysql.createPool(process.env.DATABASE_URL);
    console.log('Connected to DB, running migration...');
    
    try {
      await pool.query("ALTER TABLE tenant_settings ADD COLUMN upfront_type VARCHAR(50) DEFAULT 'Monto'");
      console.log('Added upfront_type column.');
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME') console.log('upfront_type error:', e.message);
      else console.log('upfront_type already exists.');
    }
    
    try {
      await pool.query("ALTER TABLE tenant_settings ADD COLUMN interest_type VARCHAR(50) DEFAULT 'Porciento'");
      console.log('Added interest_type column.');
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME') console.log('interest_type error:', e.message);
      else console.log('interest_type already exists.');
    }
    
    console.log('Migration complete.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
