import puppeteer from 'puppeteer';

async function test() {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.goto('https://portal.cloud.trustonic.com/login', { waitUntil: 'networkidle2' });
    await page.screenshot({ path: 'screenshot.png' });
    await browser.close();
}
test();
