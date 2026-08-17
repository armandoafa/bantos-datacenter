import puppeteer from 'puppeteer';

async function clickEyeIcon(username, password, domain) {
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

        console.log('Finding eye icon...');
        const clicked = await page.evaluate(() => {
            const svgs = Array.from(document.querySelectorAll('svg'));
            // Find the eye icon SVG
            const eyeSvg = svgs.find(s => s.innerHTML.includes('M7.99907 3.0008'));
            if (eyeSvg) {
                const clickable = eyeSvg.closest('a') || eyeSvg.closest('button') || eyeSvg.parentElement;
                if (clickable) {
                    clickable.click();
                    return "Clicked";
                }
            }
            return "Not found";
        });
        
        console.log('Click result:', clicked);
        await new Promise(r => setTimeout(r, 10000));
        
        await page.screenshot({ path: 'scratch/click_result.png', fullPage: true });

    } catch (e) {
        console.error(e);
    } finally {
        await browser.close();
    }
}

clickEyeIcon('itdevelopment', 'Alika2012.', 'c-romel');
