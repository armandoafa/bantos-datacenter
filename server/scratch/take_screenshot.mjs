import puppeteer from 'puppeteer';

async function takePortalScreenshot(username, password, domain) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    try {
        await page.goto('https://portal.cloud.trustonic.com/login', { waitUntil: 'networkidle2' });
        await page.type('#login-form_username', username);
        await page.type('#login-form_password', password);
        await page.type('#login-form_domain', domain);
        await page.click('button[type="submit"]');
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
        
        await page.goto('https://portal.cloud.trustonic.com/smartphones', { waitUntil: 'networkidle2' });
        await new Promise(r => setTimeout(r, 7000));

        await page.screenshot({ path: 'scratch/portal_smartphones.png', fullPage: true });
        console.log('Screenshot saved to scratch/portal_smartphones.png');

        const html = await page.evaluate(() => document.body.innerHTML.substring(0, 5000));
        console.log('HTML Snippet:', html);

    } catch (e) {
        console.error(e);
    } finally {
        await browser.close();
    }
}

takePortalScreenshot('itdevelopment', 'Alika2012.', 'c-romel');
