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
  
  page.on('response', async (response) => {
    if (response.url().includes('api.upya.io/api/contracts/get/')) {
       try {
           const json = await response.json();
           const docs = json.docs || json.items || (Array.isArray(json)? json : []);
           if (docs.length > 0) {
               console.log("Basket:", JSON.stringify(docs[0].basket, null, 2));
               console.log("Deal:", JSON.stringify(docs[0].deal, null, 2));
           }
       } catch (e) {}
    }
  });

  await page.goto('https://manage.upya.io/login', { waitUntil: 'domcontentloaded' });
  await page.type('input[type="text"]', syncUser);
  await page.type('input[type="password"]', syncPass);
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 6000));
  
  await page.goto('https://manage.upya.io/contracts-view', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 6000));
  
  await browser.close();
  process.exit(0);
})();
