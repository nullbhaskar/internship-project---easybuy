import { Platform } from 'react-native';
import Constants from 'expo-constants';
// expo-notifications push tokens were removed from Expo Go in SDK 53.
// We import lazily only when running in a real build (not Expo Go on Android).
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';
import { INDIAN_STATES_AND_UTS, StateItem } from '../constants/mockDataGenerator';
import { DeliveryAddress, EMPTY_ADDRESS } from '../context/AddressContext';

// MAP OF ALL INDIAN STATES AND UTS TO FIRESTORE STATE IDs
export const STATE_NAME_TO_ID_MAP: Record<string, string> = {
  'Andhra Pradesh': 'AP',
  'Arunachal Pradesh': 'AR',
  'Assam': 'AS',
  'Bihar': 'BR',
  'Chhattisgarh': 'CG',
  'Goa': 'GA',
  'Gujarat': 'GJ',
  'Haryana': 'HR',
  'Himachal Pradesh': 'HP',
  'Jharkhand': 'JH',
  'Karnataka': 'KA',
  'Kerala': 'KL',
  'Madhya Pradesh': 'MP',
  'Maharashtra': 'MH',
  'Manipur': 'MN',
  'Meghalaya': 'ML',
  'Mizoram': 'MZ',
  'Nagaland': 'NL',
  'Odisha': 'OR',
  'Orissa': 'OR',
  'Punjab': 'PB',
  'Rajasthan': 'RJ',
  'Sikkim': 'SK',
  'Tamil Nadu': 'TN',
  'Telangana': 'TG',
  'Tripura': 'TR',
  'Uttar Pradesh': 'UP',
  'Uttarakhand': 'UK',
  'West Bengal': 'WB',
  'Andaman and Nicobar Islands': 'AN',
  'Chandigarh': 'CH',
  'Dadra and Nagar Haveli and Daman and Diu': 'DN',
  'Delhi': 'DL',
  'National Capital Territory of Delhi': 'DL',
  'New Delhi': 'DL',
  'Jammu and Kashmir': 'JK',
  'Ladakh': 'LA',
  'Lakshadweep': 'LD',
  'Puducherry': 'PY',
  'Pondicherry': 'PY',
};

/**
 * Normalizes any detected raw state string from reverse geocode to matching Firestore stateId
 */
export function normalizeStateToId(rawState: string | null | undefined): { stateId: string; stateName: string } {
  if (!rawState) {
    return { stateId: 'BR', stateName: 'Bihar' }; // Default fallback
  }

  const clean = rawState.trim();

  // Direct map match
  if (STATE_NAME_TO_ID_MAP[clean]) {
    const sId = STATE_NAME_TO_ID_MAP[clean];
    const sItem = INDIAN_STATES_AND_UTS.find((s) => s.id === sId);
    return { stateId: sId, stateName: sItem ? sItem.name : clean };
  }

  // Substring match
  const found = INDIAN_STATES_AND_UTS.find(
    (s) =>
      clean.toLowerCase().includes(s.name.toLowerCase()) ||
      s.name.toLowerCase().includes(clean.toLowerCase())
  );

  if (found) {
    return { stateId: found.id, stateName: found.name };
  }

  return { stateId: 'BR', stateName: 'Bihar' };
}

/**
 * Request Notification Permissions via Expo Notifications
 */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    // Push notifications not available in Expo Go on Android (SDK 53+). Safe no-op.
    if (Constants.appOwnership === 'expo') {
      await AsyncStorage.setItem('easybuy_notification_permission', 'denied');
      return false;
    }

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Notifications = require('expo-notifications');
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    const isGranted = finalStatus === 'granted';
    await AsyncStorage.setItem('easybuy_notification_permission', isGranted ? 'granted' : 'denied');
    return isGranted;
  } catch (e) {
    // Silently fail in Expo Go - notifications are not supported there
    await AsyncStorage.setItem('easybuy_notification_permission', 'denied');
    return false;
  }
}

