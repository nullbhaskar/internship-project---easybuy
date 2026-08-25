import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  TextInput,
  Linking,
  Modal,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { auth, db } from '../services/firebase';
import { doc, getDoc, setDoc, collection, onSnapshot } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { ExperimentalNavigation } from '../components/navigation/ExperimentalNavigation';
import { useEasyBuyTheme } from '../constants/ThemeContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAddress } from '../context/AddressContext';
import { useAuth } from '../context/AuthContext';


import { SpatialDrawerWrapper, SpatialDrawerRef } from '../components/navigation/SpatialDrawerWrapper';
const { width } = Dimensions.get('window');

// ─── BRAND DESIGN TOKENS ───
const BRAND_THEME = {
  PRIMARY: '#2F6E49', // Deep Green
  SECONDARY: '#89B882', // Mint Accent
  ACCENT: '#F6CC63', // Warm Amber Gold
  BG_CREAM: '#FAF7F2', // Warm Champagne Ivory Ambient Background
  BG_DARK: '#090D16', // Obsidian Dark
  CARD_WHITE: '#FFFFFF',
  CARD_DARK: '#121927',
  BORDER_DARK: '#1F293D',
  TEXT_DARK: '#0F172A',
  TEXT_MUTED: '#64748B',
  CORAL: '#FF6B6B',
};

