import puppeteer from 'puppeteer';

async function inspectDevicesTable(username, password, domain) {
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

        const rowHtml = await page.evaluate(() => {
            const tables = Array.from(document.querySelectorAll('table'));
            // Find the table that contains "IMEI" but not "Total" (to avoid summary)
            const devicesTable = tables.find(t => t.innerText.includes('IMEI') && !t.innerText.includes('Total') && t.innerText.includes('Estado actual'));
            if (!devicesTable) return "Devices table not found";
            
            const rows = Array.from(devicesTable.querySelectorAll('.ant-table-row'));
            return rows.length > 0 ? rows[0].outerHTML : "No rows found in devices table";
        });
        
        console.log('Device Row HTML:', rowHtml);

    } catch (e) {
        console.error(e);
    } finally {
        await browser.close();
    }
}

inspectDevicesTable('itdevelopment', 'Alika2012.', 'c-romel');
