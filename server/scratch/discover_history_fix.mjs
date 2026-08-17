import puppeteer from 'puppeteer';

async function discoverDeviceHistoryFix(username, password, domain) {
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

        // Get the link for the first device in the table
        const deviceLink = await page.evaluate(() => {
            const table = document.querySelector('table');
            if (!table) return "Table not found";
            const row = table.querySelector('.ant-table-row');
            if (!row) return "Row not found";
            // The IMEI is a link in the first cell usually
            const link = row.querySelector('a');
            return link ? link.href : "Link not found in row";
        });
        
        console.log('Real Device Detail Link:', deviceLink);
        
        if (deviceLink && deviceLink.startsWith('http')) {
            await page.goto(deviceLink, { waitUntil: 'networkidle2' });
            await new Promise(r => setTimeout(r, 5000));
            
            const detailInfo = await page.evaluate(() => {
                const tabs = Array.from(document.querySelectorAll('.ant-tabs-tab')).map(t => t.innerText.trim());
                return { tabs };
            });
            
            console.log('Tabs available:', detailInfo.tabs);
            
            // Try to find "Historial de dispositivos" or "Device History"
            const historyTab = detailInfo.tabs.find(t => t.includes('Historial') || t.includes('History'));
            console.log('History tab:', historyTab);

            if (historyTab) {
                // Click it
                await page.evaluate((name) => {
                    const el = Array.from(document.querySelectorAll('.ant-tabs-tab')).find(t => t.innerText.includes(name));
                    if (el) el.click();
                }, historyTab);
                await new Promise(r => setTimeout(r, 5000));
                
                const data = await page.evaluate(() => {
                    const table = document.querySelector('.ant-tabs-tabpane-active table');
                    if (!table) return "Table not found in active tab";
                    const rows = Array.from(table.querySelectorAll('tr'));
                    return rows.map(r => Array.from(r.querySelectorAll('td,th')).map(td => td.innerText.trim()));
                });
                console.log('History Data:', JSON.stringify(data, null, 2));
            }
        }

    } catch (e) {
        console.error(e);
    } finally {
        await browser.close();
    }
}

discoverDeviceHistoryFix('itdevelopment', 'Alika2012.', 'c-romel');
