const fs = require('fs');
let code = fs.readFileSync('app/profile.tsx', 'utf8');

const oldBadge = `<View style={[S.eliteBadge, { backgroundColor: '#89B882' }]}>
                      <Ionicons name="location" size={10} color="#0F172A" style={{ marginRight: 2 }} />
                      <Text style={S.eliteBadgeText}>
                        {selectedAddress?.city && selectedAddress.city !== 'City' ? selectedAddress.city : 'Set Location'}
                      </Text>
                    </View>`;

const newBadge = `<TouchableOpacity 
                      style={[S.eliteBadge, { backgroundColor: '#89B882' }]}
                      onPress={openLocationModal}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="location" size={10} color="#0F172A" style={{ marginRight: 2 }} />
                      <Text style={S.eliteBadgeText}>
                        {selectedAddress?.city && selectedAddress.city !== 'City' ? selectedAddress.city : 'Set Location'}
                      </Text>
                    </TouchableOpacity>`;

code = code.replace(oldBadge, newBadge);

fs.writeFileSync('app/profile.tsx', code, 'utf8');
console.log('Fixed location badge touch in profile!');
