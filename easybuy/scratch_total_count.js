const fs = require('fs');
const path = require('path');

const catalogPath = path.join(__dirname, 'scripts', 'catalog.json');
const data = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

console.log('Keys in catalog.json:', Object.keys(data));
// Print length of items for each key
let total = 0;
for (const key in data) {
  if (Array.isArray(data[key])) {
    console.log(`Key: ${key}, Length: ${data[key].length}`);
    total += data[key].length;
  } else {
    console.log(`Key: ${key}, Type: ${typeof data[key]}`);
  }
}
console.log('Total products summed:', total);
