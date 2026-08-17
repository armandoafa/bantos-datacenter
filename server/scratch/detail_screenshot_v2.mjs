import puppeteer from 'puppeteer';

async function screenshotDetailV2(username, password, domain) {
    console.log('Starting...');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    try {
        console.log('Logging in...');
        await page.goto('https://portal.cloud.trustonic.com/login', { waitUntil: 'networkidle2' });
        await page.type('#login-form_username', username);
        await page.type('#login-form_password', password);
        await page.type('#login-form_domain', domain);
        await page.click('button[type="submit"]');
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
        
        console.log('Going to smartphones list...');
        await page.goto('https://portal.cloud.trustonic.com/smartphones', { waitUntil: 'networkidle2' });
        await new Promise(r => setTimeout(r, 8000));

        const link = await page.evaluate(() => {
            const table = document.querySelector('table');
            if (!table) return null;
            const rows = Array.from(table.querySelectorAll('.ant-table-row'));
            const l = rows[0]?.querySelector('a.link-style');
            return l ? l.href : null;
        });
        
        console.log('Found link:', link);
        
        if (link) {
            console.log('Navigating to detail...');
            await page.goto(link, { waitUntil: 'networkidle2' });
            await new Promise(r => setTimeout(r, 8000));
            await page.screenshot({ path: 'scratch/detail_v2.png', fullPage: true });
            console.log('Screenshot saved.');
            
            const info = await page.evaluate(() => {
                const tabs = Array.from(document.querySelectorAll('.ant-tabs-tab')).map(t => t.innerText.trim());
                const activeTab = document.querySelector('.ant-tabs-tab-active')?.innerText.trim();
                return { tabs, activeTab };
            });
            console.log('Info:', info);
        } else {
            console.log('No link found to click!');
        }

    } catch (e) {
        console.error('ERROR:', e.message);
    } finally {
        await browser.close();
        console.log('Browser closed.');
    }
}

screenshotDetailV2('itdevelopment', 'Alika2012.', 'c-romel');
