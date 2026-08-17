import puppeteer from 'puppeteer';
import fs from 'fs';

async function run() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  let intercepted = {};
  
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('/api/') && url.includes('/search')) {
      try {
        const json = await response.json();
        const moduleMatch = url.match(/api\/([^\/]+)\/search/);
        if (moduleMatch) {
            intercepted[moduleMatch[1]] = json;
            console.log(`Intercepted ${moduleMatch[1]}:`, Array.isArray(json) ? json.length : json.data?.length || 0);
        }
      } catch (e) { }
    }
  });
  
  await page.goto('https://manage.upya.io/login', { waitUntil: 'networkidle2' });
  await page.type('input[type=\"text\"]', 'armando.tecmobile');
  await page.type('input[type=\"password\"]', '123456!');
  await page.click('button[type=\"submit\"]');
  await new Promise(r => setTimeout(r, 5000));
  
  await page.goto('https://manage.upya.io/contracts-view', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 5000));
  
  await page.goto('https://manage.upya.io/clients-view', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 5000));

  console.log("Keys:", Object.keys(intercepted));
  fs.writeFileSync('intercepted.json', JSON.stringify(intercepted, null, 2));
  
  await browser.close();
}
run();
