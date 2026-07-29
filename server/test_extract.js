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
  
  await page.goto('https://manage.upya.io/payments-view', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 4000));
  
  const extractedRows = await page.evaluate(() => {
    const grids = Array.from(document.querySelectorAll('div')).filter(div => div.children.length >= 2);
    const bestGrid = grids.sort((a,b) => b.children.length - a.children.length)[0];
    
    if (!bestGrid || bestGrid.children.length < 2) return [];
    
    const rows = Array.from(bestGrid.children);
    return rows.map(row => {
      // Instead of splitting innerText, let's extract by child nodes if possible
      if (row.children.length > 0) {
        return Array.from(row.children).map(cell => cell.innerText.trim());
      }
      return row.innerText.split('\n').map(t => t.trim()).filter(Boolean);
    });
  });

  console.log("Headers:", extractedRows[0]);
  console.log("Row 1:", extractedRows[1]);
  await browser.close();
}
run();
