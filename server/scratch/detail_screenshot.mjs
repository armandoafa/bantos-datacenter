import puppeteer from 'puppeteer';

async function screenshotDetail(username, password, domain) {
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

        const link = await page.evaluate(() => {
            const rows = Array.from(document.querySelectorAll('.ant-table-row'));
            const l = rows[0]?.querySelector('a.link-style');
            return l ? l.href : null;
        });
        
        if (link) {
            console.log('Navigating to:', link);
            await page.goto(link, { waitUntil: 'networkidle2' });
            await new Promise(r => setTimeout(r, 7000));
            await page.screenshot({ path: 'scratch/detail_page.png', fullPage: true });
            
            const tabs = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('.ant-tabs-tab')).map(t => t.innerText.trim());
            });
            console.log('Available Tabs:', tabs);
        }

    } catch (e) {
        console.error(e);
    } finally {
        await browser.close();
    }
}

screenshotDetail('itdevelopment', 'Alika2012.', 'c-romel');
