import puppeteer from 'puppeteer';

async function checkReports(username, password, domain) {
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
        
        console.log('Clicking INFORMES...');
        // Find link with text INFORMES
        await page.evaluate(() => {
            const link = Array.from(document.querySelectorAll('a, span')).find(el => el.innerText.includes('INFORMES'));
            if (link) link.click();
        });
        await new Promise(r => setTimeout(r, 7000));
        
        await page.screenshot({ path: 'scratch/reports_page.png', fullPage: true });
        
        const reports = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('a, .ant-list-item')).map(el => el.innerText.trim());
        });
        console.log('Available Reports:', reports);

    } catch (e) {
        console.error(e);
    } finally {
        await browser.close();
    }
}

checkReports('itdevelopment', 'Alika2012.', 'c-romel');
