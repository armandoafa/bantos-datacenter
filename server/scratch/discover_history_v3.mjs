import puppeteer from 'puppeteer';

async function discoverDeviceHistoryV3(username, password, domain) {
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

        // Get the link for the first device in the main table
        const deviceLink = await page.evaluate(() => {
            const tables = Array.from(document.querySelectorAll('table'));
            const mainTable = tables.find(t => t.innerText.includes('Marca') && t.innerText.includes('Modelo'));
            if (!mainTable) return "Main table not found";
            
            const firstDataRow = mainTable.querySelector('.ant-table-row');
            if (!firstDataRow) return "Data row not found";
            
            const link = firstDataRow.querySelector('a');
            return link ? link.href : "Link not found in data row";
        });
        
        console.log('Main Device Detail Link:', deviceLink);
        
        if (deviceLink && deviceLink.startsWith('http')) {
            await page.goto(deviceLink, { waitUntil: 'networkidle2' });
            await new Promise(r => setTimeout(r, 5000));
            
            const info = await page.evaluate(() => {
                const tabs = Array.from(document.querySelectorAll('.ant-tabs-tab')).map(t => t.innerText.trim());
                return { tabs, html: document.body.innerHTML.substring(0, 5000) };
            });
            
            console.log('Tabs:', info.tabs);
            
            const historyTab = info.tabs.find(t => t.includes('Historial') || t.includes('History') || t.includes('Audit'));
            if (historyTab) {
                await page.evaluate((name) => {
                    const el = Array.from(document.querySelectorAll('.ant-tabs-tab')).find(t => t.innerText.includes(name));
                    if (el) el.click();
                }, historyTab);
                await new Promise(r => setTimeout(r, 5000));
                
                const tableData = await page.evaluate(() => {
                    const activeTabPane = document.querySelector('.ant-tabs-tabpane-active');
                    const table = activeTabPane ? activeTabPane.querySelector('table') : document.querySelector('table');
                    if (!table) return "Table not found";
                    const rows = Array.from(table.querySelectorAll('tr'));
                    return rows.slice(0, 5).map(r => Array.from(r.querySelectorAll('td,th')).map(td => td.innerText.trim()));
                });
                console.log('History Rows:', JSON.stringify(tableData, null, 2));
            }
        }

    } catch (e) {
        console.error(e);
    } finally {
        await browser.close();
    }
}

discoverDeviceHistoryV3('itdevelopment', 'Alika2012.', 'c-romel');
