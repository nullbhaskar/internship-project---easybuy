const fs = require('fs');
let code = fs.readFileSync('components/navigation/SpatialDrawerWrapper.tsx', 'utf8');

// 1. Extract openLocationModal
code = code.replace(
    /const \{ selectedAddress \} = useAddress\(\);\r?\n/,
    `const { selectedAddress, openLocationModal } = useAddress();\n`
);

// 2. Change View to TouchableOpacity for the badge
const oldBadge = `<View style={[styles.vipTagPill, { backgroundColor: 'rgba(47,110,73,0.3)' }]}>
                        <Ionicons name="location" size={10} color="#89B882" style={{ marginRight: 4 }} />
                        <Text style={[styles.vipTagTxt, { color: '#89B882' }]} numberOfLines={1}>{selectedAddress?.city && selectedAddress.city !== 'City' ? selectedAddress.city : 'Set Location'}</Text>
                      </View>`;

const newBadge = `<TouchableOpacity 
                        style={[styles.vipTagPill, { backgroundColor: 'rgba(47,110,73,0.3)' }]}
                        onPress={() => {
                          closeDrawer();
                          setTimeout(() => openLocationModal(), 300);
                        }}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="location" size={10} color="#89B882" style={{ marginRight: 4 }} />
                        <Text style={[styles.vipTagTxt, { color: '#89B882' }]} numberOfLines={1}>{selectedAddress?.city && selectedAddress.city !== 'City' ? selectedAddress.city : 'Set Location'}</Text>
                      </TouchableOpacity>`;

code = code.replace(oldBadge, newBadge);

fs.writeFileSync('components/navigation/SpatialDrawerWrapper.tsx', code, 'utf8');
console.log('Fixed location badge touch redirection!');
