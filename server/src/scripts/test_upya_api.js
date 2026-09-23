import pool from '../config/db.js';
import UpyaManageClient from '../../modules/upya-api-client/src/index.js';
import dotenv from 'dotenv';
dotenv.config();

(async () => {
  const targetTenant = 'c-romel';
  const [tenantRows] = await pool.query('SELECT upya_user, upya_pass FROM tenants WHERE tenant_id = ?', [targetTenant]);
  const syncUser = tenantRows[0]?.upya_user || process.env.UPYA_USER;
  const syncPass = tenantRows[0]?.upya_pass || process.env.UPYA_PASS;

  console.log('User:', syncUser);
  const upya = new UpyaManageClient(syncUser, syncPass, targetTenant);
  await upya.authenticate();
  try {
    const res = await upya.apiClient.post('/data/search/contracts', { query: { tenantId: targetTenant }, limit: 5 });
    console.log('SUCCESS:', res.data.length);
  } catch(e) {
    console.log('ERROR:', e.response?.status, e.message);
  }
  process.exit(0);
})();
