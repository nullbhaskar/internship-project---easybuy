import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Alert,
  Dimensions,
  Image,
  Platform,
  PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { useAddress, DeliveryAddress } from '../../context/AddressContext';
import { INDIAN_STATES_AND_UTS } from '../../constants/mockDataGenerator';
import { useEasyBuyTheme } from '../../constants/ThemeContext';
import { normalizeStateToId } from '../../services/locationPermissionService';
import { WebView } from 'react-native-webview';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// STATE CAPITAL GPS COORDINATES FOR AUTOMATIC MAP RE-CENTERING
const STATE_CAPITAL_COORDS: Record<string, { lat: number; lng: number; city: string }> = {
  AP: { lat: 16.5062, lng: 80.6480, city: 'Vijayawada' },
  AR: { lat: 27.0844, lng: 93.6053, city: 'Itanagar' },
  AS: { lat: 26.1445, lng: 91.7362, city: 'Dispur' },
  BR: { lat: 25.5941, lng: 85.1376, city: 'Patna' },
  CG: { lat: 21.2514, lng: 81.6296, city: 'Raipur' },
  DL: { lat: 28.6139, lng: 77.2090, city: 'New Delhi' },
  GA: { lat: 15.4909, lng: 73.8278, city: 'Panaji' },
  GJ: { lat: 23.2156, lng: 72.6369, city: 'Gandhinagar' },
  HR: { lat: 30.7333, lng: 76.7794, city: 'Chandigarh' },
  HP: { lat: 31.1048, lng: 77.1734, city: 'Shimla' },
  JH: { lat: 23.3441, lng: 85.3096, city: 'Ranchi' },
  KA: { lat: 12.9716, lng: 77.5946, city: 'Bengaluru' },
  KL: { lat: 8.5241, lng: 76.9366, city: 'Thiruvananthapuram' },
  MP: { lat: 23.2599, lng: 77.4126, city: 'Bhopal' },
  MH: { lat: 19.0760, lng: 72.8777, city: 'Mumbai' },
  MN: { lat: 24.8170, lng: 93.9368, city: 'Imphal' },
  ML: { lat: 25.5788, lng: 91.8933, city: 'Shillong' },
  MZ: { lat: 23.7271, lng: 92.7176, city: 'Aizawl' },
  NL: { lat: 25.6751, lng: 94.1086, city: 'Kohima' },
  OR: { lat: 20.2961, lng: 85.8245, city: 'Bhubaneswar' },
  PB: { lat: 30.7333, lng: 76.7794, city: 'Chandigarh' },
  RJ: { lat: 26.9124, lng: 75.7873, city: 'Jaipur' },
  SK: { lat: 27.3389, lng: 88.6065, city: 'Gangtok' },
  TN: { lat: 13.0827, lng: 80.2707, city: 'Chennai' },
  TG: { lat: 17.3850, lng: 78.4867, city: 'Hyderabad' },
  TR: { lat: 23.8315, lng: 91.2868, city: 'Agartala' },
  UP: { lat: 26.8467, lng: 80.9462, city: 'Lucknow' },
  UK: { lat: 30.3165, lng: 78.0322, city: 'Dehradun' },
  WB: { lat: 22.5726, lng: 88.3639, city: 'Kolkata' },
};

