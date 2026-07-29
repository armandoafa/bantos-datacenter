import puppeteer from 'puppeteer';

async function run() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  let interceptedData = {};
  
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('/data/search/') && response.request().method() === 'POST') {
      try {
        const json = await response.json();
        console.log("Intercepted API:", url);
        interceptedData[url] = json;
      } catch (e) { }
    }
  });
  
  await page.goto('https://manage.upya.io/login', { waitUntil: 'networkidle2' });
  await page.type('input[type=\"text\"]', 'armando.tecmobile');
  await page.type('input[type=\"password\"]', '123456!');
  await page.click('button[type=\"submit\"]');
  await new Promise(r => setTimeout(r, 5000));
  
  await page.goto('https://manage.upya.io/contracts-view', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 3000));
  
  console.log("Got keys:", Object.keys(interceptedData));
  if (interceptedData['https://api.upya.io/data/search/contracts']) {
    console.log("Contracts Count:", interceptedData['https://api.upya.io/data/search/contracts'].data.length);
  }
  
  await browser.close();
}
run();