export default function ProfileScreen() {
  const router = useRouter();
  const { openWishlist, wishlistItems } = useWishlist();
  const { openCart, totalItems } = useCart();
  const { openLocationModal, selectedAddress } = useAddress();
  const { isDarkMode: darkMode } = useEasyBuyTheme();
  const { isGuest, isAuthenticated, user, logout, openAuthModal, exitGuestMode, setAuthenticatedUser } = useAuth();
  const spatialDrawerRef = React.useRef<SpatialDrawerRef>(null);
  const isDark = darkMode;

  // Only the owner's account gets the ELITE badge and Aura Plus membership
  const ELITE_EMAIL = 'bhaskardaspatna@gmail.com';
  const isEliteUser = (user?.email || '').toLowerCase() === ELITE_EMAIL.toLowerCase();

  const [userName, setUserName] = useState(user?.fullName || 'Bhaskar');
  const [userEmail, setUserEmail] = useState(user?.email || 'bhaskar@example.com');
  const [ordersCount, setOrdersCount] = useState(2);

  // Additional Profile Fields
  const [userPhone, setUserPhone] = useState(user?.phone || '+91 98765 43210');
  const [editPhone, setEditPhone] = useState(user?.phone || '+91 98765 43210');
  const [userGender, setUserGender] = useState(user?.gender || 'Male');
  const [editGender, setEditGender] = useState(user?.gender || 'Male');
  const [userDob, setUserDob] = useState(user?.dob || '15/08/2003');
  const [editDob, setEditDob] = useState(user?.dob || '15/08/2003');

  // Personal Info Edit states
  const [editName, setEditName] = useState(user?.fullName || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editAvatar, setEditAvatar] = useState(user?.photoURL || '');

  // Modals visibilities
  const [editProfileVisible, setEditProfileVisible] = useState(false);
  
  
  const [privacyVisible, setPrivacyVisible] = useState(false);

  // Sync user profile from auth context
  useEffect(() => {
    if (user) {
      if (user.email) {
        setUserEmail(user.email);
        setEditEmail(user.email);
      }
      if (user.fullName) {
        setUserName(user.fullName);
        setEditName(user.fullName);
      }
      if (user.phone) {
        setUserPhone(user.phone);
        setEditPhone(user.phone);
      }
      if (user.photoURL) {
        setEditAvatar(user.photoURL);
      }
      if (user.gender) {
        setUserGender(user.gender);
        setEditGender(user.gender);
      }
      if (user.dob) {
        setUserDob(user.dob);
        setEditDob(user.dob);
      }
    }
  }, [user]);

  // Fetch user data from Firestore if available
  useEffect(() => {
    async function fetchUserData() {
      const activeUid = user?.uid || auth.currentUser?.uid;
      if (activeUid) {
        try {
          const userDoc = await getDoc(doc(db, 'users', activeUid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.fullName) {
              setUserName(data.fullName);
              setEditName(data.fullName);
            }
            if (data.phone) {
              setUserPhone(data.phone);
              setEditPhone(data.phone);
            }
            if (data.gender) {
              setUserGender(data.gender);
              setEditGender(data.gender);
            }
            if (data.dob) {
              setUserDob(data.dob);
              setEditDob(data.dob);
            }
            if (data.photoURL) {
              setEditAvatar(data.photoURL);
            }
          }
        } catch (e) {
          console.log('Error fetching user profile:', e);
        }
      }
    }
    fetchUserData();
  }, [user?.uid]);

  // Listen to live orders count
  useEffect(() => {
    const activeUid = user?.uid || auth.currentUser?.uid;
    const activeEmail = user?.email || auth.currentUser?.email;
    if (!activeUid && !activeEmail) return;

    const isAdmin = activeEmail === 'admineasybuy@gmail.com';
    const collRef = collection(db, 'orders');
    const unsubscribe = onSnapshot(collRef, (snapshot) => {
      let count = 0;
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (isAdmin) { count++; return; }
        const matchEmail = activeEmail && data.userEmail &&
          data.userEmail.toLowerCase() === activeEmail.toLowerCase();
        const matchUid = activeUid && data.userId && data.userId === activeUid;
        if (matchEmail || matchUid) count++;
      });
      setOrdersCount(count);
    }, (err) => {
      console.log('Error listening to orders count:', err);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'You need to grant camera roll permissions to change your avatar.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.2, // Low quality for base64 saving to Firestore
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Use base64 if available to avoid Firebase Storage setup, or fallback to uri
        const base64Data = result.assets[0].base64 ? `data:image/jpeg;base64,${result.assets[0].base64}` : result.assets[0].uri;
        setEditAvatar(base64Data);
      }
    } catch (error) {
      console.log('Error picking image', error);
      Alert.alert('Error', 'Failed to pick image.');
    }
  };

  const handleUpdateProfile = async () => {
    // Support both Firebase Auth and custom Firestore auth
    const activeUid = auth.currentUser?.uid || user?.uid;
    if (!activeUid) {
      Alert.alert('Error', 'You must be logged in to update your profile.');
      return;
    }

    if (!editName.trim()) {
      Alert.alert('Error', 'Full name cannot be empty.');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    try {
      // Update Firebase Auth display name and photoURL if firebase user exists
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { 
          displayName: editName.trim(),
          photoURL: editAvatar || auth.currentUser.photoURL
        });
      }

      // Update Firestore user document
      const userRef = doc(db, 'users', activeUid);
      await setDoc(userRef, {
        fullName: editName.trim(),
        phone: editPhone.trim(),
        gender: editGender,
        dob: editDob.trim(),
        photoURL: editAvatar, // Save base64 image or URL to Firestore
      }, { merge: true });

      // Also update the local AuthContext user so the name refreshes on screen instantly
      if (user) {
        await setAuthenticatedUser({
          ...user,
          fullName: editName.trim(),
          phone: editPhone.trim(),
          gender: editGender,
          dob: editDob.trim(),
          photoURL: editAvatar,
        });
      }

      setUserName(editName.trim());
      setUserPhone(editPhone.trim());
      setUserGender(editGender);
      setUserDob(editDob.trim());
      setEditProfileVisible(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (e) {
      console.log('Error updating profile:', e);
      Alert.alert('Error', 'Failed to update profile details.');
    }
  };

  const handleLogout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    try {
      await logout();
      router.replace('/login');
    } catch (e) {
      console.log('Logout error:', e);
      Alert.alert('Logout Error', 'Could not sign out. Please try again.');
    }
  };

  return (
    <SpatialDrawerWrapper
      ref={spatialDrawerRef}
      userName={userName || 'Bhaskar'}
      userEmail={user?.email || userEmail || 'bhaskar@email.com'}
      userAvatar={user?.photoURL || undefined}
      isEliteUser={isEliteUser}
      onSelectMenuItem={(itemId) => {
        if (itemId === 'categories') {
          router.push('/all-items' as any);
        } else if (itemId === 'wallet') {
          
        } else if (itemId === 'loyalty') {
          
        } else if (itemId === 'locations') {
          openLocationModal();
        } else if (itemId === 'gift_ideas') {
          Alert.alert('Gift Ideas', 'Coming Soon!');
        } else if (itemId === 'help') {
          
        } else if (itemId === 'logout') {
          handleLogout();
        }
      }}
    >
      <SafeAreaView style={[S.root, isDark ? S.rootDark : S.rootLight]} edges={['top', 'left', 'right']}>
        <StatusBar style={isDark ? 'light' : 'dark'} />

        {/* ══ HEADER (LuxStore luxury branding) ═══════════════ */}
        <View style={[S.header, isDark && S.headerDark]}>
          <TouchableOpacity
            style={S.headerIconBtn}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              spatialDrawerRef.current?.openDrawer();
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="menu-outline" size={20} color={isDark ? '#F8FAFC' : '#0F172A'} />
          </TouchableOpacity>

          <View style={S.headerLogoContainer}>
            <Text style={[S.headerLogoText, isDark && S.textLight]}>EasyBuy</Text>
          </View>

          <TouchableOpacity
            style={S.headerIconBtn}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              openWishlist();
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="heart-outline" size={21} color={isDark ? '#F8FAFC' : '#0F172A'} />
            {wishlistItems.length > 0 && (
              <View style={S.cartBadge}>
                <Text style={S.cartBadgeText}>{wishlistItems.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={S.scrollContent}>
          {(!isAuthenticated || isGuest) ? (
            /* ══════════════════════════════════════════════════
               GUEST USER DEDICATED PROFILE VIEW
               ══════════════════════════════════════════════════ */
            <View>
              {/* Guest Avatar & Status */}
              <View style={S.avatarCenteredContainer}>
                <View style={[S.avatarWrapper, { backgroundColor: isDark ? '#1E293B' : '#E8F5E9', justifyContent: 'center', alignItems: 'center' }]}>
                  <Ionicons name="person" size={44} color="#2F6E49" />
                  <View style={[S.eliteBadge, { backgroundColor: '#F6CC63' }]}>
                    <Ionicons name="flash" size={10} color="#0F172A" style={{ marginRight: 2 }} />
                    <Text style={S.eliteBadgeText}>GUEST</Text>
                  </View>
                </View>
                <Text style={[S.profileNameText, isDark && S.textLight, { marginTop: 12 }]}>
                  You're browsing as a Guest
                </Text>
                <Text style={[S.profileEmailText, { marginTop: 4, textAlign: 'center', paddingHorizontal: 24 }]}>
                  Sign in to unlock your EasyBuy account & access all features.
                </Text>
              </View>

              {/* Guest Primary Action Buttons */}
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 20, paddingHorizontal: 16 }}>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    height: 48,
                    backgroundColor: BRAND_THEME.PRIMARY,
                    borderRadius: 14,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    shadowColor: BRAND_THEME.PRIMARY,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.25,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                    router.push('/login');
                  }}
                  activeOpacity={0.88}
                >
                  <Ionicons name="log-in-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={{ fontSize: 15, fontWeight: '700', color: '#FFFFFF' }}>Log In</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    flex: 1,
                    height: 48,
                    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                    borderRadius: 14,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: 1.5,
                    borderColor: isDark ? '#334155' : '#D0E7D8',
                  }}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                    router.push('/register');
                  }}
                  activeOpacity={0.88}
                >
                  <Ionicons name="person-add-outline" size={17} color={BRAND_THEME.PRIMARY} style={{ marginRight: 6 }} />
                  <Text style={{ fontSize: 15, fontWeight: '700', color: BRAND_THEME.PRIMARY }}>Sign Up</Text>
                </TouchableOpacity>
              </View>

              {/* ══ LOCKED ACCOUNT FEATURES ═════════════════════ */}
              <Text style={S.sectionHeader}>ACCOUNT FEATURES</Text>
              <View style={[S.settingsGroupCard, isDark ? S.settingsGroupCardDark : S.settingsGroupCardLight]}>
                {/* Locked Wishlist */}
                <TouchableOpacity
                  style={S.settingRow}
                  onPress={() => openAuthModal('access your saved wishlist')}
                  activeOpacity={0.75}
                >
                  <View style={[S.iconBox, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                    <Ionicons name="heart-outline" size={16} color="#EF4444" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[S.rowTitle, isDark && S.textLight]}>Wishlist & Favorites</Text>
                    <Text style={{ fontSize: 11, color: '#94A3B8' }}>Sign in to save items</Text>
                  </View>
                  <Ionicons name="lock-closed" size={14} color="#94A3B8" />
                </TouchableOpacity>
                <View style={[S.rowDivider, isDark && S.rowDividerDark]} />

                {/* Locked Orders */}
                <TouchableOpacity
                  style={S.settingRow}
                  onPress={() => openAuthModal('view your order history')}
                  activeOpacity={0.75}
                >
                  <View style={[S.iconBox, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                    <Ionicons name="receipt-outline" size={16} color="#3B82F6" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[S.rowTitle, isDark && S.textLight]}>Orders & Tracking</Text>
                    <Text style={{ fontSize: 11, color: '#94A3B8' }}>Sign in to track orders</Text>
                  </View>
                  <Ionicons name="lock-closed" size={14} color="#94A3B8" />
                </TouchableOpacity>
                <View style={[S.rowDivider, isDark && S.rowDividerDark]} />

                {/* Locked Addresses */}
                <TouchableOpacity
                  style={S.settingRow}
                  onPress={() => openAuthModal('save delivery addresses')}
                  activeOpacity={0.75}
                >
                  <View style={[S.iconBox, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                    <Ionicons name="location-outline" size={16} color="#10B981" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[S.rowTitle, isDark && S.textLight]}>Saved Addresses</Text>
                    <Text style={{ fontSize: 11, color: '#94A3B8' }}>Sign in for express checkout</Text>
                  </View>
                  <Ionicons name="lock-closed" size={14} color="#94A3B8" />
                </TouchableOpacity>
                <View style={[S.rowDivider, isDark && S.rowDividerDark]} />

                {/* Locked Rewards */}
                <TouchableOpacity
                  style={S.settingRow}
                  onPress={() => openAuthModal('earn EasyCoins and rewards')}
                  activeOpacity={0.75}
                >
                  <View style={[S.iconBox, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                    <Ionicons name="gift-outline" size={16} color="#F59E0B" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[S.rowTitle, isDark && S.textLight]}>Rewards & EasyCoins</Text>
                    <Text style={{ fontSize: 11, color: '#94A3B8' }}>Earn points on every order</Text>
                  </View>
                  <Ionicons name="lock-closed" size={14} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              {/* ══ APP PREFERENCES ═════════════════════ */}
              <Text style={S.sectionHeader}>PREFERENCES & HELP</Text>
              <View style={[S.settingsGroupCard, isDark ? S.settingsGroupCardDark : S.settingsGroupCardLight]}>
                <TouchableOpacity
                  style={S.settingRow}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    openLocationModal();
                  }}
                  activeOpacity={0.75}
                >
                  <View style={S.iconBox}>
                    <Ionicons name="map-outline" size={16} color={BRAND_THEME.PRIMARY} />
                  </View>
                  <Text style={[S.rowTitle, isDark && S.textLight]}>Select Delivery Location</Text>
                  <Ionicons name="chevron-forward" size={14} color="#94A3B8" />
                </TouchableOpacity>
                <View style={[S.rowDivider, isDark && S.rowDividerDark]} />

                <TouchableOpacity
                  style={S.settingRow}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    setPrivacyVisible(true);
                  }}
                  activeOpacity={0.75}
                >
                  <View style={S.iconBox}>
                    <Ionicons name="shield-checkmark-outline" size={16} color={BRAND_THEME.PRIMARY} />
                  </View>
                  <Text style={[S.rowTitle, isDark && S.textLight]}>Privacy & Security Policy</Text>
                  <Ionicons name="chevron-forward" size={14} color="#94A3B8" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            /* ══════════════════════════════════════════════════
               AUTHENTICATED USER FULL PROFILE VIEW
               ══════════════════════════════════════════════════ */
            <View>
              {/* ══ AVATAR PROFILE HEADER ════════════════════════ */}
              <View style={S.avatarCenteredContainer}>
                <View style={S.avatarWrapper}>
                  <Image
                    source={{ uri: user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random&color=fff&size=300` }}
                    style={S.avatarImg}
                  />
                  {/* Elite Badge Overlay — only for owner account */}
                  {isEliteUser ? (
                    <View style={S.eliteBadge}>
                      <Ionicons name="ribbon" size={10} color="#0F172A" style={{ marginRight: 2 }} />
                      <Text style={S.eliteBadgeText}>ELITE</Text>
                    </View>
                  ) : (
                    <TouchableOpacity 
                      style={[S.eliteBadge, { backgroundColor: '#89B882' }]}
                      onPress={openLocationModal}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="location" size={10} color="#0F172A" style={{ marginRight: 2 }} />
                      <Text style={S.eliteBadgeText}>
                        {selectedAddress?.city && selectedAddress.city !== 'City' ? selectedAddress.city : 'Set Location'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={[S.profileNameText, isDark && S.textLight]}>{userName}</Text>
                <Text style={S.profileEmailText}>{userEmail}</Text>
              </View>

              {/* ══ STATS OVERVIEW ROW ═══════════════════════════ */}
              <View style={S.statsRow}>
                {/* Orders Stat Box */}
                <TouchableOpacity
                  style={[S.statCard, isDark ? S.statCardDark : S.statCardLight]}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    router.push('/orders');
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[S.statNum, isDark && S.textLight]}>{ordersCount}</Text>
                  <Text style={S.statLabel}>ORDERS</Text>
                </TouchableOpacity>

                {/* Wishlist Stat Box */}
                <TouchableOpacity
                  style={[S.statCard, isDark ? S.statCardDark : S.statCardLight]}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    openWishlist();
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[S.statNum, isDark && S.textLight]}>{wishlistItems.length}</Text>
                  <Text style={S.statLabel}>WISHLIST</Text>
                </TouchableOpacity>

                {/* Points Stat Box */}
                <TouchableOpacity
                  style={[S.statCard, isDark ? S.statCardDark : S.statCardLight]}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[S.statNum, isDark && S.textLight]}>2.4k</Text>
                  <Text style={S.statLabel}>POINTS</Text>
                </TouchableOpacity>
              </View>

              {/* ══ MEMBERSHIP BANNER ════════════════════════════ */}
              {isEliteUser ? (
                <View style={[S.membershipCard, isDark && S.membershipCardDark]}>
                  <View style={S.membershipTopRow}>
                    <View>
                      <Text style={S.membershipTitle}>Aura Plus</Text>
                      <Text style={S.membershipSub}>Premium Membership</Text>
                    </View>
                    <Ionicons name="diamond" size={24} color="#F6CC63" />
                  </View>

                  <View style={S.membershipBottomRow}>
                    <View>
                      <Text style={S.validLabel}>VALID THRU</Text>
                      <Text style={S.validDate}>12/24</Text>
                    </View>
                    <TouchableOpacity
                      style={S.viewBenefitsBtn}
                      onPress={() => {
                        Haptics.selectionAsync().catch(() => {});
                        
                      }}
                      activeOpacity={0.85}
                    >
                      <Text style={S.viewBenefitsText}>View Benefits</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={[S.membershipCard, isDark && S.membershipCardDark, { backgroundColor: isDark ? '#1E293B' : '#F0F9F4' }]}>
                  <View style={S.membershipTopRow}>
                    <View>
                      <Text style={[S.membershipTitle, { color: '#2F6E49' }]}>EasyBuy Member</Text>
                      <Text style={S.membershipSub}>Standard Membership</Text>
                    </View>
                    <Ionicons name="shield-checkmark" size={24} color="#2F6E49" />
                  </View>
                  <View style={S.membershipBottomRow}>
                    <Text style={[S.membershipSub, { color: '#64748B' }]}>Upgrade to Aura Plus for exclusive benefits!</Text>
                  </View>
                </View>
              )}

              {/* ══ ACCOUNT OPTIONS SECTION ═════════════════════ */}
              <Text style={S.sectionHeader}>ACCOUNT</Text>
              <View style={[S.settingsGroupCard, isDark ? S.settingsGroupCardDark : S.settingsGroupCardLight]}>
                {/* Row 1: Personal Information */}
                <TouchableOpacity
                  style={S.settingRow}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    setEditProfileVisible(true);
                  }}
                  activeOpacity={0.75}
                >
                  <View style={S.iconBox}>
                    <Ionicons name="person-outline" size={16} color={BRAND_THEME.PRIMARY} />
                  </View>
                  <Text style={[S.rowTitle, isDark && S.textLight]}>Personal Information</Text>
                  <Ionicons name="chevron-forward" size={14} color="#94A3B8" />
                </TouchableOpacity>
                <View style={[S.rowDivider, isDark && S.rowDividerDark]} />

                {/* Row 2: Saved Addresses */}
                <TouchableOpacity
                  style={S.settingRow}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    openLocationModal();
                  }}
                  activeOpacity={0.75}
                >
                  <View style={S.iconBox}>
                    <Ionicons name="location-outline" size={16} color={BRAND_THEME.PRIMARY} />
                  </View>
                  <Text style={[S.rowTitle, isDark && S.textLight]}>Saved Addresses</Text>
                  <Ionicons name="chevron-forward" size={14} color="#94A3B8" />
                </TouchableOpacity>
                <View style={[S.rowDivider, isDark && S.rowDividerDark]} />

                {/* Row 3: Payment Methods */}
                <TouchableOpacity
                  style={S.settingRow}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    
                  }}
                  activeOpacity={0.75}
                >
                  <View style={S.iconBox}>
                    <Ionicons name="card-outline" size={16} color={BRAND_THEME.PRIMARY} />
                  </View>
                  <Text style={[S.rowTitle, isDark && S.textLight]}>Payment Methods</Text>
                  <Ionicons name="chevron-forward" size={14} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              {/* ══ SETTINGS OPTIONS SECTION ═════════════════════ */}
              <Text style={S.sectionHeader}>SETTINGS</Text>
              <View style={[S.settingsGroupCard, isDark ? S.settingsGroupCardDark : S.settingsGroupCardLight]}>
                {/* Row 1: Notifications */}
                <TouchableOpacity
                  style={S.settingRow}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    Alert.alert('Notifications', 'Push notifications toggle: Status active.');
                  }}
                  activeOpacity={0.75}
                >
                  <View style={S.iconBox}>
                    <Ionicons name="notifications-outline" size={16} color={BRAND_THEME.PRIMARY} />
                  </View>
                  <Text style={[S.rowTitle, isDark && S.textLight]}>Notifications</Text>
                  <Ionicons name="chevron-forward" size={14} color="#94A3B8" />
                </TouchableOpacity>
                <View style={[S.rowDivider, isDark && S.rowDividerDark]} />

                {/* Row 2: Privacy & Security */}
                <TouchableOpacity
                  style={S.settingRow}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    setPrivacyVisible(true);
                  }}
                  activeOpacity={0.75}
                >
                  <View style={S.iconBox}>
                    <Ionicons name="shield-checkmark-outline" size={16} color={BRAND_THEME.PRIMARY} />
                  </View>
                  <Text style={[S.rowTitle, isDark && S.textLight]}>Privacy & Security</Text>
                  <Ionicons name="chevron-forward" size={14} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              {/* ══ SIGN OUT OUTLINE BUTTON ═════════════════════ */}
              <TouchableOpacity
                style={[S.signOutOutlineBtn, isDark && S.signOutOutlineBtnDark]}
                onPress={handleLogout}
                activeOpacity={0.8}
              >
                <Text style={S.signOutOutlineBtnTxt}>SIGN OUT</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: 110 }} />
        </ScrollView>

        {/* ══ EDIT PROFILE MODAL ══════════════════════════ */}
        <Modal visible={editProfileVisible} transparent animationType="slide" onRequestClose={() => setEditProfileVisible(false)}>
          <View style={S.modalBackdrop}>
            <TouchableOpacity style={S.modalDismissArea} onPress={() => setEditProfileVisible(false)} />
            <View style={[S.modalSheet, isDark && S.modalSheetDark]}>
              <View style={S.modalHandle} />
              <Text style={[S.modalTitle, isDark && S.textLight]}>Edit Personal Information</Text>

              {/* Avatar Editor */}
              <View style={{ alignItems: 'center', marginBottom: 20 }}>
                <TouchableOpacity onPress={pickImage} style={{ position: 'relative' }}>
                  <Image
                    source={{ uri: editAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random&color=fff&size=100` }}
                    style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: isDark ? '#334155' : '#E2E8F0' }}
                  />
                  <View style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    backgroundColor: '#10B981',
                    borderRadius: 15,
                    width: 28,
                    height: 28,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: 2,
                    borderColor: isDark ? '#1E293B' : '#FFFFFF'
                  }}>
                    <Ionicons name="camera" size={14} color="#FFF" />
                  </View>
                </TouchableOpacity>
              </View>

              <Text style={S.inputLabel}>Full Name</Text>
              <TextInput
                style={[S.textInput, isDark && S.textInputDark]}
                value={editName}
                onChangeText={setEditName}
                placeholder="Enter your name"
                placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
              />

              <Text style={S.inputLabel}>Phone Number</Text>
              <TextInput
                style={[S.textInput, isDark && S.textInputDark]}
                value={editPhone}
                onChangeText={setEditPhone}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
                placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
              />

              <Text style={S.inputLabel}>Date of Birth</Text>
              <TextInput
                style={[S.textInput, isDark && S.textInputDark]}
                value={editDob}
                onChangeText={setEditDob}
                placeholder="DD/MM/YYYY"
                placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
              />

              <Text style={S.inputLabel}>Gender</Text>
              <View style={S.genderContainer}>
                {['Male', 'Female', 'Other'].map((g) => {
                  const isSel = editGender === g;
                  return (
                    <TouchableOpacity
                      key={g}
                      style={[
                        S.genderPill,
                        isSel && { borderColor: BRAND_THEME.PRIMARY, backgroundColor: '#EBF5EE' },
                        isDark && isSel && { borderColor: BRAND_THEME.SECONDARY, backgroundColor: 'rgba(47, 110, 73, 0.25)' },
                        isDark && !isSel && { borderColor: BRAND_THEME.BORDER_DARK },
                      ]}
                      onPress={() => setEditGender(g)}
                      activeOpacity={0.75}
                    >
                      <Text style={[S.genderPillText, isSel && { color: BRAND_THEME.PRIMARY }, isDark && isSel && { color: BRAND_THEME.SECONDARY }]}>
                        {g}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={S.inputLabel}>Email Address</Text>
              <TextInput
                style={[S.textInput, isDark && S.textInputDark, { opacity: 0.6 }]}
                value={editEmail}
                editable={false}
                placeholder="Email address"
              />
              <Text style={S.emailTipText}>Email cannot be changed directly.</Text>

              <View style={S.modalActionsRow}>
                <TouchableOpacity
                  style={[S.modalBtn, S.modalBtnCancel]}
                  onPress={() => setEditProfileVisible(false)}
                >
                  <Text style={S.cancelBtnTxt}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[S.modalBtn, S.modalBtnSave]}
                  onPress={handleUpdateProfile}
                >
                  <Text style={S.saveBtnTxt}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* ══ PRIVACY POLICY MODAL ═════════════════════════ */}
        <Modal visible={privacyVisible} transparent animationType="fade" onRequestClose={() => setPrivacyVisible(false)}>
          <View style={S.modalBackdropCentered}>
            <View style={[S.popupCard, isDark && S.popupCardDark]}>
              <Text style={[S.popupTitle, isDark && S.textLight]}>Privacy & Data Protection</Text>
              <ScrollView style={{ maxHeight: 220, marginVertical: 12 }}>
                <Text style={S.popupBodyTxt}>
                  EasyBuy values your privacy. We secure all personal credentials, address records, and purchase histories in encrypted Firestore tables. Payment methods are handled securely via transaction providers (Stripe/Razorpay) and are not stored directly on our servers. You can request account deletion or data exports by contacting support directly at privacy@easybuy.com.
                </Text>
              </ScrollView>
              <TouchableOpacity
                style={S.popupCloseBtn}
                onPress={() => setPrivacyVisible(false)}
              >
                <Text style={S.popupCloseBtnTxt}>Close Policy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Wallet & Loyalty Modals */}
        
        

        {/* Navigation Dock */}
        <ExperimentalNavigation
          activeTab="profile"
          onTabChange={(tabId) => {
            if (tabId === 'home') router.push('/home');
            if (tabId === 'orders') router.push('/orders');
          }}
          isDarkMode={isDark}
        />
      </SafeAreaView>
    </SpatialDrawerWrapper>
  );
}

