import puppeteer from 'puppeteer';

async function debugTrustonicTable(username, password, domain) {
    console.log(`>>> [Trustonic] Debugging table for: ${domain}`);
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    try {
        await page.goto('https://portal.cloud.trustonic.com/login', { waitUntil: 'networkidle2' });

        await page.type('#login-form_username', username);
        await page.type('#login-form_password', password);
        await page.type('#login-form_domain', domain);
        await page.click('button[type="submit"]');

        await page.waitForNavigation({ waitUntil: 'networkidle2' });
        console.log('>>> [Trustonic] Login exitoso');

        await page.goto('https://portal.cloud.trustonic.com/smartphones', { waitUntil: 'networkidle2' });
        await new Promise(r => setTimeout(r, 5000));
        await page.waitForSelector('table', { timeout: 30000 });

        const tableInfo = await page.evaluate(() => {
            const tables = Array.from(document.querySelectorAll('table'));
            const deviceTable = tables.find(t => t.innerText.includes('IMEI') && t.innerText.includes('Modelo'));
            
            if (!deviceTable) return "Table not found";

            const headers = Array.from(deviceTable.querySelectorAll('th')).map(th => th.innerText.trim());
            const rows = Array.from(deviceTable.querySelectorAll('.ant-table-row')).slice(0, 1);
            const sampleData = rows.map(row => {
                return Array.from(row.querySelectorAll('td')).map(td => td.innerText.trim());
            });

            return { headers, sampleData };
        });

        console.log('Headers:', tableInfo.headers);
        console.log('Sample Row:', tableInfo.sampleData);
        
        // Take screenshot of the table
        await page.screenshot({ path: 'trustonic_table_debug.png' });
        console.log('Screenshot saved to trustonic_table_debug.png');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await browser.close();
    }
}

const username = 'itdevelopment';
const password = 'Alika2012.';
const domain = 'c-romel';

debugTrustonicTable(username, password, domain);