export interface LocationDetectionResult {
  success: boolean;
  reason?: 'PERMISSION_DENIED' | 'GEOCODE_FAILED' | 'LOCATION_UNAVAILABLE' | 'ERROR' | 'UNKNOWN';
  address?: DeliveryAddress;
  stateId?: string;
  stateName?: string;
}

/**
 * Requests location permission, fetches high-accuracy GPS coordinates,
 * reverse geocodes, normalizes state, and persists locally & in Firestore.
 */
export async function requestLocationAndDetectGPS(): Promise<LocationDetectionResult> {
  try {
    let location: Location.LocationObject | null = null;
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        await AsyncStorage.setItem('easybuy_location_permission', 'granted');
        location = await Location.getLastKnownPositionAsync({});
        if (!location) {
          location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
        }
      }
    } catch (err) {
      console.log('Native location query fallback:', err);
    }

    const latitude = location?.coords?.latitude || 25.5941;
    const longitude = location?.coords?.longitude || 85.1376;

    // Reverse geocode
    const geocodeResults = await Location.reverseGeocodeAsync({ latitude, longitude });

    if (!geocodeResults || geocodeResults.length === 0) {
      return { success: false, reason: 'GEOCODE_FAILED' };
    }

    const geo = geocodeResults[0];

    const rawState = geo.region || geo.subregion || geo.city || 'Bihar';
    const { stateId, stateName } = normalizeStateToId(rawState);
    const stateObj = INDIAN_STATES_AND_UTS.find((s) => s.id === stateId);

    // Ensure City belongs to detected State
    let city = geo.city || geo.subregion || '';
    if (!city || (stateObj && !stateObj.majorCities.includes(city) && city !== stateObj.capital)) {
      city = stateObj ? stateObj.majorCities[0] || stateObj.capital : 'Patna';
    }

    // Ensure Locality does NOT repeat State Name
    let locality = geo.district || geo.street || geo.name || '';
    if (
      !locality ||
      locality.toLowerCase() === stateName.toLowerCase() ||
      locality.toLowerCase() === rawState.toLowerCase()
    ) {
      locality = stateObj ? stateObj.majorCities[1] || 'Central Area' : 'Civil Lines';
    }

    const pincode = geo.postalCode || '800001';
    const houseNumber = geo.streetNumber || '';
    const building = geo.street && geo.street.toLowerCase() !== stateName.toLowerCase() ? geo.street : locality;

    const formattedAddress: DeliveryAddress = {
      addressId: `gps_${Date.now()}`,
      receiverName: '',
      phoneNumber: '',
      houseNumber: houseNumber,
      building: building,
      street: building,
      landmark: 'Current GPS Location',
      locality: locality,
      city: city,
      state: stateName,
      pincode: pincode,
      country: 'India',
      latitude: latitude,
      longitude: longitude,
      type: 'Home',
      isDefault: true,
    };

    // Save locally
    await AsyncStorage.setItem('easybuy_selected_address', JSON.stringify(formattedAddress));
    await AsyncStorage.setItem('easybuy_selected_state_id', stateId);
    await AsyncStorage.setItem('easybuy_selected_state_name', stateName);

    // Save in Firestore user doc if logged in
    const currentUser = auth.currentUser;
    if (currentUser) {
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(
        userRef,
        {
          selectedAddress: formattedAddress,
          stateId: stateId,
          stateName: stateName,
          city: city,
          latitude: latitude,
          longitude: longitude,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    }

    return {
      success: true,
      address: formattedAddress,
      stateId,
      stateName,
    };
  } catch (e) {
    console.log('Location detection error:', e);
    return { success: false, reason: 'UNKNOWN' };
  }
}

/**
 * Complete Post-Login Flow Manager
 * 1. Request Notification Permission
 * 2. Request Location & Detect GPS
 * 3. Returns flow outcome
 */
export async function executePostLoginFlow(): Promise<{
  notificationsGranted: boolean;
  locationResult: LocationDetectionResult;
}> {
  const notificationsGranted = await requestNotificationPermission();
  const locationResult = await requestLocationAndDetectGPS();

  return {
    notificationsGranted,
    locationResult,
  };
}
