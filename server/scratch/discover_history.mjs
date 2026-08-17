import puppeteer from 'puppeteer';

async function discoverDeviceHistory(username, password, domain) {
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
        await new Promise(r => setTimeout(r, 5000));

        // Get the link for the first device
        const deviceLink = await page.evaluate(() => {
            const rows = Array.from(document.querySelectorAll('.ant-table-row'));
            for (const row of rows) {
                const link = row.querySelector('a');
                if (link && link.href.includes('/smartphones/')) {
                    return link.href;
                }
            }
            return null;
        });
        
        console.log('Navigating to device detail:', deviceLink);
        
        if (deviceLink) {
            await page.goto(deviceLink, { waitUntil: 'networkidle2' });
            await new Promise(r => setTimeout(r, 5000));
            
            const detailInfo = await page.evaluate(() => {
                const tabs = Array.from(document.querySelectorAll('.ant-tabs-tab')).map(t => t.innerText.trim());
                const bodyText = document.body.innerText;
                return { tabs, bodyText: bodyText.substring(0, 2000) };
            });
            
            console.log('Tabs available:', detailInfo.tabs);
            
            // If there is an "Historial" or "Auditoría" tab, click it
            const historyTabFound = detailInfo.tabs.find(t => t.toLowerCase().includes('historial') || t.toLowerCase().includes('auditoria') || t.toLowerCase().includes('audit') || t.toLowerCase().includes('history'));
            console.log('History tab found:', historyTabFound);
            
            if (historyTabFound) {
                await page.evaluate((tabName) => {
                    const tabElements = Array.from(document.querySelectorAll('.ant-tabs-tab'));
                    const target = tabElements.find(t => t.innerText.trim().toLowerCase().includes(tabName.toLowerCase()));
                    if (target) target.click();
                }, historyTabFound);
                
                await new Promise(r => setTimeout(r, 3000));
                
                const historyTable = await page.evaluate(() => {
                    const table = document.querySelector('table');
                    if (!table) return "Table not found in history tab";
                    const rows = Array.from(table.querySelectorAll('tr'));
                    return rows.map(r => Array.from(r.querySelectorAll('td,th')).map(td => td.innerText.trim()));
                });
                
                console.log('History Table Data:', historyTable);
            }
        }

    } catch (e) {
        console.error(e);
    } finally {
        await browser.close();
    }
}

discoverDeviceHistory('itdevelopment', 'Alika2012.', 'c-romel');
