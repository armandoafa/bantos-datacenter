import { scrapeUpyaData } from './src/upyaScraper.js';
async function run() {
  const data = await scrapeUpyaData('armando.tecmobile', '123456!');
  console.log('PAYMENTS ROW 1:', data.payments[0]);
}
run();
