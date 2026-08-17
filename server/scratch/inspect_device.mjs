import puppeteer from 'puppeteer';

async function inspectDeviceDetail(username, password, domain) {
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

        // Find the first IMEI link and click it or get its URL
        const imeiLink = await page.evaluate(() => {
            const rows = Array.from(document.querySelectorAll('.ant-table-row'));
            if (rows.length === 0) return null;
            const firstRow = rows[0];
            const link = firstRow.querySelector('a');
            return link ? link.href : null;
        });
        
        console.log('Device Detail Link:', imeiLink);
        
        if (imeiLink) {
            await page.goto(imeiLink, { waitUntil: 'networkidle2' });
            await new Promise(r => setTimeout(r, 3000));
            
            const detailContent = await page.evaluate(() => {
                return {
                    text: document.body.innerText.substring(0, 3000),
                    tabs: Array.from(document.querySelectorAll('.ant-tabs-tab')).map(t => t.innerText.trim())
                };
            });
            
            console.log('Detail Tabs:', detailContent.tabs);
            console.log('Detail Text snippet:', detailContent.text.substring(0, 1000));
        }

    } catch (e) {
        console.error(e);
    } finally {
        await browser.close();
    }
}

inspectDeviceDetail('itdevelopment', 'Alika2012.', 'c-romel');
