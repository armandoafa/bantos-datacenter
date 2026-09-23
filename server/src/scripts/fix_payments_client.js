import puppeteer from 'puppeteer-core';
import dotenv from 'dotenv';
import pool from '../config/db.js';

dotenv.config();

(async () => {
  const targetTenant = 'c-romel';
  const [tenantRows] = await pool.query('SELECT upya_user, upya_pass FROM tenants WHERE tenant_id = ?', [targetTenant]);
  const syncUser = tenantRows[0]?.upya_user || process.env.UPYA_USER;
  const syncPass = tenantRows[0]?.upya_pass || process.env.UPYA_PASS;

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium-browser',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  await page.goto('https://manage.upya.io/login', { waitUntil: 'domcontentloaded' });
  await page.type('input[type="text"]', syncUser);
  await page.type('input[type="password"]', syncPass);
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 6000));
  
  const token = await page.evaluate(() => localStorage.getItem('token'));
  
  if (token) {
      const orgId = '693c23abdb1eef001238619a';
      try {
          const res = await fetch(`https://api.upya.io/api/contracts/get/${orgId}`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({ fromPage: 1, pageSize: 100 })
          });
          const data = await res.json();
          const docs = data.docs || data.items || [];
          
          for (const c of docs) {
              const contractUpyaId = c._id;
              const clientNumber = c.client?.clientNumber || null;
              
              if (clientNumber) {
                  // Update contract_history
                  await pool.query(
                      `UPDATE contract_history SET client_number = ? WHERE upya_id = ? AND tenant_id = 'c-romel'`,
                      [clientNumber, contractUpyaId]
                  );
              }
          }
          
          // Now that contract_history has client_number, update payments
          await pool.query(
              `UPDATE payments p 
               JOIN contract_history c ON p.contract_id = c.contract_number 
               SET p.client_id = c.client_number 
               WHERE p.tenant_id = 'c-romel' AND c.client_number IS NOT NULL`
          );
          console.log("Updated contract_history and payments successfully.");
      } catch (e) {
          console.error("Error", e);
      }
  }
  
  await browser.close();
  process.exit(0);
})();
