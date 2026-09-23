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
           for (const c of docs) {
               if (c.client && c.client._id) {
                   const upyaClientId = c.client._id;
                   const clientNumber = c.client.clientNumber || null;
                   const firstName = c.client.profile?.firstName || '';
                   const lastName = c.client.profile?.lastName || '';
                   const fullName = `${firstName} ${lastName}`.trim();
                   const contractId = c._id;
                   const contractNumber = c.contractNumber || null;
                   
                   if (fullName) {
                       // Actualizar en client_history donde upya_id coincide con upyaClientId O client_number coincide con clientNumber
                       console.log(`Fixing client ${upyaClientId} / ${clientNumber} -> ${fullName}`);
                       await pool.query(
                           `UPDATE client_history SET name=?, first_name=?, last_name=?, client_number=COALESCE(client_number, ?) WHERE (upya_id=? OR client_number=?) AND tenant_id='c-romel'`,
                           [fullName, firstName, lastName, clientNumber, upyaClientId, clientNumber]
                       );
                   }
                   
                   // También vamos a fijar contract_history para que tenga el client_number correcto y client_id correcto
                   if (contractId) {
                       await pool.query(
                           `UPDATE contract_history SET client_id=?, client_number=? WHERE upya_id=? AND tenant_id='c-romel'`,
                           [upyaClientId, clientNumber, contractId]
                       );
                   }
               }
           }
       } catch (e) {
           console.error("Error processing response", e);
       }
    }
  });

  await page.goto('https://manage.upya.io/login', { waitUntil: 'domcontentloaded' });
  await page.type('input[type="text"]', syncUser);
  await page.type('input[type="password"]', syncPass);
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 6000));
  
  await page.goto('https://manage.upya.io/contracts-view', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 8000));
  
  console.log("Script finalizado, actualizando base de datos.");
  await browser.close();
  process.exit(0);
})();