export const LocationPickerModal: React.FC = () => {
  const {
    selectedAddress,
    savedAddresses,
    selectedStateId,
    isLocationModalOpen,
    closeLocationModal,
    setSelectedAddress,
    setSelectedStateId,
    detectCurrentLocationGPS,
    isLoadingLocation,
  } = useAddress();

  const { isDarkMode } = useEasyBuyTheme();
  const isDark = isDarkMode;

  const [activeTab, setActiveTab] = useState<'states' | 'saved'>('states');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [isFullScreenMapOpen, setIsFullScreenMapOpen] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 4,
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 30 || gestureState.vy > 0.25) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          closeLocationModal();
        }
      },
    })
  ).current;

  const initialLocality = selectedAddress
    ? `${selectedAddress.locality || selectedAddress.city}, ${selectedAddress.state}`
    : 'Fetching Location...';

  const [pinnedLocationName, setPinnedLocationName] = useState<string>(initialLocality);
  const [fullAddressDetails, setFullAddressDetails] = useState<{
    road: string;
    suburb: string;
    city: string;
    state: string;
    stateId: string;
    pincode: string;
  }>({
    road: selectedAddress?.street || 'Main Road',
    suburb: selectedAddress?.locality || 'Selected Area',
    city: selectedAddress?.city || 'City',
    state: selectedAddress?.state || 'State',
    stateId: selectedStateId || 'BR',
    pincode: selectedAddress?.pincode || '800001',
  });

  // Real Dynamic Coordinates State
  const [coords, setCoords] = useState<{ lat: number; lng: number }>(() => {
    if (selectedAddress?.latitude && selectedAddress?.longitude) {
      return { lat: selectedAddress.latitude, lng: selectedAddress.longitude };
    }
    const cap = STATE_CAPITAL_COORDS[selectedStateId || 'BR'];
    return { lat: cap?.lat || 25.5941, lng: cap?.lng || 85.1376 };
  });

  // Query device GPS on open
  useEffect(() => {
    if (isLocationModalOpen) {
      if (typeof window !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            if (pos && pos.coords) {
              setCoords({
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
              });
            }
          },
          (err) => console.log('Geolocation query info:', err),
          { timeout: 8000, enableHighAccuracy: true }
        );
      }
    }
  }, [isLocationModalOpen]);

  // Listen for Leaflet Map Tap / Drag PostMessage Events (web-only)
  useEffect(() => {
    // window.addEventListener does not exist in React Native — only attach on web
    if (Platform.OS !== 'web') return;

    const handleMapMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'EASYBUY_MAP_TAP') {
        const { lat, lng } = event.data;
        if (typeof lat === 'number' && typeof lng === 'number') {
          setCoords({ lat, lng });
          Haptics.selectionAsync().catch(() => {});
        }
      }
    };

    window.addEventListener('message', handleMapMessage);
    return () => window.removeEventListener('message', handleMapMessage);
  }, []);

  // Reverse Geocode via Nominatim OSM API & Expo Location Fallback
  useEffect(() => {
    let isMounted = true;
    async function fetchWorldReverseGeocode() {
      try {
        // 1. Try Nominatim Free OpenStreetMap API (Worldwide coverage, 0 hardcoded text)
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}&addressdetails=1`
        );
        if (response.ok) {
          const data = await response.json();
          if (isMounted && data && data.address) {
            const addr = data.address;
            const road = addr.road || addr.pedestrian || addr.footway || addr.suburb || addr.neighbourhood || addr.village || 'Area Road';
            const suburb = addr.suburb || addr.neighbourhood || addr.residential || addr.subdistrict || addr.county || addr.town || addr.village || addr.city_district || addr.state_district || 'Local Area';
            const city = addr.city || addr.town || addr.city_district || addr.county || addr.state_district || addr.state || 'City';
            const rawState = addr.state || 'India';
            const norm = normalizeStateToId(rawState);
            const pincode = addr.postcode || '800001';

            const displayName = suburb !== city ? `${suburb}, ${city}` : `${suburb}, ${norm.stateName}`;
            setPinnedLocationName(displayName);
            setFullAddressDetails({
              road,
              suburb,
              city,
              state: norm.stateName,
              stateId: norm.stateId,
              pincode,
            });
            return;
          }
        }
      } catch (e) {
        // Quiet fallback to Expo reverseGeocodeAsync
      }

      try {
        const results = await Location.reverseGeocodeAsync({
          latitude: coords.lat,
          longitude: coords.lng,
        });
        if (isMounted && results && results.length > 0) {
          const g = results[0];
          const locality = g.district || g.subregion || g.street || g.name || 'Local Area';
          const city = g.city || g.subregion || g.region || 'City';
          const rawState = g.region || g.subregion || 'India';
          const norm = normalizeStateToId(rawState);

          const displayName = locality !== city ? `${locality}, ${city}` : `${locality}, ${norm.stateName}`;
          setPinnedLocationName(displayName);
          setFullAddressDetails({
            road: g.street || locality,
            suburb: locality,
            city,
            state: norm.stateName,
            stateId: norm.stateId,
            pincode: g.postalCode || '800001',
          });
        }
      } catch (err) {
        if (isMounted) {
          setPinnedLocationName('Selected Pin Location');
        }
      }
    }

    fetchWorldReverseGeocode();
    return () => {
      isMounted = false;
    };
  }, [coords.lat, coords.lng]);

  if (!isLocationModalOpen) return null;

  // Confirm Pinned / GPS Location
  const handleConfirmPinnedLocation = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setIsDetecting(true);

    const pinnedAddress: DeliveryAddress = {
      addressId: `pinned_${Date.now()}`,
      receiverName: 'User',
      phoneNumber: '9876543210',
      houseNumber: fullAddressDetails.road || 'Plot 12',
      building: fullAddressDetails.suburb || 'Local Area',
      street: fullAddressDetails.road || fullAddressDetails.suburb,
      landmark: 'Near Main Road',
      locality: fullAddressDetails.suburb,
      city: fullAddressDetails.city,
      state: fullAddressDetails.state,
      pincode: fullAddressDetails.pincode,
      country: 'India',
      latitude: coords.lat,
      longitude: coords.lng,
      type: 'Home',
      isDefault: true,
    };

    await setSelectedAddress(pinnedAddress);
    setIsDetecting(false);
    setIsFullScreenMapOpen(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    closeLocationModal();
  };

  const handleSelectState = async (stateId: string) => {
    // Re-center map dynamically on selected state's capital!
    const cap = STATE_CAPITAL_COORDS[stateId];
    if (cap) {
      setCoords({ lat: cap.lat, lng: cap.lng });
    }
    await setSelectedStateId(stateId);
    closeLocationModal();
  };

  const filteredStates = INDIAN_STATES_AND_UTS.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.capital.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentLat = coords.lat || 25.5941;
  const currentLng = coords.lng || 85.1376;

  // Leaflet JS Interactive HTML Document for Draggable Pin & Tap
  const leafletMapHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; background: #0F172A; }
    .leaflet-control-attribution { display: none !important; }
    .custom-pin { width: 34px; height: 34px; background: #059669; border: 3px solid #FFFFFF; border-radius: 50%; box-shadow: 0 4px 14px rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; }
    .custom-pin::after { content: ''; width: 12px; height: 12px; background: #FFFFFF; border-radius: 50%; }
    #locate-btn {
      position: absolute;
      bottom: 86px;
      right: 10px;
      z-index: 1000;
      background: #FFFFFF;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      box-shadow: 0 2px 10px rgba(0,0,0,0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border: 2px solid #E2E8F0;
      transition: all 0.2s;
    }
    #locate-btn:active { transform: scale(0.92); background: #F0FDF4; border-color: #059669; }
    #locate-btn.locating { border-color: #059669; animation: gpsPulse 0.9s infinite; }
    @keyframes gpsPulse {
      0%, 100% { box-shadow: 0 2px 10px rgba(5,150,105,0.2); }
      50% { box-shadow: 0 2px 18px rgba(5,150,105,0.6); }
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <div id="locate-btn" onclick="requestGPS()" title="Use my current GPS location">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="3" fill="#059669"/>
      <line x1="12" y1="2" x2="12" y2="6"/>
      <line x1="12" y1="18" x2="12" y2="22"/>
      <line x1="2" y1="12" x2="6" y2="12"/>
      <line x1="18" y1="12" x2="22" y2="12"/>
    </svg>
  </div>
  <script>
    var currentLat = ${currentLat};
    var currentLng = ${currentLng};
    
    var map = L.map('map', { zoomControl: true, attributionControl: false }).setView([currentLat, currentLng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

    var pinIcon = L.divIcon({ className: 'custom-pin', iconSize: [34, 34], iconAnchor: [17, 17] });
    var marker = L.marker([currentLat, currentLng], { draggable: true, icon: pinIcon }).addTo(map);

    function sendCoord(lat, lng) {
      var payload = JSON.stringify({ type: 'EASYBUY_MAP_TAP', lat: lat, lng: lng });
      if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(payload);
      if (window.parent) window.parent.postMessage({ type: 'EASYBUY_MAP_TAP', lat: lat, lng: lng }, '*');
    }

    function requestGPS() {
      var btn = document.getElementById('locate-btn');
      if (btn) btn.classList.add('locating');
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          function(pos) {
            if (btn) btn.classList.remove('locating');
            var lat = pos.coords.latitude;
            var lng = pos.coords.longitude;
            marker.setLatLng([lat, lng]);
            map.setView([lat, lng], 17);
            sendCoord(lat, lng);
          },
          function(err) {
            if (btn) btn.classList.remove('locating');
            console.log('GPS error:', err.message);
          },
          { timeout: 8000, enableHighAccuracy: true, maximumAge: 0 }
        );
      } else {
        if (btn) btn.classList.remove('locating');
      }
    }

    marker.on('dragend', function(e) { var pos = e.target.getLatLng(); sendCoord(pos.lat, pos.lng); });
    map.on('click', function(e) { marker.setLatLng(e.latlng); sendCoord(e.latlng.lat, e.latlng.lng); });
  </script>
</body>
</html>
`;

  return (
    <>
      <Modal
        visible={isLocationModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={closeLocationModal}
      >
        <TouchableWithoutFeedback onPress={closeLocationModal}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.modalContainer,
                  { backgroundColor: isDarkMode ? '#121927' : '#FFFFFF' },
                ]}
              >
                {/* Interactive Drag & Swipe Down Handle */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                    closeLocationModal();
                  }}
                  {...panResponder.panHandlers}
                  style={styles.dragHandleContainer}
                >
                  <View style={[styles.dragHandle, { backgroundColor: isDarkMode ? '#475569' : '#CBD5E1' }]} />
                </TouchableOpacity>

                {/* Modal Header */}
                <View style={styles.header}>
                  <View>
                    <Text style={[styles.headerTitle, { color: isDarkMode ? '#FFFFFF' : '#0F172A' }]}>
                      Choose Delivery Location
                    </Text>
                    <Text style={[styles.headerSubtitle, { color: isDarkMode ? '#94A3B8' : '#64748B' }]}>
                      Tap map preview or button to open interactive map page
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={closeLocationModal}
                    style={[styles.closeBtn, { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9' }]}
                  >
                    <Ionicons name="close" size={20} color={isDarkMode ? '#FFFFFF' : '#0F172A'} />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                  {/* ─── 🗺️ INTERACTIVE MAP CARD PREVIEW (220px) ─── */}
                  <TouchableOpacity
                    onPress={() => setIsFullScreenMapOpen(true)}
                    activeOpacity={0.92}
                    style={styles.mapCardContainer}
                  >
                    {Platform.OS === 'web' ? (
                      <iframe
                        srcDoc={leafletMapHtml}
                        style={{
                          width: '100%',
                          height: '100%',
                          border: 0,
                          borderRadius: 20,
                          pointerEvents: 'auto',
                        }}
                        title="Interactive Location Map Preview"
                      />
                    ) : (
                      <WebView
                        originWhitelist={['*']}
                        source={{ html: leafletMapHtml }}
                        style={{ flex: 1, backgroundColor: 'transparent', borderRadius: 20 }}
                        scrollEnabled={false}
                        onMessage={(event) => {
                          try {
                            const data = JSON.parse(event.nativeEvent.data);
                            if (data && data.type === 'EASYBUY_MAP_TAP') {
                              const { lat, lng } = data;
                              if (typeof lat === 'number' && typeof lng === 'number') {
                                setCoords({ lat, lng });
                              }
                            }
                          } catch (_) {}
                        }}
                      />
                    )}

                    {/* Top-Right Live GPS Coordinates & Location Name Badge */}
                    <View style={[styles.mapGpsBadge, { backgroundColor: isDark ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.95)' }]}>
                      <View style={styles.mapGpsDot} />
                      <Text style={[styles.mapGpsTxt, { color: isDark ? '#E2E8F0' : '#0F172A' }]}>
                        {pinnedLocationName} ({currentLat.toFixed(4)}°, {currentLng.toFixed(4)}°)
                      </Text>
                    </View>

                    {/* Floating Action Button: [ Confirm Location ] */}
                    <TouchableOpacity
                      onPress={handleConfirmPinnedLocation}
                      disabled={isDetecting || isLoadingLocation}
                      activeOpacity={0.88}
                      style={styles.mapDetectBtn}
                    >
                      {isDetecting || isLoadingLocation ? (
                        <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
                      ) : (
                        <Ionicons name="location" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                      )}
                      <Text style={styles.mapDetectBtnText}>
                        {isDetecting ? 'Setting Location...' : `Confirm Location • ${pinnedLocationName}`}
                      </Text>
                    </TouchableOpacity>
                  </TouchableOpacity>

                  {/* ─── SEARCH STATE / CITY ─── */}
                  <View
                    style={[
                      styles.searchBox,
                      { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: isDark ? '#334155' : '#E2E8F0' },
                    ]}
                  >
                    <Ionicons name="search" size={18} color={isDark ? '#94A3B8' : '#64748B'} style={{ marginRight: 8 }} />
                    <TextInput
                      placeholder="Search state, city, capital, or UT..."
                      placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      style={[styles.searchInput, { color: isDark ? '#FFFFFF' : '#0F172A' }]}
                    />
                    {searchQuery.length > 0 && (
                      <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={16} color={isDark ? '#64748B' : '#94A3B8'} />
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* ─── RECENT LOCATIONS CHIPS ─── */}
                  <View style={styles.recentSection}>
                    <Text style={[styles.recentLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                      RECENT LOCATIONS
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentScroll}>
                      <TouchableOpacity
                        style={[styles.recentChip, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}
                        onPress={() => handleSelectState('br')}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="school-outline" size={14} color="#16A34A" />
                        <Text style={[styles.recentChipText, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>Hostel</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.recentChip, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}
                        onPress={() => handleSelectState('br')}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="home-outline" size={14} color="#2563EB" />
                        <Text style={[styles.recentChipText, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>Home</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.recentChip, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}
                        onPress={() => handleSelectState('wb')}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="book-outline" size={14} color="#9333EA" />
                        <Text style={[styles.recentChipText, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>College</Text>
                      </TouchableOpacity>
                    </ScrollView>
                  </View>

                  {/* ─── TABS & STATES LIST ─── */}
                  <View style={styles.tabRow}>
                    <TouchableOpacity
                      onPress={() => setActiveTab('states')}
                      style={[
                        styles.tabItem,
                        activeTab === 'states' && styles.tabItemActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.tabText,
                          { color: activeTab === 'states' ? '#166534' : isDark ? '#94A3B8' : '#64748B' },
                        ]}
                      >
                        All States & UTs ({INDIAN_STATES_AND_UTS.length})
                      </Text>
                    </TouchableOpacity>

                    {savedAddresses.length > 0 && (
                      <TouchableOpacity
                        onPress={() => setActiveTab('saved')}
                        style={[
                          styles.tabItem,
                          activeTab === 'saved' && styles.tabItemActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.tabText,
                            { color: activeTab === 'saved' ? '#166534' : isDark ? '#94A3B8' : '#64748B' },
                          ]}
                        >
                          Saved Addresses ({savedAddresses.length})
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* List Items */}
                  {activeTab === 'states' ? (
                    <View style={styles.statesContainer}>
                      {filteredStates.map((item) => {
                        const isSelected = item.id === selectedStateId;
                        return (
                          <TouchableOpacity
                            key={item.id}
                            onPress={() => handleSelectState(item.id)}
                            style={[
                              styles.stateCard,
                              {
                                backgroundColor: isSelected
                                  ? isDark
                                    ? '#064E3B'
                                    : '#ECFDF5'
                                  : isDark
                                  ? '#1E293B'
                                  : '#F8FAFC',
                                borderColor: isSelected ? '#10B981' : isDark ? '#334155' : '#E2E8F0',
                              },
                            ]}
                          >
                            <View style={styles.stateLeft}>
                              <View
                                style={[
                                  styles.stateBadge,
                                  { backgroundColor: isSelected ? '#10B981' : isDark ? '#334155' : '#E2E8F0' },
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.stateBadgeText,
                                    { color: isSelected ? '#FFFFFF' : isDark ? '#94A3B8' : '#475569' },
                                  ]}
                                >
                                  {item.code}
                                </Text>
                              </View>

                              <View>
                                <Text
                                  style={[
                                    styles.stateName,
                                    { color: isSelected ? (isDark ? '#6EE7B7' : '#065F46') : isDark ? '#FFFFFF' : '#0F172A' },
                                  ]}
                                >
                                  {item.name}
                                </Text>
                                <Text style={[styles.stateSub, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                                  {item.type} • Capital: {item.capital}
                                </Text>
                              </View>
                            </View>

                            {isSelected ? (
                              <Ionicons name="checkmark-circle" size={22} color="#10B981" />
                            ) : (
                              <Ionicons name="chevron-forward" size={18} color={isDark ? '#475569' : '#94A3B8'} />
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  ) : (
                    <View style={styles.statesContainer}>
                      {savedAddresses.map((addr) => {
                        const isSelected = addr.addressId === selectedAddress?.addressId;
                        return (
                          <TouchableOpacity
                            key={addr.addressId}
                            onPress={() => {
                              setSelectedAddress(addr);
                              closeLocationModal();
                            }}
                            style={[
                              styles.stateCard,
                              {
                                backgroundColor: isSelected
                                  ? isDark
                                    ? '#064E3B'
                                    : '#ECFDF5'
                                  : isDark
                                  ? '#1E293B'
                                  : '#F8FAFC',
                                borderColor: isSelected ? '#10B981' : isDark ? '#334155' : '#E2E8F0',
                              },
                            ]}
                          >
                            <View style={styles.stateLeft}>
                              <Ionicons
                                name={addr.type === 'Home' ? 'home' : addr.type === 'Office' ? 'briefcase' : 'location'}
                                size={20}
                                color="#10B981"
                                style={{ marginRight: 10 }}
                              />
                              <View style={{ flex: 1 }}>
                                <Text style={[styles.stateName, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                                  {addr.type} ({addr.locality || addr.city})
                                </Text>
                                <Text style={[styles.stateSub, { color: isDark ? '#94A3B8' : '#64748B' }]} numberOfLines={1}>
                                  {`${addr.building || addr.street || addr.locality || addr.city}, ${addr.state} - ${addr.pincode}`}
                                </Text>
                              </View>
                            </View>

                            {isSelected && <Ionicons name="checkmark-circle" size={22} color="#10B981" />}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* ─── 🗺️ FULL SCREEN INTERACTIVE MAP PICKER PAGE ─── */}
      <Modal
        visible={isFullScreenMapOpen}
        animationType="slide"
        onRequestClose={() => setIsFullScreenMapOpen(false)}
      >
        <View style={[styles.fullMapContainer, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}>
          {/* Header */}
          <View style={[styles.fullMapHeader, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
            <TouchableOpacity
              onPress={() => setIsFullScreenMapOpen(false)}
              style={styles.fullMapBackBtn}
            >
              <Ionicons name="arrow-back" size={22} color={isDark ? '#FFFFFF' : '#0F172A'} />
            </TouchableOpacity>

            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={[styles.fullMapHeaderTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                Select Delivery Location
              </Text>
              <Text style={[styles.fullMapHeaderSub, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                Tap or drag pointer to set destination
              </Text>
            </View>
          </View>

          {/* Full Screen Map Frame */}
          <View style={styles.fullMapFrame}>
            {Platform.OS === 'web' ? (
              <iframe
                srcDoc={leafletMapHtml}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 0,
                  pointerEvents: 'auto',
                }}
                title="Full Screen Location Map"
              />
            ) : (
              <WebView
                originWhitelist={['*']}
                source={{ html: leafletMapHtml }}
                style={{ flex: 1, backgroundColor: 'transparent' }}
                onMessage={(event) => {
                  try {
                    const data = JSON.parse(event.nativeEvent.data);
                    if (data && data.type === 'EASYBUY_MAP_TAP') {
                      const { lat, lng } = data;
                      if (typeof lat === 'number' && typeof lng === 'number') {
                        setCoords({ lat, lng });
                      }
                    }
                  } catch (_) {}
                }}
              />
            )}

            {/* GPS Badge */}
            <View style={[styles.fullMapGpsBadge, { backgroundColor: isDark ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.95)' }]}>
              <View style={styles.mapGpsDot} />
              <Text style={[styles.mapGpsTxt, { color: isDark ? '#E2E8F0' : '#0F172A' }]}>
                {currentLat.toFixed(4)}° N, {currentLng.toFixed(4)}° E • Live Location
              </Text>
            </View>
          </View>

          {/* Bottom Address Card */}
          <View style={[styles.fullMapBottomCard, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
            <View style={styles.fullMapAddressRow}>
              <View style={styles.fullMapPinIconBg}>
                <Ionicons name="location-sharp" size={22} color="#059669" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.fullMapLocalityTxt, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                  {pinnedLocationName}
                </Text>
                <Text style={[styles.fullMapSubTxt, { color: isDark ? '#94A3B8' : '#64748B' }]} numberOfLines={1}>
                  {`${fullAddressDetails.road}, ${fullAddressDetails.suburb}, ${fullAddressDetails.city}, ${fullAddressDetails.state} - ${fullAddressDetails.pincode}`}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleConfirmPinnedLocation}
              disabled={isDetecting || isLoadingLocation}
              activeOpacity={0.88}
              style={styles.fullMapConfirmBtn}
            >
              {isDetecting ? (
                <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
              ) : (
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
              )}
              <Text style={styles.fullMapConfirmBtnTxt}>
                {isDetecting ? 'Setting Location...' : `Confirm & Select Location`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    width: '100%',
    height: '88%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  dragHandle: {
    width: 38,
    height: 4.5,
    borderRadius: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 🗺️ MAP CARD STYLES (220px Height)
  mapCardContainer: {
    width: '100%',
    height: 220,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  mapGpsBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 6,
    zIndex: 10,
    elevation: 5,
  },
  mapGpsDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
  mapGpsTxt: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  mapDetectBtn: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    zIndex: 20,
  },
  mapDetectBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },

  recentSection: {
    marginBottom: 14,
  },
  recentLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  recentScroll: {
    gap: 8,
  },
  recentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
  },
  recentChipText: {
    fontSize: 11.5,
    fontWeight: '700',
  },

  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: 12,
  },
  tabItem: {
    paddingVertical: 8,
    marginRight: 16,
  },
  tabItemActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#166534',
  },
  tabText: {
    fontSize: 12.5,
    fontWeight: '800',
  },

  statesContainer: {
    gap: 8,
    paddingBottom: 24,
  },
  stateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 16,
    borderWidth: 1,
  },
  stateLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  stateBadge: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateBadgeText: {
    fontSize: 11,
    fontWeight: '900',
  },
  stateName: {
    fontSize: 13,
    fontWeight: '800',
  },
  stateSub: {
    fontSize: 10.5,
    fontWeight: '500',
    marginTop: 1,
  },

  // ─── FULL SCREEN MAP STYLES ───
  fullMapContainer: {
    flex: 1,
  },
  fullMapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    elevation: 3,
  },
  fullMapBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullMapHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  fullMapHeaderSub: {
    fontSize: 11,
    marginTop: 1,
  },
  fullMapFrame: {
    flex: 1,
    position: 'relative',
  },
  fullMapGpsBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 6,
    zIndex: 10,
    elevation: 5,
  },
  fullMapBottomCard: {
    padding: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  fullMapAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  fullMapPinIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullMapLocalityTxt: {
    fontSize: 16,
    fontWeight: '800',
  },
  fullMapSubTxt: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  fullMapConfirmBtn: {
    backgroundColor: '#059669',
    paddingVertical: 14,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  fullMapConfirmBtnTxt: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
