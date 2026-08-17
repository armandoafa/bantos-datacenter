import puppeteer from 'puppeteer';

async function inspectRowHtml(username, password, domain) {
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

        const rowHtml = await page.evaluate(() => {
            const rows = Array.from(document.querySelectorAll('.ant-table-row'));
            return rows.length > 0 ? rows[0].outerHTML : "No rows found";
        });
        
        console.log('First Row HTML:', rowHtml);

    } catch (e) {
        console.error(e);
    } finally {
        await browser.close();
    }
}

inspectRowHtml('itdevelopment', 'Alika2012.', 'c-romel');
