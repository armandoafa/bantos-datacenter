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
  
  let myToken = null;
  await page.goto('https://manage.upya.io/login', { waitUntil: 'domcontentloaded' });
  await page.type('input[type="text"]', syncUser);
  await page.type('input[type="password"]', syncPass);
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 6000));
  
  myToken = await page.evaluate(() => localStorage.getItem('token'));
  
  if (myToken) {
     const res = await fetch('https://api.upya.io/api/contracts/6a1f5f32f99e8b0012258666', {
        headers: { 'Authorization': `Bearer ${myToken}`, 'Content-Type': 'application/json' }
     });
     const data = await res.json();
     console.log("Single contract response:", Object.keys(data));
     if (data.assets) console.log("Assets:", JSON.stringify(data.assets, null, 2));
     if (data.devices) console.log("Devices:", JSON.stringify(data.devices, null, 2));
     if (data.hardware) console.log("Hardware:", JSON.stringify(data.hardware, null, 2));
     if (data.basket) console.log("Basket:", JSON.stringify(data.basket, null, 2));
  }
  
  await browser.close();
  process.exit(0);
})();
