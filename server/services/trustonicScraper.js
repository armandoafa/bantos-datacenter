import puppeteer from 'puppeteer';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || '72.62.128.126',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '4p1B4nt0sC10ud26#',
  database: process.env.DB_NAME || 'bantos',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export const runTrustonicScraper = async (username, password, domain) => {
  let browser;
  try {
    console.log(`[Trustonic Scraper] Iniciando scraping para ${domain}...`);
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    await page.goto('https://portal.cloud.trustonic.com/login', { waitUntil: 'networkidle2' });
    await page.type('#login-form_username', username);
    await page.type('#login-form_password', password);
    await page.type('#login-form_domain', domain);
    await page.click('button[type="submit"]');

    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    console.log(`[Trustonic Scraper] Login exitoso para ${domain}`);

    await page.goto('https://portal.cloud.trustonic.com/smartphones', { waitUntil: 'networkidle2' });
    
    // Esperar a que la tabla se cargue
    await new Promise(r => setTimeout(r, 5000));
    await page.waitForSelector('table', { timeout: 30000 });

    let hasNextPage = true;
    let totalScraped = 0;

    while (hasNextPage) {
      const devices = await page.evaluate(() => {
        const tables = Array.from(document.querySelectorAll('table'));
        const deviceTable = tables.find(t => t.innerText.includes('IMEI') && t.innerText.includes('Modelo'));
        
        if (!deviceTable) return [];

        const headers = Array.from(deviceTable.querySelectorAll('th')).map(th => th.innerText.trim().toLowerCase());
        
        // Mapear los índices de las columnas
        const colMap = {
          tac: headers.findIndex(h => h.includes('tac')),
          brand: headers.findIndex(h => h.includes('marca') || h.includes('brand')),
          model: headers.findIndex(h => h.includes('modelo') || h.includes('model')),
          imei: headers.findIndex(h => h.includes('imei')),
          status: headers.findIndex(h => h.includes('estado') || h.includes('status')),
          expiration: headers.findIndex(h => h.includes('caducidad') || h.includes('expiración') || h.includes('expiration'))
        };

        const rows = Array.from(deviceTable.querySelectorAll('tbody tr.ant-table-row'));
        
        return rows.map(row => {
          const cells = Array.from(row.querySelectorAll('td'));
          return {
            tac: colMap.tac !== -1 && cells[colMap.tac] ? cells[colMap.tac].innerText.trim() : null,
            brand: colMap.brand !== -1 && cells[colMap.brand] ? cells[colMap.brand].innerText.trim() : null,
            model: colMap.model !== -1 && cells[colMap.model] ? cells[colMap.model].innerText.trim() : null,
            imei: colMap.imei !== -1 && cells[colMap.imei] ? cells[colMap.imei].innerText.trim() : null,
            status: colMap.status !== -1 && cells[colMap.status] ? cells[colMap.status].innerText.trim() : null,
            expiration_date: colMap.expiration !== -1 && cells[colMap.expiration] ? cells[colMap.expiration].innerText.trim() : null
          };
        }).filter(d => d.imei);
      });

      console.log(`[Trustonic Scraper] Se extrajeron ${devices.length} dispositivos en esta página.`);

      for (const d of devices) {
        await pool.query(
          `INSERT INTO trustonic_inventory (imei, tac, brand, model, status, expiration_date, last_sync) 
           VALUES (?, ?, ?, ?, ?, ?, NOW()) 
           ON DUPLICATE KEY UPDATE 
           tac=VALUES(tac), brand=VALUES(brand), model=VALUES(model), status=VALUES(status), expiration_date=VALUES(expiration_date), last_sync=NOW()`,
          [d.imei, d.tac, d.brand, d.model, d.status, d.expiration_date]
        );
      }
      totalScraped += devices.length;

      // Buscar botón de siguiente página
      const nextBtnDisabled = await page.evaluate(() => {
        const nextBtn = document.querySelector('.ant-pagination-next');
        if (!nextBtn) return true;
        
        const isDisabled = nextBtn.classList.contains('ant-pagination-disabled') || nextBtn.getAttribute('aria-disabled') === 'true';
        if (!isDisabled) {
          nextBtn.click();
        }
        return isDisabled;
      });

      if (nextBtnDisabled) {
        hasNextPage = false;
      } else {
        await new Promise(r => setTimeout(r, 4000));
      }
    }

    console.log(`[Trustonic Scraper] Scraping completado. Total de dispositivos: ${totalScraped}`);

  } catch (error) {
    console.error('[Trustonic Scraper] Error:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};
