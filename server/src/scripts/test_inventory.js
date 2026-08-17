import pool from '../config/db.js';

async function run() {
  try {
    const [inv] = await pool.query('SELECT serial_number, model FROM inventory WHERE tenant_id = "c-romel" LIMIT 5');
    console.log("INVENTORY:", inv);

    const [trus] = await pool.query('SELECT imei1, brand, model FROM trustonic_devices WHERE tenant_id = "c-romel" LIMIT 5');
    console.log("TRUSTONIC_DEVICES:", trus);
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
run();
