import fs from 'fs';
import pool from '../config/db.js';

(async () => {
  const [rows] = await pool.query("SELECT imei1, brand, model, status FROM trustonic_devices WHERE tenant_id='c-romel'");
  let csv = 'IMEI,Marca,Modelo,Estatus Trustonic,No. Contrato,Cliente\n';
  for (const r of rows) {
      csv += `${r.imei1},${r.brand || ''},${r.model || ''},${r.status || ''},,\n`;
  }
  fs.writeFileSync('devices_c_romel.csv', csv);
  process.exit(0);
})();
