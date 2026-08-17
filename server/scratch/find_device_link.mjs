import puppeteer from 'puppeteer';

async function findDeviceDetailLink(username, password, domain) {
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

        const detailLink = await page.evaluate(() => {
            const table = document.querySelector('table');
            if (!table) return "Table not found";
            const firstRow = table.querySelector('.ant-table-row');
            if (!firstRow) return "Row not found";
            const firstCell = firstRow.querySelector('td');
            if (!firstCell) return "Cell not found";
            const link = firstCell.querySelector('a');
            return link ? link.href : "Link not found in cell";
        });
        
        console.log('Detail Link Found:', detailLink);

    } catch (e) {
        console.error(e);
    } finally {
        await browser.close();
    }
}

findDeviceDetailLink('itdevelopment', 'Alika2012.', 'c-romel');
