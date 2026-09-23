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
    if (response.url().includes('api.upya.io/api/assets/get/') || response.url().includes('/search')) {
       try {
           const json = await response.json();
           const docs = json.docs || json.items || (Array.isArray(json)? json : []);
           if (docs.length > 0) {
               console.log("--- FOUND ASSETS FROM", response.url());
               console.log("Keys:", Object.keys(docs[0]));
               console.log("Sample serialNumber/IMEI:", docs[0].serialNumber, docs[0].imei, docs[0].assetNumber);
               console.log("Contract Ref:", docs[0].contract, docs[0].contractNumber);
           }
       } catch (e) {}
    }
  });

  await page.goto('https://manage.upya.io/login', { waitUntil: 'domcontentloaded' });
  await page.type('input[type="text"]', syncUser);
  await page.type('input[type="password"]', syncPass);
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 6000));
  
  console.log("Navigating to assets-view...");
  try { await page.goto('https://manage.upya.io/assets-view', { waitUntil: 'domcontentloaded' }); } catch(e){}
  await new Promise(r => setTimeout(r, 6000));
  
  console.log("Navigating to devices-view just in case...");
  try { await page.goto('https://manage.upya.io/devices-view', { waitUntil: 'domcontentloaded' }); } catch(e){}
  await new Promise(r => setTimeout(r, 6000));

  await browser.close();
  process.exit(0);
})();
