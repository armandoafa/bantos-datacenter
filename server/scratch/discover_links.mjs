import puppeteer from 'puppeteer';

async function discoverLinks(username, password, domain) {
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
        
        console.log('Login successful');
        
        // Extract all links
        const links = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('a')).map(a => ({
                text: a.innerText.trim(),
                href: a.href
            }));
        });
        
        console.log('Found links:', JSON.stringify(links, null, 2));
        
        // Go to smartphones page and check submenus
        await page.goto('https://portal.cloud.trustonic.com/smartphones', { waitUntil: 'networkidle2' });
        await new Promise(r => setTimeout(r, 5000));
        
        const subLinks = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('a')).map(a => ({
                text: a.innerText.trim(),
                href: a.href
            }));
        });
        console.log('Smartphones page links:', JSON.stringify(subLinks, null, 2));

    } catch (e) {
        console.error(e);
    } finally {
        await browser.close();
    }
}

discoverLinks('itdevelopment', 'Alika2012.', 'c-romel');
