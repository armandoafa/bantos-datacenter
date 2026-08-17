import puppeteer from 'puppeteer';

async function findLinkBetter(username, password, domain) {
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

        const data = await page.evaluate(() => {
            const allLinks = Array.from(document.querySelectorAll('a')).map(a => ({ href: a.href, text: a.innerText }));
            const rows = Array.from(document.querySelectorAll('.ant-table-row'));
            const firstRowHtml = rows[0]?.outerHTML;
            return { allLinks: allLinks.filter(l => l.href.includes('/smartphones/')), firstRowHtml };
        });
        
        console.log('Links found:', JSON.stringify(data.allLinks, null, 2));
        console.log('First Row HTML Snippet:', data.firstRowHtml?.substring(0, 1000));

    } catch (e) {
        console.error(e);
    } finally {
        await browser.close();
    }
}

findLinkBetter('itdevelopment', 'Alika2012.', 'c-romel');
