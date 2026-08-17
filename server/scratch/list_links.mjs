import puppeteer from 'puppeteer';

async function listAllLinks(username, password, domain) {
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
        await new Promise(r => setTimeout(r, 10000));

        const links = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('a')).map(a => ({ href: a.href, html: a.innerHTML }));
        });
        
        console.log('Total links found:', links.length);
        console.log('Links detail:', JSON.stringify(links.filter(l => l.html.includes('svg') || l.href.includes('detail') || l.href.includes('device')), null, 2));

    } catch (e) {
        console.error(e);
    } finally {
        await browser.close();
    }
}

listAllLinks('itdevelopment', 'Alika2012.', 'c-romel');
