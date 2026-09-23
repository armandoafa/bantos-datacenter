import puppeteer from 'puppeteer-core';
import dotenv from 'dotenv';
import pool from '../config/db.js';
import fs from 'fs';

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
  await page.setViewport({ width: 1366, height: 768 });

  await page.goto('https://manage.upya.io/login', { waitUntil: 'domcontentloaded' });
  await page.type('input[type="text"]', syncUser);
  await page.type('input[type="password"]', syncPass);
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 8000));
  
  await page.goto('https://manage.upya.io/contracts-view', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 8000));
  
  const html = await page.evaluate(() => document.body.innerHTML);
  fs.writeFileSync('upya_contracts.html', html);
  
  await browser.close();
  console.log('Saved upya_contracts.html');
  process.exit(0);
})();
