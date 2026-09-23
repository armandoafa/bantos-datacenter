import puppeteer from 'puppeteer';

export async function scrapeTrustonic(username, password, domain) {
    console.log(`>>> [Trustonic] Iniciando scraping ultra-rápido para el dominio: ${domain}`);
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 1024 });

    try {
        await page.goto('https://portal.cloud.trustonic.com/login', { waitUntil: 'networkidle2' });

        // Login
        await page.type('#login-form_username', username);
        await page.type('#login-form_password', password);
        await page.type('#login-form_domain', domain);
        await page.click('button[type="submit"]');
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
        
        // Navegar a la lista de smartphones
        await page.goto('https://portal.cloud.trustonic.com/smartphones', { waitUntil: 'networkidle2' });
        await new Promise(r => setTimeout(r, 6000));
        
        // Obtener lista de IMEIs y sus datos de la tabla principal
        const devicesBasic = await page.evaluate(() => {
            const tables = Array.from(document.querySelectorAll('table'));
            const devicesTable = tables.find(t => t.innerText.includes('IMEI') && !t.innerText.includes('Total'));
            if (!devicesTable) return [];
            
            const headers = Array.from(devicesTable.querySelectorAll('th')).map(th => th.innerText.trim().toLowerCase());
            
            // Buscar índices de columnas dinámicamente
            const tenantIdx = headers.findIndex(h => h.includes('tenant'));
            const imei1Idx = headers.findIndex(h => h.includes('imei') || h.includes('sn') || h.includes('uid'));
            const imei2Idx = headers.findIndex(h => h.includes('imei2'));
            const serviceIdx = headers.findIndex(h => h.includes('service') || h.includes('servicio'));
            const statusIdx = headers.findIndex(h => h.includes('state') || h.includes('status') || h.includes('estado'));
            const brandIdx = headers.findIndex(h => h.includes('brand') || h.includes('marca'));
            const modelIdx = headers.findIndex(h => h.includes('model') || h.includes('modelo'));
            const lastChangeIdx = headers.findIndex(h => h.includes('changed') || h.includes('change') || h.includes('cambio') || h.includes('último cambio'));
            const lastConnIdx = headers.findIndex(h => h.includes('checkin') || h.includes('connection') || h.includes('conexión'));

            const rows = Array.from(devicesTable.querySelectorAll('.ant-table-row'));
            return rows.map((row, index) => {
                const cols = Array.from(row.querySelectorAll('td'));
                return {
                    index,
                    scraped_tenant_id: tenantIdx !== -1 ? cols[tenantIdx]?.innerText.trim() : null,
                    imei1: imei1Idx !== -1 ? cols[imei1Idx]?.innerText.trim() : null,
                    imei2: imei2Idx !== -1 ? cols[imei2Idx]?.innerText.trim() : null,
                    service: serviceIdx !== -1 ? cols[serviceIdx]?.innerText.trim() : null,
                    status: statusIdx !== -1 ? cols[statusIdx]?.innerText.trim() : null,
                    brand: brandIdx !== -1 ? cols[brandIdx]?.innerText.trim() : null,
                    model: modelIdx !== -1 ? cols[modelIdx]?.innerText.trim() : null,
                    last_change: lastChangeIdx !== -1 ? cols[lastChangeIdx]?.innerText.trim() : null,
                    last_connection: lastConnIdx !== -1 ? cols[lastConnIdx]?.innerText.trim() : null
                };
            }).filter(d => d.imei1 && /^\d+$/.test(d.imei1));
        });

        console.log(`>>> [Trustonic Scraper] Extracción completada. Total de dispositivos: ${devicesBasic.length}`);
        return devicesBasic;
    } catch (error) {
        console.error('!!! [Trustonic Error]:', error.message);
        throw error;
    } finally {
        await browser.close();
    }
}
