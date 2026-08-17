const parseMoney = (str) => {
  if (!str) return 0;
  const num = str.replace(/[^0-9.-]+/g,"");
  return parseFloat(num) || 0;
};
console.log(parseMoney("PEN 110"));
console.log(parseMoney("PEN 1,822"));
