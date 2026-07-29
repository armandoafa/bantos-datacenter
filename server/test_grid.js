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
  
  await page.goto('https://manage.upya.io/contracts-view', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 4000));
  
  const data = await page.evaluate(() => {
    const grid = Array.from(document.querySelectorAll('div')).find(div => div.children.length >= 20 && div.innerText.includes('PEN'));
    if (!grid) return null;
    const rows = Array.from(grid.children);
    return rows.map(r => r.innerText.split('\n').map(t=>t.trim()).filter(Boolean));
  });
  console.log("Rows found:", data?.length);
  if (data && data.length > 0) console.log("First row:", data[0]);
  if (data && data.length > 1) console.log("Second row:", data[1]);
  await browser.close();
}
run();
