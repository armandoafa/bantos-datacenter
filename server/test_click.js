import puppeteer from 'puppeteer';
import fs from 'fs';

async function run() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  // Login
  await page.goto('https://manage.upya.io/login', { waitUntil: 'networkidle2' });
  await page.type('input[type=\"text\"]', 'armando.tecmobile');
  await page.type('input[type=\"password\"]', '123456!');
  await page.click('button[type=\"submit\"]');
  await new Promise(r => setTimeout(r, 5000));
  
  // Click "Manage" (href="/home")
  await page.click('a[href=\"/home\"]');
  await new Promise(r => setTimeout(r, 2000));
  
  // Click "Contracts" (href=\"/manage/contracts\")
  await page.click('a[href=\"/manage/contracts\"]');
  await new Promise(r => setTimeout(r, 4000));
  
  const text = await page.evaluate(() => document.body.innerText);
  console.log("InnerText length after clicking Contracts:", text.length);
  fs.writeFileSync('contracts_clicked.txt', text);
  
  await page.screenshot({ path: 'screenshot_contracts.png' });
  await browser.close();
}
run();
