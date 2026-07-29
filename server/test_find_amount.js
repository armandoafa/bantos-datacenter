import { scrapeUpyaData } from './src/upyaScraper.js';
async function run() {
  const data = await scrapeUpyaData('armando.tecmobile', '123456!');
  const row = data.payments.find(r => r.includes('A44088287') || r.includes('8309574198') || r.includes('A12375131'));
  if (row) {
    console.log('FOUND EXACT RAW ROW:', JSON.stringify(row, null, 2));
  } else {
    console.log('NOT FOUND IN FIRST PAGE. SCROLLING MIGHT BE NEEDED.');
    // Let's just print the raw first row to see if the structure changed.
    console.log('RAW ROW 1:', JSON.stringify(data.payments[0], null, 2));
  }
}
run();
