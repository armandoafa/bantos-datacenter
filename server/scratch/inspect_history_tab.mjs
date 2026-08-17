import puppeteer from 'puppeteer';

async function inspectHistoryTab(username, password, domain) {
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
        await new Promise(r => setTimeout(r, 10000));

        // Click eye icon
        await page.evaluate(() => {
            const rows = Array.from(document.querySelectorAll('.ant-table-row'));
            const icon = rows[0]?.querySelector('a.link-style') || rows[0]?.querySelector('svg')?.parentElement;
            if (icon) icon.click();
        });
        await new Promise(r => setTimeout(r, 10000));

        // Click Historial tab
        await page.evaluate(() => {
            const tabs = Array.from(document.querySelectorAll('.ant-tabs-tab'));
            const tab = tabs.find(t => t.innerText.includes('Historial'));
            if (tab) tab.click();
        });
        await new Promise(r => setTimeout(r, 7000));
        
        await page.screenshot({ path: 'scratch/history_tab_content.png', fullPage: true });

        const data = await page.evaluate(() => {
            const activePane = document.querySelector('.ant-tabs-tabpane-active');
            if (!activePane) return "Active pane not found";
            return {
                text: activePane.innerText.substring(0, 2000),
                html: activePane.innerHTML.substring(0, 2000)
            };
        });
        
        console.log('History Tab Text:', data.text);
        console.log('History Tab HTML Snippet:', data.html);

    } catch (e) {
        console.error(e);
    } finally {
        await browser.close();
    }
}

inspectHistoryTab('itdevelopment', 'Alika2012.', 'c-romel');
