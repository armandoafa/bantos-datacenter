const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('api.upya.io') || url.includes('firestore')) {
      try {
        const text = await response.text();
        console.log('--- RESPONSE FROM:', url);
        console.log(text.substring(0, 300) + '...\n');
      } catch(e) {}
    }
  });
  
  console.log('Navigating to manage.upya.io...');
  await page.goto('https://manage.upya.io', { waitUntil: 'networkidle2' });
  
  console.log('Typing credentials...');
  await page.waitForSelector('input');
  const inputs = await page.$$('input');
  await inputs[0].type('armando.tecmobile');
  await inputs[1].type('123456!');
  
  console.log('Clicking login...');
  const buttons = await page.$$('button');
  for (let btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.toLowerCase().includes('log in') || text.toLowerCase().includes('login') || text.toLowerCase().includes('sign in')) {
      await btn.click();
      break;
    }
  }
  
  console.log('Waiting 10s to capture dashboard requests...');
  await new Promise(r => setTimeout(r, 10000));
  
  // Try navigating to contracts
  console.log('Navigating to Contracts...');
  await page.goto('https://manage.upya.io/manage/contracts', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 5000));

  await browser.close();
})();
