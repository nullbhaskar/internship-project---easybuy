import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../services/firebase';
import { doc, getDoc, setDoc, collection, getDocs, query, where } from 'firebase/firestore';
import {
  generateFullIndianCatalog,
  ProductItem,
  CategoryItem,
  PRODUCT_CATEGORIES,
  INDIAN_STATES_AND_UTS,
} from '../constants/mockDataGenerator';
import {
  requestLocationAndDetectGPS,
  normalizeStateToId,
} from '../services/locationPermissionService';

export interface DeliveryAddress {
  addressId: string;
  receiverName: string;
  phoneNumber: string;
  houseNumber: string;
  building: string;
  street: string;
  landmark: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  type: 'Home' | 'Office' | 'Hostel' | 'Parents' | 'Other';
  isDefault: boolean;
}

export const EMPTY_ADDRESS: DeliveryAddress = {
  addressId: 'empty',
  receiverName: '',
  phoneNumber: '',
  houseNumber: '',
  building: 'Civil Lines',
  street: 'Main Road',
  landmark: 'Central Park',
  locality: 'Civil Lines',
  city: 'Patna',
  state: 'Bihar',
  pincode: '800001',
  country: 'India',
  type: 'Home',
  isDefault: true,
};

export function sanitizeAddress(addr: Partial<DeliveryAddress> | null): DeliveryAddress {
  if (!addr) {
    return EMPTY_ADDRESS;
  }

  return {
    addressId: addr.addressId || `addr_${Date.now()}`,
    receiverName: addr.receiverName || 'Bhaskar',
    phoneNumber: addr.phoneNumber || '+91 9876543210',
    houseNumber: addr.houseNumber || '',
    building: addr.building || '',
    street: addr.street || '',
    landmark: addr.landmark || '',
    locality: addr.locality || '',
    city: addr.city || 'Patna',
    state: addr.state || 'Bihar',
    pincode: addr.pincode || '800001',
    country: addr.country || 'India',
    type: addr.type || 'Home',
    isDefault: addr.isDefault ?? true,
    latitude: addr.latitude,
    longitude: addr.longitude,
  };
}

interface AddressContextType {
  selectedAddress: DeliveryAddress;
  savedAddresses: DeliveryAddress[];
  selectedStateId: string;
  selectedStateName: string;
  stateProducts: ProductItem[];
  stateCategories: CategoryItem[];
  isLoadingLocation: boolean;
  isLocationModalOpen: boolean;
  setSelectedAddress: (addr: DeliveryAddress) => void;
  setSelectedStateId: (stateId: string) => Promise<void>;
  saveAddress: (addr: DeliveryAddress) => Promise<void>;
  deleteAddress: (addressId: string) => Promise<void>;
  updateGPSAddress: (title: string, sub: string, lat?: number, lon?: number) => void;
  detectCurrentLocationGPS: () => Promise<boolean>;
  openLocationModal: () => void;
  closeLocationModal: () => void;
  refreshStateData: () => Promise<void>;
}

const AddressContext = createContext<AddressContextType>({
  selectedAddress: EMPTY_ADDRESS,
  savedAddresses: [],
  selectedStateId: 'BR',
  selectedStateName: 'Bihar',
  stateProducts: [],
  stateCategories: PRODUCT_CATEGORIES,
  isLoadingLocation: false,
  isLocationModalOpen: false,
  setSelectedAddress: () => {},
  setSelectedStateId: async () => {},
  saveAddress: async () => {},
  deleteAddress: async () => {},
  updateGPSAddress: () => {},
  detectCurrentLocationGPS: async () => false,
  openLocationModal: () => {},
  closeLocationModal: () => {},
  refreshStateData: async () => {},
});

