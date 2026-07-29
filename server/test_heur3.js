const parseMoney = (str) => {
  if (!str) return 0;
  const num = str.replace(/[^0-9.-]+/g,'');
  return parseFloat(num) || 0;
};
const row = ['CASH', 'ACCEPTED', 'Jul 4, 2026, 05:42 PM', 'o pardo quintana', '8318691999', 'BHNMEXMLX6HK', 'PEN 110', 'WEB for o pardo quintana', 'BHNMEXMLX6HK', 'Processing'];
const amountStr = row.find(c => /PEN|USD|€|£|$/.test(c)) || '0';
const amount = parseMoney(amountStr);
console.log({ amountStr, amount });
