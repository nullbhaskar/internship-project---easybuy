import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Dimensions,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAddress, DeliveryAddress } from '../context/AddressContext';

const { width } = Dimensions.get('window');

const THEME = {
  PRIMARY: '#2F6E46', // EasyBuy Green
  SECONDARY: '#89B882',
  ACCENT: '#F6CC63',
  BG_CREAM: '#FFF8EF',
  CARD_WHITE: '#FFFFFF',
  TEXT_DARK: '#0F172A',
  TEXT_MUTED: '#64748B',
  CORAL: '#FF6B6B',
  PURPLE: '#8E44AD',
};

const ADDRESS_TYPES = [
  { id: 'Home', label: 'Home', icon: 'home' },
  { id: 'Office', label: 'Office', icon: 'briefcase' },
  { id: 'Hostel', label: 'Hostel', icon: 'school' },
  { id: 'Parents', label: 'Parents', icon: 'heart' },
  { id: 'Other', label: 'Other', icon: 'location' },
];

export default function AddAddressScreen() {
  const router = useRouter();
  const { saveAddress } = useAddress();

  const [receiverName, setReceiverName] = useState('Bhaskar');
  const [phoneNumber, setPhoneNumber] = useState('+91 9876543210');
  const [houseNumber, setHouseNumber] = useState('');
  const [building, setBuilding] = useState('');
  const [street, setStreet] = useState('');
  const [landmark, setLandmark] = useState('');
  const [locality, setLocality] = useState('Sector 34');
  const [city, setCity] = useState('Gurugram');
  const [state, setState] = useState('Haryana');
  const [pincode, setPincode] = useState('122001');
  const [type, setType] = useState<'Home' | 'Office' | 'Hostel' | 'Parents' | 'Other'>('Hostel');
  const [isDefault, setIsDefault] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!houseNumber.trim() && !building.trim()) {
      Alert.alert('Required Field', 'Please enter your House / Flat Number or Building Name.');
      return;
    }
    if (!locality.trim() || !city.trim()) {
      Alert.alert('Required Field', 'Please enter Area / Locality and City.');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setIsSubmitting(true);

    const newAddress: DeliveryAddress = {
      addressId: `addr_${Date.now()}`,
      receiverName: receiverName.trim() || 'Bhaskar',
      phoneNumber: phoneNumber.trim() || '+91 9876543210',
      houseNumber: houseNumber.trim() || 'House No.',
      building: building.trim() || 'Apartment',
      street: street.trim(),
      landmark: landmark.trim(),
      locality: locality.trim(),
      city: city.trim(),
      state: state.trim() || 'Haryana',
      pincode: pincode.trim() || '122001',
      country: 'India',
      type: type,
      isDefault: isDefault,
    };

    await saveAddress(newAddress);
    setIsSubmitting(false);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={18} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Delivery Address 📍</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* ─── 1. GOOGLE MAP INTERACTIVE PIN SIMULATION ─── */}
        <View style={styles.mapCard}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&auto=format&fit=crop&q=80' }}
            style={styles.mapImage}
          />
          <View style={styles.mapOverlay}>
            <View style={styles.pinBubble}>
              <Ionicons name="location" size={24} color="#EF4444" />
              <Text style={styles.pinBubbleText}>Order Delivered Here ⚡</Text>
            </View>
          </View>
        </View>

        {/* ─── 2. ADDRESS FORM ─── */}
        <View style={styles.formCard}>
          <Text style={styles.sectionHeaderTitle}>CONTACT DETAILS</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Receiver Name</Text>
            <TextInput
              style={styles.textInput}
              value={receiverName}
              onChangeText={setReceiverName}
              placeholder="e.g. Bhaskar Sharma"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.textInput}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              placeholder="+91 9876543210"
            />
          </View>

          <Text style={[styles.sectionHeaderTitle, { marginTop: 16 }]}>ADDRESS DETAILS</Text>

          <View style={styles.rowTwoInputs}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>House / Flat / Room No. *</Text>
              <TextInput
                style={styles.textInput}
                value={houseNumber}
                onChangeText={setHouseNumber}
                placeholder="e.g. Room 207 / Flat 302"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Building / Hostel Name</Text>
              <TextInput
                style={styles.textInput}
                value={building}
                onChangeText={setBuilding}
                placeholder="e.g. DPG Hostel / Royal Villa"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Street / Road Name</Text>
            <TextInput
              style={styles.textInput}
              value={street}
              onChangeText={setStreet}
              placeholder="e.g. Bailey Road / Main Sector Road"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Landmark (Optional)</Text>
            <TextInput
              style={styles.textInput}
              value={landmark}
              onChangeText={setLandmark}
              placeholder="e.g. Near Metro Station / Opp High Court"
            />
          </View>

          <View style={styles.rowTwoInputs}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Area / Locality *</Text>
              <TextInput
                style={styles.textInput}
                value={locality}
                onChangeText={setLocality}
                placeholder="e.g. Sector 34 / Kankarbagh"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>City *</Text>
              <TextInput
                style={styles.textInput}
                value={city}
                onChangeText={setCity}
                placeholder="e.g. Gurugram / Patna"
              />
            </View>
          </View>

          <View style={styles.rowTwoInputs}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>State</Text>
              <TextInput
                style={styles.textInput}
                value={state}
                onChangeText={setState}
                placeholder="e.g. Haryana / Bihar"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Pincode</Text>
              <TextInput
                style={styles.textInput}
                value={pincode}
                onChangeText={setPincode}
                keyboardType="number-pad"
                placeholder="e.g. 122001 / 800001"
              />
            </View>
          </View>

          {/* ─── 3. ADDRESS TYPE ─── */}
          <Text style={[styles.sectionHeaderTitle, { marginTop: 16 }]}>SAVE ADDRESS AS</Text>
          <View style={styles.typeContainer}>
            {ADDRESS_TYPES.map((t) => {
              const isSelected = type === t.id;
              return (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.typePill, isSelected && styles.typePillSelected]}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    setType(t.id as any);
                  }}
                  activeOpacity={0.85}
                >
                  <Ionicons
                    name={t.icon as any}
                    size={14}
                    color={isSelected ? '#FFFFFF' : THEME.PRIMARY}
                  />
                  <Text style={[styles.typeText, isSelected && styles.typeTextSelected]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ─── 4. DEFAULT TOGGLE ─── */}
          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleTitle}>Set as Default Delivery Address</Text>
              <Text style={styles.toggleSub}>Use this address automatically for all future orders</Text>
            </View>
            <Switch
              value={isDefault}
              onValueChange={(val) => {
                Haptics.selectionAsync().catch(() => {});
                setIsDefault(val);
              }}
              trackColor={{ false: '#CBD5E1', true: THEME.PRIMARY }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* ─── 5. SAVE BUTTON ─── */}
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSave}
            disabled={isSubmitting}
            activeOpacity={0.88}
          >
            <Text style={styles.saveBtnText}>Save Address & Deliver Here ⚡</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.BG_CREAM,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },

  // Map Card
  mapCard: {
    height: 160,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  mapOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    elevation: 4,
  },
  pinBubbleText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#0F172A',
  },

  // Form Card
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    elevation: 3,
    shadowColor: THEME.PRIMARY,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },
  sectionHeaderTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    marginBottom: 4,
  },
  textInput: {
    height: 46,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  rowTwoInputs: {
    flexDirection: 'row',
    gap: 10,
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#E8F5E9',
    gap: 6,
  },
  typePillSelected: {
    backgroundColor: THEME.PRIMARY,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '900',
    color: THEME.PRIMARY,
  },
  typeTextSelected: {
    color: '#FFFFFF',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 16,
  },
  toggleTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0F172A',
  },
  toggleSub: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: THEME.PRIMARY,
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 4,
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
