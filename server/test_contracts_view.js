import puppeteer from 'puppeteer';
import fs from 'fs';

async function run() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  await page.goto('https://manage.upya.io/login', { waitUntil: 'networkidle2' });
  await page.type('input[type=\"text\"]', 'armando.tecmobile');
  await page.type('input[type=\"password\"]', '123456!');
  await page.click('button[type=\"submit\"]');
  await new Promise(r => setTimeout(r, 5000));
  
  await page.goto('https://manage.upya.io/contracts-view', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 5000));
  
  const text = await page.evaluate(() => document.body.innerText);
  console.log("Length:", text.length);
  fs.writeFileSync('contracts_view.txt', text);
  await browser.close();
}
run();
