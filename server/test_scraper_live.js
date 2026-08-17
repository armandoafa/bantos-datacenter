import { scrapeUpyaData } from './src/upyaScraper.js';
import fs from 'fs';

async function run() {
  const data = await scrapeUpyaData('armando.tecmobile', '123456!');
  console.log("PAYMENTS ROW 1:", data.payments[0]);
  console.log("PAYMENTS ROW 2:", data.payments[1]);
  fs.writeFileSync('debug_scraped.json', JSON.stringify(data, null, 2));
}
run();
