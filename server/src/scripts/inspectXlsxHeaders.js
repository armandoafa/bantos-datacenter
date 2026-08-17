import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';

const { readFile, utils } = xlsx;

const ref2Dir = '/var/www/bantos.cloud/bantos-datacenter/insight-client/ref/2.0';
const files = fs.readdirSync(ref2Dir).filter(f => f.endsWith('.xlsx'));

for (const file of files) {
  const filePath = path.join(ref2Dir, file);
  console.log(`\n>>> Inspecting keys for: ${file}`);
  const workbook = readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = utils.sheet_to_json(sheet);
  if (rows.length > 0) {
    console.log('Keys:', Object.keys(rows[0]));
    console.log('First row sample:', rows[0]);
  } else {
    console.log('Empty sheet');
  }
}
