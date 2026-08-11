const { generateFullIndianCatalog } = require('./constants/catalogGenerator');

const catalog = generateFullIndianCatalog();
const electronicsProducts = catalog.filter(p => p.categoryId === 'electronics');

console.log('Total Generated Electronics:', electronicsProducts.length);
console.log('Generated Electronics Titles list:');
electronicsProducts.forEach((p, i) => {
  console.log(`${i+1}. ${p.name} (State: ${p.stateId}, City: ${p.city})`);
});
