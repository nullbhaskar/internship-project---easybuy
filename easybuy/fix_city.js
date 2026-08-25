const fs = require('fs');

function updateFile(filePath) {
    let code = fs.readFileSync(filePath, 'utf8');
    
    // Replace the exact badge logic to handle the literal 'City' string
    // In SpatialDrawerWrapper.tsx: {selectedAddress?.city || 'Location'}
    // In app/profile.tsx: {selectedAddress?.city || 'Set Location'}
    
    code = code.replace(
        /\{selectedAddress\?\.city \|\| 'Location'\}/g,
        `{selectedAddress?.city && selectedAddress.city !== 'City' ? selectedAddress.city : 'Set Location'}`
    );

    code = code.replace(
        /\{selectedAddress\?\.city \|\| 'Set Location'\}/g,
        `{selectedAddress?.city && selectedAddress.city !== 'City' ? selectedAddress.city : 'Set Location'}`
    );

    fs.writeFileSync(filePath, code, 'utf8');
}

updateFile('components/navigation/SpatialDrawerWrapper.tsx');
updateFile('app/profile.tsx');

console.log('Fixed literal "City" display.');