// ─── STYLES ──────────────────────────────────────────────────
const S = StyleSheet.create({
  root: {
    flex: 1,
  },
  rootLight: {
    backgroundColor: BRAND_THEME.BG_CREAM, // Matches home champagne background
  },
  rootDark: {
    backgroundColor: BRAND_THEME.BG_DARK, // Matches home obsidian dark
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF', // Header background white
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerDark: {
    backgroundColor: BRAND_THEME.CARD_DARK,
    borderBottomColor: BRAND_THEME.BORDER_DARK,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  headerLogoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerLogoText: {
    fontSize: 20,
    fontWeight: '900',
    color: BRAND_THEME.TEXT_DARK,
    letterSpacing: -0.3,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  textLight: {
    color: '#F8FAFC',
  },
  cartBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: BRAND_THEME.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
  },

  // Avatar Profile header
  avatarCenteredContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 10,
  },
  avatarImg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#CBD5E1',
  },
  eliteBadge: {
    position: 'absolute',
    bottom: -2,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6CC63',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    elevation: 2,
  },
  eliteBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#0F172A',
  },
  profileNameText: {
    fontSize: 19,
    fontWeight: '900',
    color: BRAND_THEME.TEXT_DARK,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  profileEmailText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },

  // Stats Card Row
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  statCardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  statCardDark: {
    backgroundColor: BRAND_THEME.CARD_DARK,
    borderColor: BRAND_THEME.BORDER_DARK,
  },
  statNum: {
    fontSize: 17,
    fontWeight: '900',
    color: BRAND_THEME.TEXT_DARK,
  },
  statLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '800',
    marginTop: 4,
  },

  // Membership Card
  membershipCard: {
    backgroundColor: '#334155',
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  membershipCardDark: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#475569',
  },
  membershipTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  membershipTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  membershipSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  membershipBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  validLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
  },
  validDate: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  viewBenefitsBtn: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },
  viewBenefitsText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Sections Header
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 8,
    marginTop: 8,
    letterSpacing: 0.8,
  },
  settingsGroupCard: {
    borderRadius: 18,
    paddingHorizontal: 16,
    marginBottom: 18,
    borderWidth: 1,
  },
  settingsGroupCardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  settingsGroupCardDark: {
    backgroundColor: BRAND_THEME.CARD_DARK,
    borderColor: BRAND_THEME.BORDER_DARK,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: BRAND_THEME.TEXT_MUTED,
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  rowDividerDark: {
    backgroundColor: BRAND_THEME.BORDER_DARK,
  },

  // Sign out outline button
  signOutOutlineBtn: {
    borderWidth: 1,
    borderColor: '#64748B',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  signOutOutlineBtnDark: {
    borderColor: '#475569',
  },
  signOutOutlineBtnTxt: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
  },

  // Modals Sheet
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  modalDismissArea: {
    flex: 1,
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  modalSheetDark: {
    backgroundColor: BRAND_THEME.CARD_DARK,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 16.5,
    fontWeight: '900',
    color: BRAND_THEME.TEXT_DARK,
    marginBottom: 14,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  inputLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 6,
    marginTop: 8,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
  },
  textInputDark: {
    backgroundColor: BRAND_THEME.BG_DARK,
    borderColor: BRAND_THEME.BORDER_DARK,
    color: '#F8FAFC',
  },
  emailTipText: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 4,
    marginBottom: 12,
  },
  modalActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 12,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnCancel: {
    backgroundColor: '#F1F5F9',
  },
  modalBtnSave: {
    backgroundColor: BRAND_THEME.PRIMARY,
  },
  cancelBtnTxt: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#475569',
  },
  saveBtnTxt: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Centered Popup Modals (Privacy)
  modalBackdropCentered: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupCard: {
    width: width * 0.85,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    elevation: 10,
  },
  popupCardDark: {
    backgroundColor: BRAND_THEME.CARD_DARK,
  },
  popupTitle: {
    fontSize: 16.5,
    fontWeight: '900',
    color: BRAND_THEME.TEXT_DARK,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  popupBodyTxt: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  popupCloseBtn: {
    backgroundColor: BRAND_THEME.PRIMARY,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  popupCloseBtnTxt: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 4,
  },
  genderPill: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
  },
});


