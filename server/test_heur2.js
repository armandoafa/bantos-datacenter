const row = ['CASH', 'ACCEPTED', 'Jul 4, 2026, 05:42 PM', 'o pardo quintana', '8318691999', 'BHNMEXMLX6HK', 'PEN 110', 'WEB for o pardo quintana', 'BHNMEXMLX6HK', 'Processing'];
const contractId = row.find(c => /^[A-Z0-9]{10,15}$/.test(c) && !/^\d+$/.test(c)) || null;
console.log({ contractId });
