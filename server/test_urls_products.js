import puppeteer from 'puppeteer';

async function run() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('https://manage.upya.io/login', { waitUntil: 'networkidle2' });
  await page.type('input[type=\"text\"]', 'armando.tecmobile');
  await page.type('input[type=\"password\"]', '123456!');
  await page.click('button[type=\"submit\"]');
  await new Promise(r => setTimeout(r, 5000));
  
  for (const mod of ['products', 'deals', 'manage/products', 'manage/deals', 'inventory']) {
    await page.goto(`https://manage.upya.io/${mod}`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 3000));
    const len = await page.evaluate(() => document.body.innerText.length);
    console.log(`${mod} Length:`, len);
  }
  await browser.close();
}
run();
