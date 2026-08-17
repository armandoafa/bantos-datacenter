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
  
  const modules = [
    { url: 'contracts-view', kw: 'ContractNumber' },
    { url: 'clients-view', kw: 'ClientId' },
    { url: 'payments-view', kw: 'Payment' },
    { url: 'products', kw: 'Product' },
    { url: 'deals', kw: 'Deal' }
  ];
  
  for (const mod of modules) {
    await page.goto(`https://manage.upya.io/${mod.url}`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 3000));
    
    const headers = await page.evaluate(() => {
      // Intentar buscar la cuadrícula encontrando un div que contenga varios hijos y que el primer hijo parezca un header
      const grids = Array.from(document.querySelectorAll('div')).filter(div => div.children.length >= 2);
      // Buscar el grid que tenga mayor cantidad de texto o algo así
      const best = grids.sort((a,b) => b.children.length - a.children.length)[0];
      if (!best) return null;
      return Array.from(best.children).slice(0,2).map(r => r.innerText.replace(/\n/g, ' | '));
    });
    console.log(`${mod.url} Headers/Rows:`, headers);
  }
  
  await browser.close();
}
run();
