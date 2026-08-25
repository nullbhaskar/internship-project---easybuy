const fs = require('fs');
let code = fs.readFileSync('components/navigation/SpatialDrawerWrapper.tsx', 'utf8');

// 1. Add import for useAddress
if (!code.includes("import { useAddress }")) {
    code = code.replace(
        /import \{ router \} from 'expo-router';\r?\n/,
        `import { router } from 'expo-router';\nimport { useAddress } from '../../context/AddressContext';\n`
    );
}

// 2. Extract selectedAddress inside the component
// Find `const [isOpen, setIsOpen] = useState(false);`
code = code.replace(
    /const \[isOpen, setIsOpen\] = useState\(false\);\r?\n/,
    `const [isOpen, setIsOpen] = useState(false);\n    const { selectedAddress } = useAddress();\n`
);

// 3. Replace MEMBER with Location
// The block looks like:
/*
                      <View style={[styles.vipTagPill, { backgroundColor: 'rgba(47,110,73,0.3)' }]}>
                        <Ionicons name="shield-checkmark" size={10} color="#89B882" style={{ marginRight: 4 }} />
                        <Text style={[styles.vipTagTxt, { color: '#89B882' }]}>MEMBER</Text>
                      </View>
*/
const oldBadge = `<Ionicons name="shield-checkmark" size={10} color="#89B882" style={{ marginRight: 4 }} />
                        <Text style={[styles.vipTagTxt, { color: '#89B882' }]}>MEMBER</Text>`;
const newBadge = `<Ionicons name="location" size={10} color="#89B882" style={{ marginRight: 4 }} />
                        <Text style={[styles.vipTagTxt, { color: '#89B882' }]} numberOfLines={1}>
                          {selectedAddress?.city || 'Set Location'}
                        </Text>`;

code = code.replace(oldBadge, newBadge);

// Write changes
fs.writeFileSync('components/navigation/SpatialDrawerWrapper.tsx', code, 'utf8');
console.log('Successfully updated MEMBER badge to display user location.');
