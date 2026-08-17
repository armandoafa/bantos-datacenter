import puppeteer from 'puppeteer';

async function inspectReports(username, password, domain) {
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
        
        await page.goto('https://portal.cloud.trustonic.com/reports', { waitUntil: 'networkidle2' });
        await new Promise(r => setTimeout(r, 5000));

        const content = await page.evaluate(() => {
            return {
                text: document.body.innerText.substring(0, 3000),
                links: Array.from(document.querySelectorAll('a')).map(a => a.innerText + ' -> ' + a.href)
            };
        });
        
        console.log('Reports Body Text:', content.text);
        console.log('Reports Links:', content.links);

    } catch (e) {
        console.error(e);
    } finally {
        await browser.close();
    }
}

inspectReports('itdevelopment', 'Alika2012.', 'c-romel');
