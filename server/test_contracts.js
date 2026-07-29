import { scrapeUpyaData } from './src/upyaScraper.js';
async function run() {
  const data = await scrapeUpyaData('armando.tecmobile', '123456!');
  for (let i = 0; i < 5; i++) {
    console.log(`CONTRACTS ROW ${i}: `, data.contracts[i]);
  }
}
run();
