const fs = require('fs');
let code = fs.readFileSync('app/profile.tsx', 'utf8');

const oldBadge = `<Ionicons name="person" size={10} color="#0F172A" style={{ marginRight: 2 }} />
                      <Text style={S.eliteBadgeText}>MEMBER</Text>`;
const newBadge = `<Ionicons name="location" size={10} color="#0F172A" style={{ marginRight: 2 }} />
                      <Text style={S.eliteBadgeText}>
                        {selectedAddress?.city || 'Set Location'}
                      </Text>`;

code = code.replace(oldBadge, newBadge);

// Just in case selectedAddress isn't destructured in the component, let's make sure it is.
// Profile screen has: const { selectedAddress, savedAddresses } = useAddress(); 
// So `selectedAddress` is already available!

fs.writeFileSync('app/profile.tsx', code, 'utf8');
console.log('Successfully updated MEMBER badge in app/profile.tsx.');
