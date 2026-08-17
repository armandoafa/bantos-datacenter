import puppeteer from 'puppeteer';

export async function scrapeUpyaData(username, password) {
  console.log('[UpyaScraper] Iniciando navegador headless...');
  const browser = await puppeteer.launch({ 
    headless: true, 
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu'
    ] 
  });
  
  const results = { Contracts: [], Clients: [], Payments: [], Inventory: [], Products: [], Deals: [] };

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });

    console.log('[UpyaScraper] Iniciando sesión en Upya...');
    await page.goto('https://manage.upya.io/login', { waitUntil: 'networkidle2' });
    await page.type('input[type=\"text\"]', username);
    await page.type('input[type=\"password\"]', password);
    await page.click('button[type=\"submit\"]');
    await new Promise(r => setTimeout(r, 5000));

    const modules = [
      { name: 'Contracts', url: 'https://manage.upya.io/contracts-view' },
      { name: 'Clients', url: 'https://manage.upya.io/clients-view' },
      { name: 'Payments', url: 'https://manage.upya.io/payments-view' },
      { name: 'Inventory', url: 'https://manage.upya.io/assets-view' },
      { name: 'Products', url: 'https://manage.upya.io/products' },
      { name: 'Deals', url: 'https://manage.upya.io/deals' }
    ];

    for (const mod of modules) {
      console.log(`[UpyaScraper] Extrayendo módulo: ${mod.name} -> ${mod.url}`);
      await page.goto(mod.url, { waitUntil: 'networkidle2' });
      
      let hasNextPage = true;
      let pageNum = 1;

      while (hasNextPage && pageNum <= 10) { // Limit to 10 pages so it doesn't timeout
        await new Promise(r => setTimeout(r, 4000));

        const extractedRows = await page.evaluate(() => {
          const grids = Array.from(document.querySelectorAll('div')).filter(div => div.children.length >= 2);
          const bestGrid = grids.sort((a,b) => b.children.length - a.children.length)[0];
          
          if (!bestGrid || bestGrid.children.length < 2) return [];
          
          const rows = Array.from(bestGrid.children);
          return rows.map(row => {
            const textCols = row.innerText.split('\n').map(t => t.trim()).filter(Boolean);
            // Tomar el primer link de la fila que no sea nulo o un enlace general
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

        if (!extractedRows || extractedRows.length === 0) {
          console.log(`[UpyaScraper] Página vacía en ${mod.name}.`);
          break;
        }

        if (extractedRows[0] && extractedRows[0].some(h => ['ContractNumber', 'ClientId', 'Payment', 'Product', 'Deal', 'Type', 'Category', 'Client number', 'SerialNumber'].includes(h))) {
          extractedRows.shift();
        }
        
        results[mod.name] = results[mod.name].concat(extractedRows);
        console.log(`[UpyaScraper] > ${mod.name} Página ${pageNum}: ${extractedRows.length} registros extraídos.`);

        // Intento de paginación
        const clickedNext = await page.evaluate(() => {
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

        if (clickedNext) {
          pageNum++;
        } else {
          hasNextPage = false;
        }
      }
    }

    // --- DEEP SCRAPING: Firmas de Clientes (Limitado a los 20 primeros) ---
    console.log('[UpyaScraper] Iniciando extracción profunda de firmas de clientes...');
    let processedSignatures = 0;
    for (let i = 0; i < results.Clients.length; i++) {
      if (processedSignatures >= 20) {
         console.log('[UpyaScraper] Límite de 20 firmas alcanzado. Omitiendo el resto.');
         break;
      }
      
      const row = results.Clients[i];
      const clientNumber = row.find(c => /^C\d{6,12}$/.test(c)) || row.find(c => c.startsWith('C') && c.length > 5);
      
      if (clientNumber) {
        const url = `https://manage.upya.io/client/id=${clientNumber}`;
        console.log(`[UpyaScraper] Obteniendo firma para cliente ${i+1} (${clientNumber}): ${url}`);
        try {
          await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
          const newTargetPromise = new Promise(resolve => browser.once('targetcreated', target => resolve(target)));

          // Desplazarse hacia abajo para forzar la carga (lazy loading)
          await page.evaluate(() => {
              window.scrollBy(0, 1000);
              const wrapper = document.querySelector('#clientProfileWrapper');
              if (wrapper) wrapper.scrollBy(0, 1000);
              
              // 1. Expandir Data Collection
              Array.from(document.querySelectorAll('div')).forEach(d => {
                  if (d.innerText && d.innerText.trim().toLowerCase() === 'data collection') d.click();
              });
              
              // 2. Expandir el formulario de Onboarding / Collection
              Array.from(document.querySelectorAll('div')).forEach(d => {
                  const text = (d.innerText || '').toLowerCase();
                  if (text.includes('onboarding') || text.includes('form') || text.includes('paygo mobile')) {
                      d.click();
                  }
              });
              
              // 3. Clic en iconos de carpeta por si acaso
              document.querySelectorAll('.fa-folder').forEach(f => f.click());
          });
          await new Promise(r => setTimeout(r, 2000));

          // Esperar explícitamente a que carguen los datos del cliente
          await page.waitForSelector('.answerAnswer', { timeout: 15000 }).catch(() => null);
          await new Promise(r => setTimeout(r, 2000));

          // Buscar y hacer clic en 'View signature'
          const clicked = await page.evaluate(() => {
             const answers = Array.from(document.querySelectorAll('.answerAnswer'));
             const sigDiv = answers.find(d => {
                 const text = (d.innerText || '').toLowerCase();
                 const html = (d.innerHTML || '').toLowerCase();
                 return text.includes('view signature') || text.includes('ver firma') || html.includes('fa-edit');
             });
             
             if (sigDiv) {
                 const icon = sigDiv.querySelector('i');
                 const target = icon || sigDiv;
                 target.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
                 target.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window }));
                 target.click();
                 return true;
             }
             
             // Fallback
             const divs = Array.from(document.querySelectorAll('div'));
             const fallSig = divs.find(d => d.id === 'answerQuestion' && (d.innerText || '').toLowerCase().includes('firma'));
             if (fallSig && fallSig.nextElementSibling) {
                 fallSig.nextElementSibling.click();
                 return true;
             }
             
             return false;
          });

          if (clicked) {
             const newTarget = await Promise.race([
                 newTargetPromise,
                 new Promise(r => setTimeout(() => r(null), 4000))
             ]);

             let signatureData = null;

             if (newTarget && newTarget.type() === 'page') {
                 const newPage = await newTarget.page();
                 if (newPage) {
                    const newUrl = newPage.url();
                    if (newUrl && newUrl.includes('firebasestorage')) {
                        signatureData = newUrl;
                    } else {
                        await newPage.waitForSelector('img', { timeout: 5000 }).catch(() => null);
                        signatureData = await newPage.evaluate(() => {
                            const img = document.querySelector('img');
                            return img ? img.src : null;
                        });
                        if (!signatureData && newPage.url() !== 'about:blank') {
                            signatureData = newPage.url();
                        }
                    }
                    await newPage.close();
                 }
             }

             if (!signatureData) {
                 // Intentar buscar en la página actual por si acaso
                 signatureData = await page.evaluate(() => {
                     const imgs = Array.from(document.querySelectorAll('img'));
                     const sigImg = imgs.reverse().find(img => img.src.includes('signature') || img.src.startsWith('data:image/png;base64,') || img.src.includes('blob:'));
                     return sigImg ? sigImg.src : null;
                 });
             }

             if (signatureData) {
               console.log(`[UpyaScraper] Firma encontrada para cliente ${clientNumber}`);
               row.push(`SIG:${signatureData}`);
               processedSignatures++;
             } else {
               console.log(`[UpyaScraper] No se encontró firma en ${url}`);
             }
          } else {
             console.log(`[UpyaScraper] No se encontró el botón de firma en ${url}. Guardando screenshot.`);
             await page.screenshot({ path: `/tmp/debug_${clientNumber}.png`, fullPage: true });
          }
        } catch (e) {
          console.warn(`[UpyaScraper] Error navegando a ${url}:`, e.message);
        }
      }
    }

  } catch (error) {
    console.error('[UpyaScraper] Error general:', error);
  } finally {
    await browser.close();
    console.log('[UpyaScraper] Navegador cerrado.');
  }

  return {
    contracts: results.Contracts,
    clients: results.Clients,
    payments: results.Payments,
    assets: results.Inventory,
    inventory: results.Products,
    actions: results.Deals
  };
}
