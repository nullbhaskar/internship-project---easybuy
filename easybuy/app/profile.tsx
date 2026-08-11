import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { auth, db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ExperimentalNavigation } from '../components/navigation/ExperimentalNavigation';
import { useEasyBuyTheme } from '../constants/ThemeContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAddress } from '../context/AddressContext';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const router = useRouter();
  const { openWishlist } = useWishlist();
  const { openCart } = useCart();
  const { openLocationModal } = useAddress();
  const { isDarkMode: darkMode, toggleDarkMode } = useEasyBuyTheme();
  const [userName, setUserName] = useState('Bhaskar');
  const [userEmail, setUserEmail] = useState('bhaskar@easybuy.com');
  const [pushNotifications, setPushNotifications] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    async function fetchUserData() {
      const currentUser = auth.currentUser;
      if (currentUser) {
        if (currentUser.email) setUserEmail(currentUser.email);
        if (currentUser.displayName) setUserName(currentUser.displayName);

        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists() && userDoc.data().fullName) {
            setUserName(userDoc.data().fullName);
          }
        } catch (e) {
          console.log('Error fetching user profile:', e);
        }
      }
    }
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    try {
      await auth.signOut();
      router.replace('/login');
    } catch (e) {
      console.log('Logout error:', e);
      Alert.alert('Logout Error', 'Could not sign out. Please try again.');
    }
  };

  const handleTabChange = (tabId: string) => {
    if (tabId === 'home') {
      router.push('/home');
    } else if (tabId === 'orders') {
      router.push('/orders');
    } else {
      setActiveTab(tabId);
    }
  };

  return (
    <SafeAreaView style={[styles.container, darkMode && styles.containerDark]}>
      <StatusBar style={darkMode ? 'light' : 'dark'} />

      {/* ─── 1. TOP HEADER ─── */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={[styles.headerIconBtn, darkMode && styles.headerIconBtnDark]}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={18} color={darkMode ? '#F8FAFC' : '#0F172A'} />
        </TouchableOpacity>

        <View style={styles.headerTitleCenter}>
          <Text style={[styles.headerTitle, darkMode && { color: '#F8FAFC' }]}>My Profile</Text>
          <Text style={[styles.headerSubtitle, darkMode && { color: '#94A3B8' }]}>Manage your account and preferences</Text>
        </View>

        <TouchableOpacity
          style={[styles.headerIconBtn, darkMode && styles.headerIconBtnDark]}
          activeOpacity={0.8}
        >
          <Ionicons name="notifications-outline" size={18} color={darkMode ? '#F8FAFC' : '#0F172A'} />
          <View style={styles.notifBadge}>
            <Text style={styles.notifBadgeText}>3</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* ─── 2. MAIN USER PROFILE CARD ─── */}
        <View style={[styles.mainUserCard, darkMode && styles.cardDark]}>
          <View style={styles.userTopInfo}>
            {/* Avatar with Camera Icon */}
            <View style={styles.avatarWrapper}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80' }}
                style={styles.avatarImg}
              />
              <TouchableOpacity style={[styles.cameraEditBtn, darkMode && { backgroundColor: '#7C3AED' }]} activeOpacity={0.85}>
                <Ionicons name="camera" size={12} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Name, Badge, Email */}
            <View style={styles.userDetails}>
              <View style={styles.nameRow}>
                <Text style={[styles.userName, darkMode && { color: '#F8FAFC' }]}>{userName}</Text>
                <Ionicons name="checkmark-circle" size={16} color="#3B82F6" />
              </View>

              <View style={[styles.plusBadge, darkMode && { backgroundColor: '#1E1B4B' }]}>
                <Ionicons name="sparkles" size={10} color={darkMode ? '#C084FC' : '#2F6E49'} />
                <Text style={[styles.plusBadgeText, darkMode && { color: '#C084FC' }]}>EasyBuy Plus Member</Text>
              </View>

              <Text style={[styles.userEmail, darkMode && { color: '#94A3B8' }]}>{userEmail}</Text>
            </View>

            {/* Edit Profile Button */}
            <TouchableOpacity style={[styles.editProfileBtn, darkMode && { backgroundColor: '#0F172A', borderColor: '#334155' }]} activeOpacity={0.8}>
              <Ionicons name="create-outline" size={13} color={darkMode ? '#C084FC' : '#475569'} />
              <Text style={[styles.editProfileText, darkMode && { color: '#F8FAFC' }]}>Edit Profile</Text>
            </TouchableOpacity>
          </View>

          {/* 4 STAT COUNTERS */}
          <View style={[styles.statsRow, darkMode && { borderColor: '#334155' }]}>
            <View style={styles.statBox}>
              <Text style={[styles.statNum, darkMode && { color: '#F8FAFC' }]}>12</Text>
              <Text style={[styles.statLabel, darkMode && { color: '#94A3B8' }]}>Orders</Text>
            </View>
            <View style={[styles.statDivider, darkMode && { backgroundColor: '#334155' }]} />

            <View style={styles.statBox}>
              <Text style={[styles.statNum, darkMode && { color: '#F8FAFC' }]}>8</Text>
              <Text style={[styles.statLabel, darkMode && { color: '#94A3B8' }]}>Wishlist</Text>
            </View>
            <View style={[styles.statDivider, darkMode && { backgroundColor: '#334155' }]} />

            <View style={styles.statBox}>
              <Text style={[styles.statNum, darkMode && { color: '#F8FAFC' }]}>680</Text>
              <Text style={[styles.statLabel, darkMode && { color: '#94A3B8' }]}>Coins</Text>
            </View>
            <View style={[styles.statDivider, darkMode && { backgroundColor: '#334155' }]} />

            <View style={styles.statBox}>
              <Text style={[styles.statNum, darkMode && { color: '#F8FAFC' }]}>Lvl 7</Text>
              <Text style={[styles.statLabel, darkMode && { color: '#94A3B8' }]}>Member Level</Text>
            </View>
          </View>

          {/* PLUS MEMBER BANNER */}
          <View style={[styles.plusBannerBox, darkMode && { backgroundColor: '#1E1B4B', borderColor: '#312E81' }]}>
            <View style={[styles.plusCrownIcon, darkMode && { backgroundColor: '#7C3AED' }]}>
              <Ionicons name="ribbon" size={16} color="#FFFFFF" />
            </View>

            <View style={styles.plusBannerTextCol}>
              <Text style={[styles.plusBannerTitle, darkMode && { color: '#F8FAFC' }]}>You are a Plus Member</Text>
              <Text style={[styles.plusBannerSub, darkMode && { color: '#94A3B8' }]}>Enjoy free delivery, early access & exclusive offers.</Text>
            </View>

            <TouchableOpacity style={styles.viewBenefitsBtn} activeOpacity={0.8}>
              <Text style={[styles.viewBenefitsText, darkMode && { color: '#C084FC' }]}>View Benefits</Text>
              <Ionicons name="chevron-forward" size={12} color={darkMode ? '#C084FC' : '#2F6E49'} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ─── 4. MY SHOPPING SECTION ─── */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, darkMode && { color: '#F8FAFC' }]}>My Shopping</Text>
          <TouchableOpacity activeOpacity={0.8} style={styles.viewAllRow}>
            <Text style={[styles.viewAllText, darkMode && { color: '#A855F7' }]}>View All</Text>
            <Ionicons name="arrow-forward" size={12} color={darkMode ? '#A855F7' : '#64748B'} />
          </TouchableOpacity>
        </View>

        <View style={[styles.settingsGroupCard, darkMode && styles.cardDark]}>
          {/* Row 1: My Orders */}
          <TouchableOpacity style={styles.settingRow} activeOpacity={0.75}>
            <View style={[styles.iconBox, darkMode ? { backgroundColor: '#0F172A' } : { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="bag-handle-outline" size={18} color={darkMode ? '#A855F7' : '#2F6E49'} />
            </View>
            <View style={styles.rowLabelCol}>
              <Text style={[styles.rowTitle, darkMode && { color: '#F8FAFC' }]}>My Orders</Text>
              <Text style={[styles.rowSub, darkMode && { color: '#94A3B8' }]}>Track, return or reorder items</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={darkMode ? '#64748B' : '#94A3B8'} />
          </TouchableOpacity>
          <View style={[styles.rowDivider, darkMode && { backgroundColor: '#334155' }]} />

          {/* Row 2: Wishlist & Saved Items */}
          <TouchableOpacity style={styles.settingRow} onPress={openWishlist} activeOpacity={0.75}>
            <View style={[styles.iconBox, darkMode ? { backgroundColor: '#0F172A' } : { backgroundColor: '#FFEBEE' }]}>
              <Ionicons name="heart-outline" size={18} color="#FF6B6B" />
            </View>
            <View style={styles.rowLabelCol}>
              <Text style={[styles.rowTitle, darkMode && { color: '#F8FAFC' }]}>Wishlist & Saved Items</Text>
              <Text style={[styles.rowSub, darkMode && { color: '#94A3B8' }]}>Your favorite products</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={darkMode ? '#64748B' : '#94A3B8'} />
          </TouchableOpacity>
          <View style={[styles.rowDivider, darkMode && { backgroundColor: '#334155' }]} />

          {/* Row 3: Shipping Addresses */}
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              openLocationModal();
            }}
            activeOpacity={0.75}
          >
            <View style={[styles.iconBox, darkMode ? { backgroundColor: '#0F172A' } : { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="location-outline" size={18} color="#3498DB" />
            </View>
            <View style={styles.rowLabelCol}>
              <Text style={[styles.rowTitle, darkMode && { color: '#F8FAFC' }]}>Shipping Addresses</Text>
              <Text style={[styles.rowSub, darkMode && { color: '#94A3B8' }]}>Manage your addresses</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={darkMode ? '#64748B' : '#94A3B8'} />
          </TouchableOpacity>
          <View style={[styles.rowDivider, darkMode && { backgroundColor: '#334155' }]} />

          {/* Row 4: My Reviews & Ratings */}
          <TouchableOpacity style={styles.settingRow} activeOpacity={0.75}>
            <View style={[styles.iconBox, darkMode ? { backgroundColor: '#0F172A' } : { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="star-outline" size={18} color="#FF9800" />
            </View>
            <View style={styles.rowLabelCol}>
              <Text style={[styles.rowTitle, darkMode && { color: '#F8FAFC' }]}>My Reviews & Ratings</Text>
              <Text style={[styles.rowSub, darkMode && { color: '#94A3B8' }]}>Reviews you have written</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={darkMode ? '#64748B' : '#94A3B8'} />
          </TouchableOpacity>
        </View>

        {/* ─── 5. PREFERENCES & SETTINGS SECTION ─── */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, darkMode && { color: '#F8FAFC' }]}>Preferences & Settings</Text>
        </View>

        <View style={[styles.settingsGroupCard, darkMode && styles.cardDark]}>
          {/* Row 1: Push Notifications */}
          <View style={styles.settingRow}>
            <View style={[styles.iconBox, darkMode ? { backgroundColor: '#0F172A' } : { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="notifications-outline" size={18} color={darkMode ? '#A855F7' : '#2F6E49'} />
            </View>
            <View style={styles.rowLabelCol}>
              <Text style={[styles.rowTitle, darkMode && { color: '#F8FAFC' }]}>Push Notifications</Text>
              <Text style={[styles.rowSub, darkMode && { color: '#94A3B8' }]}>Get order & offer updates</Text>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={(val) => {
                Haptics.selectionAsync().catch(() => {});
                setPushNotifications(val);
              }}
              trackColor={{ false: '#334155', true: '#7C3AED' }}
              thumbColor="#FFFFFF"
            />
          </View>
          <View style={[styles.rowDivider, darkMode && { backgroundColor: '#334155' }]} />

          {/* Row 2: Dark Mode */}
          <View style={styles.settingRow}>
            <View style={[styles.iconBox, darkMode ? { backgroundColor: '#0F172A' } : { backgroundColor: '#F3E5F5' }]}>
              <Ionicons name="moon-outline" size={18} color={darkMode ? '#C084FC' : '#8E44AD'} />
            </View>
            <View style={styles.rowLabelCol}>
              <Text style={[styles.rowTitle, darkMode && { color: '#F8FAFC' }]}>Dark Mode</Text>
              <Text style={[styles.rowSub, darkMode && { color: '#94A3B8' }]}>Save your eyes</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={() => {
                Haptics.selectionAsync().catch(() => {});
                toggleDarkMode();
              }}
              trackColor={{ false: '#334155', true: '#7C3AED' }}
              thumbColor="#FFFFFF"
            />
          </View>
          <View style={[styles.rowDivider, darkMode && { backgroundColor: '#334155' }]} />

          {/* Row 3: Language */}
          <TouchableOpacity style={styles.settingRow} activeOpacity={0.75}>
            <View style={[styles.iconBox, darkMode ? { backgroundColor: '#0F172A' } : { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="globe-outline" size={18} color="#3498DB" />
            </View>
            <View style={styles.rowLabelCol}>
              <Text style={[styles.rowTitle, darkMode && { color: '#F8FAFC' }]}>Language</Text>
              <Text style={[styles.rowSub, darkMode && { color: '#94A3B8' }]}>Choose your language</Text>
            </View>
            <View style={styles.langValueRow}>
              <Text style={[styles.langValueText, darkMode && { color: '#94A3B8' }]}>English</Text>
              <Ionicons name="chevron-down" size={14} color={darkMode ? '#94A3B8' : '#64748B'} />
            </View>
          </TouchableOpacity>
          <View style={[styles.rowDivider, darkMode && { backgroundColor: '#334155' }]} />

          {/* Row 4: Help & Support */}
          <TouchableOpacity style={styles.settingRow} activeOpacity={0.75}>
            <View style={[styles.iconBox, darkMode ? { backgroundColor: '#0F172A' } : { backgroundColor: '#F3E5F5' }]}>
              <Ionicons name="headset-outline" size={18} color={darkMode ? '#C084FC' : '#8E44AD'} />
            </View>
            <View style={styles.rowLabelCol}>
              <Text style={[styles.rowTitle, darkMode && { color: '#F8FAFC' }]}>Help & Support</Text>
              <Text style={[styles.rowSub, darkMode && { color: '#94A3B8' }]}>Help center & support</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={darkMode ? '#64748B' : '#94A3B8'} />
          </TouchableOpacity>
          <View style={[styles.rowDivider, darkMode && { backgroundColor: '#334155' }]} />

          {/* Row 5: Privacy & Security */}
          <TouchableOpacity style={styles.settingRow} activeOpacity={0.75}>
            <View style={[styles.iconBox, darkMode ? { backgroundColor: '#0F172A' } : { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="shield-checkmark-outline" size={18} color={darkMode ? '#A855F7' : '#2F6E49'} />
            </View>
            <View style={styles.rowLabelCol}>
              <Text style={[styles.rowTitle, darkMode && { color: '#F8FAFC' }]}>Privacy & Security</Text>
              <Text style={[styles.rowSub, darkMode && { color: '#94A3B8' }]}>Manage your data</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={darkMode ? '#64748B' : '#94A3B8'} />
          </TouchableOpacity>
          <View style={[styles.rowDivider, darkMode && { backgroundColor: '#334155' }]} />

          {/* Row 6: Logout */}
          <TouchableOpacity style={styles.settingRow} onPress={handleLogout} activeOpacity={0.75}>
            <View style={[styles.iconBox, darkMode ? { backgroundColor: '#0F172A' } : { backgroundColor: '#FFEBEE' }]}>
              <Ionicons name="log-out-outline" size={18} color="#FF6B6B" />
            </View>
            <View style={styles.rowLabelCol}>
              <Text style={[styles.rowTitle, { color: '#FF6B6B' }]}>Logout</Text>
              <Text style={[styles.rowSub, darkMode && { color: '#94A3B8' }]}>See you again!</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={darkMode ? '#64748B' : '#94A3B8'} />
          </TouchableOpacity>
        </View>

        {/* ─── 6. BOTTOM LOG OUT BUTTON ─── */}
        <TouchableOpacity style={[styles.bottomLogoutBtn, darkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]} onPress={handleLogout} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={18} color={darkMode ? '#FF6B6B' : '#0F172A'} />
          <Text style={[styles.bottomLogoutText, darkMode && { color: '#FF6B6B' }]}>Log Out Account</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* ─── FLOATING SEGMENTED DOCK ─── */}
      <ExperimentalNavigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isDarkMode={darkMode}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FF',
  },
  containerDark: {
    backgroundColor: '#0F172A',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 110,
  },

  // 1. Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  headerIconBtnDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
  },
  headerTitleCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  notifBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  // 2. Main User Card
  mainUserCard: {
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  userTopInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  avatarImg: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  cameraEditBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  plusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginVertical: 4,
    gap: 4,
  },
  plusBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#2F6E49',
  },
  userEmail: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    gap: 4,
  },
  editProfileText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 14,
  },
  statBox: {
    alignItems: 'center',
  },
  statNum: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '700',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },

  // Plus Member Banner
  plusBannerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  plusCrownIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  plusBannerTextCol: {
    flex: 1,
  },
  plusBannerTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0F172A',
  },
  plusBannerSub: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 1,
  },
  viewBenefitsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewBenefitsText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#7C3AED',
  },

  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.2,
  },
  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
  },

  // Settings Group Card
  settingsGroupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowLabelCol: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  rowSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  langValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  langValueText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },

  // Bottom Logout Button
  bottomLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
    marginBottom: 16,
  },
  bottomLogoutText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0F172A',
  },
});
