import puppeteer from 'puppeteer-core';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

/**
 * Scraper super simplificado pero robusto.
 * Solo extrae las tablas visibles de las páginas principales (Contratos, Clientes, Pagos, Productos, Dispositivos).
 * Maneja paginación sencilla haciendo click en "Next" o el chevron.
 */
export async function scrapeUpyaData(username, password) {
  let browser;
  const results = {
    Contracts: [],
    Clients: [],
    Payments: [],
    Products: [],
    Devices: []
  };

  try {
    browser = await puppeteer.launch({
      executablePath: '/usr/bin/chromium-browser',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });

    console.log('[UpyaScraper] Iniciando sesión en Upya...');
    await page.goto('https://manage.upya.io/login', { waitUntil: 'networkidle2' });
    await page.type('input[type="text"]', username);
    await page.type('input[type="password"]', password);
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 8000)); // wait for login and dashboard

    const modules = [
      { name: 'Contracts', url: 'https://manage.upya.io/contracts-view' },
      { name: 'Clients', url: 'https://manage.upya.io/clients-view' },
      { name: 'Payments', url: 'https://manage.upya.io/payments-view' },
      { name: 'Products', url: 'https://manage.upya.io/products-view' },
      { name: 'Devices', url: 'https://manage.upya.io/devices-view' }
    ];

    for (const mod of modules) {
      console.log(`[UpyaScraper] Extrayendo módulo: ${mod.name} -> ${mod.url}`);
      try {
        await page.goto(mod.url, { waitUntil: 'networkidle2', timeout: 30000 });
      } catch (err) {
        console.warn(`[UpyaScraper] Error goto ${mod.name}: ${err.message}`);
      }
      await new Promise(r => setTimeout(r, 4000));
      
      let hasNextPage = true;
      let pageNum = 1;

      while (hasNextPage && pageNum <= 10) { // Limit to 10 pages
        let extractedRows = [];
        try {
          extractedRows = await page.evaluate(() => {
            const grids = Array.from(document.querySelectorAll('div')).filter(div => div.children.length >= 2);
            if (grids.length === 0) return [];
            const bestGrid = grids.sort((a,b) => b.children.length - a.children.length)[0];
            
            if (!bestGrid || bestGrid.children.length < 2) return [];
            
            const rows = Array.from(bestGrid.children);
            return rows.map(row => {
              const textCols = row.innerText.split('\n').map(t => t.trim()).filter(Boolean);
              const links = Array.from(row.querySelectorAll('a[href]'));
              const contractLink = links.find(a => a.href.includes('/contract') || a.href.match(/\/[a-zA-Z0-9]+$/));
              if (contractLink) {
                textCols.push('URL:' + contractLink.href);
              } else if (links.length > 0) {
                textCols.push('URL:' + links[0].href);
              }
              return textCols;
            });
          });
        } catch (err) {
          console.warn(`[UpyaScraper] Error en evaluate: ${err.message}. Intentando de nuevo.`);
          await new Promise(r => setTimeout(r, 5000));
          continue;
        }

        if (!extractedRows || extractedRows.length === 0) {
          console.log(`[UpyaScraper] Página vacía en ${mod.name}.`);
          break;
        }

        if (extractedRows[0] && extractedRows[0].some(h => ['ContractNumber', 'ClientId', 'Payment', 'Product', 'Deal', 'Type', 'Category', 'Client number', 'SerialNumber'].includes(h))) {
          extractedRows.shift(); // remove header
        }
        
        results[mod.name] = results[mod.name].concat(extractedRows);
        console.log(`[UpyaScraper] > ${mod.name} Página ${pageNum}: ${extractedRows.length} registros extraídos.`);

        let clickedNext = false;
        try {
          clickedNext = await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button, a, div[role="button"], span[role="button"]'));
            const nextBtn = btns.find(b => {
               const html = b.innerHTML.toLowerCase();
               const text = b.textContent.toLowerCase();
               const isNext = text.includes('next') || html.includes('fa-angle-right') || html.includes('fa-chevron-right') || text === '>' || text === '»';
               const disabled = b.hasAttribute('disabled') || b.className.includes('disabled') || b.parentElement.className.includes('disabled');
               return isNext && !disabled;
            });
            if (nextBtn) {
               nextBtn.click();
               return true;
            }
            return false;
          });
        } catch (err) {
          console.warn(`[UpyaScraper] Error al hacer click en next: ${err.message}`);
        }

        if (clickedNext) {
          pageNum++;
          await new Promise(r => setTimeout(r, 6000)); // Esperar explícitamente a que cargue la siguiente página sin usar waitForNavigation que falla con SPA
        } else {
          hasNextPage = false;
        }
      }
    }

    // --- DEEP SCRAPING: Firmas de Clientes (Limitado a los 20 primeros) ---
    console.log('[UpyaScraper] Iniciando extracción profunda de firmas de clientes...');
    for (const client of results.Clients.slice(0, 20)) {
      const urlCol = client.find(c => c.startsWith('URL:'));
      if (urlCol) {
        const url = urlCol.replace('URL:', '');
        console.log(`[UpyaScraper] Visitando cliente para firma: ${url}`);
        try {
          await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
          const signature = await page.evaluate(() => {
            const imgs = Array.from(document.querySelectorAll('img'));
            const sig = imgs.find(img => img.src.includes('signature') || (img.alt && img.alt.toLowerCase().includes('signature')) || img.src.startsWith('data:image/png;base64'));
            return sig ? sig.src : null;
          });
          if (signature) {
            client.push('SIGNATURE:' + signature);
          }
        } catch (err) {
          console.warn(`[UpyaScraper] Error en deep scrape de cliente: ${err.message}`);
        }
      }
    }

    console.log('[UpyaScraper] Navegador cerrado.');
    await browser.close();
    return results;

  } catch (err) {
    console.error(`[UpyaScraper] Error general:`, err);
    if (browser) await browser.close();
    return results;
  }
}
