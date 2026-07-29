const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('https://manage.upya.io', { waitUntil: 'networkidle2' });
  await page.waitForSelector('input');
  const inputs = await page.$$('input');
  await inputs[0].type('armando.tecmobile');
  await inputs[1].type('123456!');
  const buttons = await page.$$('button');
  for (let btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && (text.toLowerCase().includes('log in') || text.toLowerCase().includes('login'))) {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 8000));
  
  const urls = [
    { name: 'clients', url: 'https://manage.upya.io/manage/clients' },
    { name: 'payments', url: 'https://manage.upya.io/manage/payments' },
    { name: 'deals', url: 'https://manage.upya.io/manage/deals' },
    { name: 'products', url: 'https://manage.upya.io/manage/products' }
  ];
  
  for (const item of urls) {
    console.log(`Navigating to ${item.name}...`);
    await page.goto(item.url, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 6000));
    await page.screenshot({ path: `scratch/${item.name}.png` });
    
    // Also dump the innerText of the main container
    const text = await page.evaluate(() => {
      const el = document.querySelector('.listContainer') || document.body;
      return el.innerText;
    });
    require('fs').writeFileSync(`scratch/${item.name}.txt`, text);
  }
  await browser.close();
})();
