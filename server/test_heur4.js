const parseMoney = (str) => {
  if (!str) return 0;
  const num = str.replace(/[^0-9.-]+/g,'');
  return parseFloat(num) || 0;
};
const row = [ 'CASH', 'ACCEPTED', 'Jul 3, 2026, 11:01 PM', 'o pardo quintana', '8311967456', 'BHNRCRFKXDVI', 'PEN 85', 'WEB for o pardo quintana', 'BHNRCRFKXDVI', 'Processing' ];
const amountStr = row.find(c => /^(PEN|USD|€|£|$)\s*[\d,.]+$/.test(c)) || '0';
const amount = parseMoney(amountStr);
console.log({ amountStr, amount });
