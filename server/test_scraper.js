import mysql from 'mysql2/promise';
import { scrapeUpyaData } from './src/upyaScraper.js';
import { syncScrapedData } from './src/scraperSync.js';
import dotenv from 'dotenv';
dotenv.config();

(async () => {
  console.log('--- TEST RUNNER START ---');
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'adminbantosprompt',
      password: process.env.DB_PASS || 'adminbantosprompt2026',
      database: process.env.DB_NAME || 'bantosprompt502301_db',
    });

    console.log('Ejecutando Scraper (solo prueba)...');
    const scrapedData = await scrapeUpyaData(process.env.UPYA_USER, process.env.UPYA_PASS);
    
    console.log('Resultados del Scraper:');
    console.log(`- Contratos: ${scrapedData.contracts.length}`);
    console.log(`- Clientes: ${scrapedData.clients.length}`);
    console.log(`- Pagos: ${scrapedData.payments.length}`);
    console.log(`- Inventario: ${scrapedData.inventory.length}`);
    console.log(`- Actions: ${scrapedData.actions.length}`);

    // await syncScrapedData(scrapedData, pool, 'tecmobile');

    console.log('Test finalizado exitosamente.');
    process.exit(0);
  } catch (err) {
    console.error('Error en Test:', err);
    process.exit(1);
  }
})();