export const AddressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedAddress, setSelectedAddressState] = useState<DeliveryAddress>(EMPTY_ADDRESS);
  const [savedAddresses, setSavedAddresses] = useState<DeliveryAddress[]>([]);
  const [selectedStateId, setSelectedStateIdState] = useState<string>('BR');
  const [selectedStateName, setSelectedStateNameState] = useState<string>('Bihar');
  const [stateProducts, setStateProducts] = useState<ProductItem[]>([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const fullCatalog = generateFullIndianCatalog();

  // Fetch state-specific products from Firestore or offline catalog
  const loadProductsForState = async (stateId: string) => {
    try {
      // Try querying Firestore directly with stateId index
      const pRef = collection(db, 'products');
      const q = query(pRef, where('stateId', '==', stateId));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const firestoreProds: ProductItem[] = [];
        snap.forEach((docSnap) => {
          firestoreProds.push({ id: docSnap.id, ...docSnap.data() } as ProductItem);
        });
        setStateProducts(firestoreProds);
        return;
      }
    } catch (e) {
      console.log('Firestore state products query fallback to local catalog:', e);
    }

    // Fallback: Filter local catalog by stateId
    const filtered = fullCatalog.filter((p) => p.stateId === stateId);
    if (filtered.length > 0) {
      setStateProducts(filtered);
    } else {
      // General fallback if no state-specific items exist
      setStateProducts(fullCatalog.filter((p) => p.stateId === 'BR'));
    }
  };

  // Load saved address and location state on app launch
  useEffect(() => {
    async function loadAddressData() {
      try {
        setIsLoadingLocation(true);
        const localSaved = await AsyncStorage.getItem('easybuy_saved_addresses');
        const localSelected = await AsyncStorage.getItem('easybuy_selected_address');
        const localStateId = await AsyncStorage.getItem('easybuy_selected_state_id');
        const localStateName = await AsyncStorage.getItem('easybuy_selected_state_name');

        if (localSaved) {
          const parsed = JSON.parse(localSaved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSavedAddresses(parsed);
          }
        }

        let currentStateId = 'BR';
        let currentStateName = 'Bihar';

        if (localSelected) {
          const parsedAddr = sanitizeAddress(JSON.parse(localSelected));
          setSelectedAddressState(parsedAddr);
          const norm = normalizeStateToId(parsedAddr.state);
          currentStateId = norm.stateId;
          currentStateName = norm.stateName;
        }

        if (localStateId) {
          currentStateId = localStateId;
        }
        if (localStateName) {
          currentStateName = localStateName;
        }

        const currentUser = auth.currentUser;
        if (currentUser) {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userDocRef);

          if (userSnap.exists()) {
            const data = userSnap.data();
            if (data.addresses && Array.isArray(data.addresses) && data.addresses.length > 0) {
              setSavedAddresses(data.addresses);
              await AsyncStorage.setItem('easybuy_saved_addresses', JSON.stringify(data.addresses));
            }
            if (data.selectedAddress) {
              const sanitizedDocAddr = sanitizeAddress(data.selectedAddress);
              setSelectedAddressState(sanitizedDocAddr);
              await AsyncStorage.setItem('easybuy_selected_address', JSON.stringify(sanitizedDocAddr));
              const norm = normalizeStateToId(sanitizedDocAddr.state);
              currentStateId = norm.stateId;
              currentStateName = norm.stateName;
            }
            if (data.stateId) {
              currentStateId = data.stateId;
            }
            if (data.stateName) {
              currentStateName = data.stateName;
            }
          }
        }

        setSelectedStateIdState(currentStateId);
        setSelectedStateNameState(currentStateName);
        await loadProductsForState(currentStateId);
      } catch (e) {
        console.log('Error loading addresses:', e);
      } finally {
        setIsLoadingLocation(false);
      }
    }

    loadAddressData();
  }, []);

  const setSelectedAddress = async (addr: DeliveryAddress) => {
    const cleanAddr = sanitizeAddress(addr);
    setSelectedAddressState(cleanAddr);
    const norm = normalizeStateToId(cleanAddr.state);
    setSelectedStateIdState(norm.stateId);
    setSelectedStateNameState(norm.stateName);

    try {
      await AsyncStorage.setItem('easybuy_selected_address', JSON.stringify(cleanAddr));
      await AsyncStorage.setItem('easybuy_selected_state_id', norm.stateId);
      await AsyncStorage.setItem('easybuy_selected_state_name', norm.stateName);

      const currentUser = auth.currentUser;
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await setDoc(
          userDocRef,
          {
            selectedAddress: cleanAddr,
            stateId: norm.stateId,
            stateName: norm.stateName,
          },
          { merge: true }
        );
      }

      await loadProductsForState(norm.stateId);
    } catch (e) {
      console.log('Error setting selected address:', e);
    }
  };

  const setSelectedStateId = async (stateId: string) => {
    const stateObj = INDIAN_STATES_AND_UTS.find((s) => s.id === stateId);
    const stateName = stateObj ? stateObj.name : 'Bihar';

    setSelectedStateIdState(stateId);
    setSelectedStateNameState(stateName);

    const isSameState = selectedAddress.state.toLowerCase() === stateName.toLowerCase();
    const updatedAddress: DeliveryAddress = sanitizeAddress({
      ...selectedAddress,
      state: stateName,
      city: isSameState && selectedAddress.city ? selectedAddress.city : (stateObj ? stateObj.majorCities[0] : 'City'),
      locality: isSameState && selectedAddress.locality ? selectedAddress.locality : (stateObj ? stateObj.majorCities[1] || stateObj.capital : 'Local Area'),
    });

    setSelectedAddressState(updatedAddress);

    try {
      await AsyncStorage.setItem('easybuy_selected_state_id', stateId);
      await AsyncStorage.setItem('easybuy_selected_state_name', stateName);
      await AsyncStorage.setItem('easybuy_selected_address', JSON.stringify(updatedAddress));

      const currentUser = auth.currentUser;
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await setDoc(
          userDocRef,
          {
            stateId: stateId,
            stateName: stateName,
            selectedAddress: updatedAddress,
          },
          { merge: true }
        );
      }

      await loadProductsForState(stateId);
    } catch (e) {
      console.log('Error setting selected state:', e);
    }
  };

  const detectCurrentLocationGPS = async (): Promise<boolean> => {
    setIsLoadingLocation(true);
    try {
      const res = await requestLocationAndDetectGPS();
      if (res.success && res.address && res.stateId) {
        const cleanResAddr = sanitizeAddress(res.address);
        setSelectedAddressState(cleanResAddr);
        setSelectedStateIdState(res.stateId);
        setSelectedStateNameState(res.stateName || 'Bihar');
        await loadProductsForState(res.stateId);
        return true;
      }
      return false;
    } catch (e) {
      console.log('Error detecting GPS:', e);
      return false;
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const saveAddress = async (addr: DeliveryAddress) => {
    let updatedList: DeliveryAddress[] = [];
    const exists = savedAddresses.some((a) => a.addressId === addr.addressId);

    if (exists) {
      updatedList = savedAddresses.map((a) => (a.addressId === addr.addressId ? addr : a));
    } else {
      updatedList = [addr, ...savedAddresses];
    }

    if (addr.isDefault) {
      updatedList = updatedList.map((a) => ({ ...a, isDefault: a.addressId === addr.addressId }));
    }

    setSavedAddresses(updatedList);
    await setSelectedAddress(addr);

    try {
      await AsyncStorage.setItem('easybuy_saved_addresses', JSON.stringify(updatedList));

      const currentUser = auth.currentUser;
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await setDoc(userDocRef, { addresses: updatedList, selectedAddress: addr }, { merge: true });
      }
    } catch (e) {
      console.log('Error saving address:', e);
    }
  };

  const deleteAddress = async (addressId: string) => {
    const updatedList = savedAddresses.filter((a) => a.addressId !== addressId);
    setSavedAddresses(updatedList);

    if (selectedAddress.addressId === addressId) {
      if (updatedList.length > 0) {
        await setSelectedAddress(updatedList[0]);
      }
    }

    try {
      await AsyncStorage.setItem('easybuy_saved_addresses', JSON.stringify(updatedList));
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await setDoc(userDocRef, { addresses: updatedList }, { merge: true });
      }
    } catch (e) {
      console.log('Error deleting address:', e);
    }
  };

  const updateGPSAddress = (primary: string, secondary: string, lat?: number, lon?: number) => {
    const parts = primary.split(',');
    const house = parts[0] ? parts[0].trim() : 'Current Location';
    const locality = parts[1] ? parts[1].trim() : secondary;

    const gpsAddress: DeliveryAddress = {
      addressId: `gps_${Date.now()}`,
      receiverName: '',
      phoneNumber: '',
      houseNumber: house,
      building: 'GPS Location',
      street: locality,
      landmark: 'Current GPS',
      locality: locality,
      city: secondary.split(',')[0] || 'City',
      state: secondary.split(',')[1] || '',
      pincode: '',
      country: 'India',
      type: 'Other',
      isDefault: true,
      latitude: lat,
      longitude: lon,
    };

    setSelectedAddress(gpsAddress);
  };

  const openLocationModal = () => setIsLocationModalOpen(true);
  const closeLocationModal = () => setIsLocationModalOpen(false);

  const refreshStateData = async () => {
    await loadProductsForState(selectedStateId);
  };

  return (
    <AddressContext.Provider
      value={{
        selectedAddress,
        savedAddresses,
        selectedStateId,
        selectedStateName,
        stateProducts,
        stateCategories: PRODUCT_CATEGORIES,
        isLoadingLocation,
        isLocationModalOpen,
        setSelectedAddress,
        setSelectedStateId,
        saveAddress,
        deleteAddress,
        updateGPSAddress,
        detectCurrentLocationGPS,
        openLocationModal,
        closeLocationModal,
        refreshStateData,
      }}
    >
      {children}
    </AddressContext.Provider>
  );
};

export const useAddress = () => useContext(AddressContext);
