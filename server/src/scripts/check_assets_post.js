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
     const endpoints = [
         `https://api.upya.io/api/assets/search/${orgId}`,
         `https://api.upya.io/api/devices/search/${orgId}`,
         `https://api.upya.io/api/devices/get/${orgId}`,
         `https://api.upya.io/api/assets/get/${orgId}`
     ];
     
     for (const ep of endpoints) {
         try {
             const res = await fetch(ep, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ fromPage: 1, pageSize: 20 })
             });
             const data = await res.json();
             console.log("Endpoint:", ep);
             console.log("Keys:", Object.keys(data));
             const docs = data.docs || data.items || (Array.isArray(data) ? data : []);
             if (docs.length > 0) {
                 console.log("Found", docs.length, "items!");
                 console.log("Keys of first item:", Object.keys(docs[0]));
                 console.log("IMEI:", docs[0].imei || docs[0].serialNumber);
                 console.log("Contract:", docs[0].contract || docs[0].contractRef);
             } else {
                 console.log("Empty or no docs.");
             }
         } catch (e) {
             console.log("Failed", ep);
         }
     }
  }
  
  await browser.close();
  process.exit(0);
})();
