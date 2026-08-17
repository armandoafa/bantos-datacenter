import puppeteer from 'puppeteer';

async function clickDeviceRow(username, password, domain) {
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

        // Click the first row's first cell
        await page.evaluate(() => {
            const rows = Array.from(document.querySelectorAll('.ant-table-row'));
            if (rows.length > 0) {
                const cell = rows[0].querySelector('td');
                if (cell) cell.click();
            }
        });

        await new Promise(r => setTimeout(r, 5000));
        console.log('New URL after click:', page.url());
        
        await page.screenshot({ path: 'scratch/device_detail.png', fullPage: true });
        
        const tabs = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('.ant-tabs-tab')).map(t => t.innerText.trim());
        });
        console.log('Detail Tabs:', tabs);

    } catch (e) {
        console.error(e);
    } finally {
        await browser.close();
    }
}

clickDeviceRow('itdevelopment', 'Alika2012.', 'c-romel');
