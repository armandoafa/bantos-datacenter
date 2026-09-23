import puppeteer from 'puppeteer-core';
import dotenv from 'dotenv';
import pool from '../config/db.js';

dotenv.config();

(async () => {
  const targetTenant = 'c-romel';
  const [tenantRows] = await pool.query('SELECT upya_user, upya_pass FROM tenants WHERE tenant_id = ?', [targetTenant]);
  const syncUser = tenantRows[0]?.upya_user || process.env.UPYA_USER;
  const syncPass = tenantRows[0]?.upya_pass || process.env.UPYA_PASS;

  console.log('[TEST] Lanzando Puppeteer para robar token de LocalStorage...');
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
  
  console.log('Current URL:', page.url());
  const token = await page.evaluate(() => localStorage.getItem('userToken'));
  const allLs = await page.evaluate(() => JSON.stringify(localStorage));
  
  console.log(`[TEST] Token: ${token ? token.substring(0, 20) : 'null'}`);
  console.log(`[TEST] All LS: ${allLs ? allLs.substring(0, 100) : 'null'}`);
  
  if (token) {
    console.log(`[TEST] Probando API: https://api.upya.io/api/contracts/search`);
    const res = await fetch('https://api.upya.io/api/contracts/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ skip: 0, limit: 100 })
    });
    console.log(`[TEST] Status: ${res.status}`);
    const json = await res.json();
    console.log(`[TEST] Data keys:`, Object.keys(json));
  }
  
  await browser.close();
  process.exit(0);
})();
