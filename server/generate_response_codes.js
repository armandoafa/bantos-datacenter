import XLSX from 'xlsx';
import fs from 'fs';

const workbook = XLSX.readFile('/home/armandoafa/Projects/bantos-datacenter/Response_Codes.xlsx');
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(sheet);

const mapping = {};
data.forEach(row => {
    if (row.Code && row.Name) {
        mapping[String(row.Code).trim()] = row.Name.trim();
    }
});

const fileContent = `// Automatically generated from Response_Codes.xlsx
const RESPONSE_CODES = ${JSON.stringify(mapping, null, 2)};

export const getResponseCodeName = (code) => {
    return RESPONSE_CODES[code] || 'Unknown error code';
};
`;

fs.mkdirSync('/home/armandoafa/Projects/bantos-datacenter/server/src/utils', { recursive: true });
fs.writeFileSync('/home/armandoafa/Projects/bantos-datacenter/server/src/utils/responseCodes.js', fileContent);
console.log('Successfully generated responseCodes.js');
