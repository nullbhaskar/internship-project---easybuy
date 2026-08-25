const fs = require('fs');
let code = fs.readFileSync('app/profile.tsx', 'utf8');

code = code.replace(
  /const \{ openLocationModal \} = useAddress\(\);/,
  `const { openLocationModal, selectedAddress } = useAddress();`
);

fs.writeFileSync('app/profile.tsx', code, 'utf8');
console.log('Added selectedAddress destructuring to app/profile.tsx');
