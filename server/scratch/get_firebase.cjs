const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('https://manage.upya.io', { waitUntil: 'networkidle2' });
  const html = await page.content();
  require('fs').writeFileSync('scratch/manage_html.txt', html);
  await browser.close();
})();
