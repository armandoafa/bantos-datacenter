import puppeteer from 'puppeteer';

async function test() {
    console.log('launching...');
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    console.log('goto login...');
    await page.goto('https://portal.cloud.trustonic.com/login', { waitUntil: 'networkidle2', timeout: 60000 });
    
    console.log('wait for selector...');
    await page.waitForSelector('#login-form_username', { visible: true, timeout: 60000 });
    
    console.log('sleep 2000...');
    await new Promise(r => setTimeout(r, 2000));
    
    console.log('typing...');
    await page.type('#login-form_username', 'itdevelopment@bantos.mx');
    await page.type('#login-form_password', 'B4nt0s2026!#$');
    await page.type('#login-form_domain', 'bantos-msp');
    
    console.log('wait and click...');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }),
      page.click('button[type="submit"]')
    ]);

    console.log('login successful! goto smartphones...');
    await page.goto('https://portal.cloud.trustonic.com/smartphones', { waitUntil: 'networkidle2', timeout: 60000 });
    
    console.log('sleep 5000...');
    await new Promise(r => setTimeout(r, 5000));
    
    console.log('wait for table...');
    await page.waitForSelector('table', { timeout: 60000 });

    console.log('done! table found');
    await browser.close();
}
test().catch(console.error);
