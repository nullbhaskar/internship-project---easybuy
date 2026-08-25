const fs = require('fs');
let code = fs.readFileSync('components/navigation/SpatialDrawerWrapper.tsx', 'utf8');

// Ensure useAddress is imported and destructured
if (!code.includes("import { useAddress }")) {
    code = code.replace(
        /import \{ router \} from 'expo-router';\r?\n/,
        `import { router } from 'expo-router';\nimport { useAddress } from '../../context/AddressContext';\n`
    );
}

// Destructure selectedAddress if not done yet
if (!code.includes("const { selectedAddress } = useAddress();")) {
    code = code.replace(
        /const \[isOpen, setIsOpen\] = useState\(false\);\r?\n/,
        `const [isOpen, setIsOpen] = useState(false);\n    const { selectedAddress } = useAddress();\n`
    );
}

// Perform the replacement
code = code.replace(/name="shield-checkmark"/g, 'name="location"');
code = code.replace(/>MEMBER<\/Text>/g, ' numberOfLines={1}>{selectedAddress?.city || \'Location\'}</Text>');

fs.writeFileSync('components/navigation/SpatialDrawerWrapper.tsx', code, 'utf8');
console.log('Successfully updated MEMBER badge to display user location.');
