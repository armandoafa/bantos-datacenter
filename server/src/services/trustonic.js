import puppeteer from 'puppeteer';

export async function scrapeTrustonic(username, password, domain, deepAudit = false) {
    console.log(`>>> [Trustonic] Iniciando scraping (deepAudit=${deepAudit}) para el dominio: ${domain}`);
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 1024 });

    try {
        await page.goto('https://portal.cloud.trustonic.com/login', { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('#login-form_username', { timeout: 15000 });

        // Login
        await page.type('#login-form_username', username);
        await page.type('#login-form_password', password);
        await page.type('#login-form_domain', domain);
        await page.click('button[type="submit"]');
        await page.waitForNavigation({ waitUntil: 'domcontentloaded' }).catch(() => {});
        
        // Navegar a la lista de smartphones
        await page.goto('https://portal.cloud.trustonic.com/smartphones', { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('.ant-table-row', { timeout: 8000 }).catch(() => {});
        
        // Obtener lista de IMEIs y sus selectores de icono de "Ojo"
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

        console.log(`>>> [Trustonic] Se obtuvieron ${devicesBasic.length} dispositivos desde la tabla.`);

        if (!deepAudit) {
            await browser.close();
            return devicesBasic;
        }

        const finalDevices = [];
        for (const dev of devicesBasic) {
            try {
                // Volver a la lista si navegamos fuera
                if (page.url() !== 'https://portal.cloud.trustonic.com/smartphones') {
                    await page.goto('https://portal.cloud.trustonic.com/smartphones', { waitUntil: 'networkidle2' });
                    await new Promise(r => setTimeout(r, 5000));
                }

                console.log(`>>> [Trustonic] Entrando a detalle para IMEI: ${dev.imei1}...`);
                
                // Hacer clic en el icono del "Ojo" usando detección de SVG
                const clickSuccess = await page.evaluate((idx) => {
                    try {
                        const svgs = Array.from(document.querySelectorAll('svg'));
                        // Buscamos los SVGs de "Ojo" (basado en el path M7.99907...)
                        const eyeSvgs = svgs.filter(s => s.innerHTML.includes('M7.99907'));
                        // El idx corresponde al dispositivo en la lista
                        const targetSvg = eyeSvgs[idx];
                        
                        if (targetSvg) {
                            const clickable = targetSvg.closest('a') || targetSvg.closest('button') || targetSvg.parentElement;
                            if (clickable) {
                                clickable.click();
                                return "Clicked";
                            }
                        }
                        return "Eye icon not found for index " + idx;
                    } catch (e) {
                        return "Error in evaluate click: " + e.message;
                    }
                }, dev.index);

                console.log(`>>> [Trustonic] Resultado click: ${clickSuccess}`);
                await new Promise(r => setTimeout(r, 8000));
                
                // Buscar y hacer clic en la pestaña de Historial/Auditoría
                const tabResult = await page.evaluate(() => {
                    const tabs = Array.from(document.querySelectorAll('.ant-tabs-tab, .ant-tabs-tab-btn'));
                    const historyTab = tabs.find(t => {
                        const txt = t.innerText.toLowerCase();
                        return txt.includes('historial') || txt.includes('audit') || txt.includes('history');
                    });
                    if (historyTab) {
                        historyTab.click();
                        return "Tab Clicked: " + historyTab.innerText;
                    }
                    return "Tab not found. Available: " + tabs.map(t => t.innerText).join(', ');
                });

                console.log(`>>> [Trustonic] Resultado pestaña: ${tabResult}`);

                if (tabResult.includes('Clicked')) {
                    // Esperar más tiempo a que cargue el contenido de la pestaña (es lento en VPS)
                    await new Promise(r => setTimeout(r, 12000));
                    
                    // Tomar captura del estado actual para depuración
                    try {
                        await page.screenshot({ path: '/var/www/bantos.cloud/bantos-datacenter/server/scratch/last_history_view.png', fullPage: true });
                        console.log('>>> [Trustonic] Screenshot guardado en /var/www/bantos.cloud/bantos-datacenter/server/scratch/last_history_view.png');
                    } catch (ssErr) {
                        console.error('>>> [Trustonic] Error guardando screenshot:', ssErr.message);
                    }

                    // Extraer la última operación y comentario desde el Timeline (Búsqueda Ultra-Agresiva)
                    const history = await page.evaluate(() => {
                        const activePane = document.querySelector('.ant-tabs-tabpane-active');
                        if (!activePane) return { error: "No active pane" };
                        
                        // Escaneamos todos los elementos con texto del panel activo
                        const allElements = Array.from(activePane.querySelectorAll('div, span, p, td, tr'));
                        
                        const candidates = allElements.map(el => ({
                            text: el.innerText.trim(),
                            element: el
                        })).filter(item => {
                            // Debe tener el formato de hora HH:MM:SS
                            if (!/\d{2}:\d{2}:\d{2}/.test(item.text)) return false;
                            // Excluimos basura y controles
                            if (item.text.includes('Descargar') || item.text.length < 15 || item.text.length > 500) return false;
                            return true;
                        });

                        if (candidates.length > 0) {
                            // Ordenamos por longitud de texto descendente (los items de timeline suelen ser largos)
                            // y tomamos el que parezca más relevante (el primero que encontremos suele ser el contenedor)
                            const bestMatch = candidates[0].text;
                            
                            // Limpiar la hora y separar por líneas
                            const cleanText = bestMatch.replace(/^\d{2}:\d{2}:\d{2}\s+/, '').trim();
                            let lines = cleanText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
                            
                            if (lines[0] && /[a-z]{3}\s+\d{1,2},\s+\d{4}/i.test(lines[0])) {
                                lines = lines.slice(1);
                            }

                            let op = lines[0] || cleanText;
                            if (op.includes('@') && lines[1]) {
                                op = lines[1];
                            }
                            
                            return {
                                operation: op.substring(0, 250),
                                comment: cleanText.substring(0, 1000)
                            };
                        }
                        
                        return { error: "No events found in active pane", totalDivs: allElements.length };
                    });
                    
                    if (history && history.operation) {
                        console.log(`>>> [Trustonic] Evento extraído para ${dev.imei1}: ${history.operation}`);
                        dev.operation_type = history.operation;
                        dev.comment = history.comment;
                    } else {
                        console.log(`>>> [Trustonic] Fallo timeline para ${dev.imei1}: ${JSON.stringify(history)}`);
                    }

                    // Cerrar el modal (Escape)
                    await page.keyboard.press('Escape');
                    await new Promise(r => setTimeout(r, 4000));
                }

            } catch (e) {
                console.warn(`>>> [Trustonic] Error al obtener detalle para ${dev.imei1}:`, e.message);
            }
            finalDevices.push(dev);
        }

        return finalDevices;
    } catch (error) {
        console.error('!!! [Trustonic Error]:', error.message);
        throw error;
    } finally {
        await browser.close();
    }
}
