import { scrapeUpyaData } from './src/upyaScraper.js';
async function run() {
  const data = await scrapeUpyaData('armando.tecmobile', '123456!');
  const row = data.payments.find(r => r.includes('8309574198'));
  console.log('FOUND ROW:', row);
}
run();
