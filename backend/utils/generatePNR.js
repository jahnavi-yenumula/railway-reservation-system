// Generate a unique 10-digit PNR number
const generatePNR = () => {
  // Create a 10-digit number starting with a non-zero digit
  const min = 1000000000; // 10 digits minimum
  const max = 9999999999; // 10 digits maximum
  const pnr = Math.floor(Math.random() * (max - min + 1)) + min;
  return pnr.toString();
};

module.exports = generatePNR;
