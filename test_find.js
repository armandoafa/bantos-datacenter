const row = [
  'CASH',
  'ACCEPTED',
  'Jul 4, 2026, 11:42 AM',
  'o pardo quintana',
  '8318691999',
  'BHNMEXMLX6HK',
  'PEN 110',
  'WEB for o pardo quintana',
  'BHNMEXMLX6HK',
  'Processing'
];
const method = row.find(c => ['CASH', 'MOBILE_MONEY', 'CARD', 'BANK_TRANSFER', 'WEB'].includes(c.toUpperCase())) || row[0];
const status = row.find(c => ['ACCEPTED', 'PENDING', 'REJECTED', 'COMPLETED'].includes(c.toUpperCase())) || row[1];
const dateStr = row.find(c => c.includes('2026') || c.includes('2025'));
const txId = row.find(c => /^\d{8,12}$/.test(c));
const contractId = row.find(c => /^[A-Z0-9]{10,15}$/.test(c) && !/^\d+$/.test(c));
const amountStr = row.find(c => /PEN|USD|€|£|\$/.test(c) || (/^\d+(\.\d+)?$/.test(c) && c !== txId));
console.log({method, status, dateStr, txId, contractId, amountStr});
