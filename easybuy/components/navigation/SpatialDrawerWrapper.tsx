import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
  PanResponder,
  PanResponderGestureState,
  Image,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useAddress } from '../../context/AddressContext';


const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.78;
const SHIFT_TRANSLATE_X = SCREEN_WIDTH * 0.74;

export interface SpatialDrawerRef {
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  isOpen: boolean;
}

export interface MenuItemData {
  id: string;
  label: string;
  icon: string;
  badge?: string;
  isLogout?: boolean;
}

const MAIN_MENU_ITEMS: MenuItemData[] = [
  { id: 'categories', label: 'Categories', icon: 'grid-outline' },

  { id: 'locations', label: 'Locations', icon: 'location-outline' },
  { id: 'gift_ideas', label: 'Gift Ideas', icon: 'gift-outline', badge: 'SOON' },
  { id: 'help', label: 'Help & Support', icon: 'help-circle-outline' },
];

const LOGOUT_ITEM: MenuItemData = {
  id: 'logout',
  label: 'Logout',
  icon: 'log-out-outline',
  isLogout: true,
};

const ALL_MENU_ITEMS = [...MAIN_MENU_ITEMS, LOGOUT_ITEM];

interface SpatialDrawerWrapperProps {
  children: React.ReactNode;
  activeMenuItem?: string;
  onSelectMenuItem?: (itemId: string) => void;
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  isEliteUser?: boolean;
}



const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.78;
const SHIFT_TRANSLATE_X = SCREEN_WIDTH * 0.74;

export interface SpatialDrawerRef {
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  isOpen: boolean;
}

export interface MenuItemData {
  id: string;
  label: string;
  icon: string;
  badge?: string;
  isLogout?: boolean;
}

const MAIN_MENU_ITEMS: MenuItemData[] = [
  { id: 'categories', label: 'Categories', icon: 'grid-outline' },

  { id: 'locations', label: 'Locations', icon: 'location-outline' },
  { id: 'gift_ideas', label: 'Gift Ideas', icon: 'gift-outline', badge: 'SOON' },
  { id: 'help', label: 'Help & Support', icon: 'help-circle-outline' },
];

const LOGOUT_ITEM: MenuItemData = {
  id: 'logout',
  label: 'Logout',
  icon: 'log-out-outline',
  isLogout: true,
};

const ALL_MENU_ITEMS = [...MAIN_MENU_ITEMS, LOGOUT_ITEM];

interface SpatialDrawerWrapperProps {
  children: React.ReactNode;
  activeMenuItem?: string;
  onSelectMenuItem?: (itemId: string) => void;
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  isEliteUser?: boolean;
}

export const SpatialDrawerWrapper = forwardRef<SpatialDrawerRef, SpatialDrawerWrapperProps>(
  (
    {
      children,
      activeMenuItem = 'categories',
      onSelectMenuItem,
      userName = 'Guest',
      userEmail = 'guest@easybuy.com',
      userAvatar,
      isEliteUser = false,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const { selectedAddress, openLocationModal } = useAddress();
    const [pressedItemId, setPressedItemId] = useState<string | null>(null);

    // SINGLE SOURCE OF TRUTH: drawerProgress (0 = closed, 1 = open)
    const drawerProgress = useRef(new Animated.Value(0)).current;

    // Header entrance animation
    const headerAnim = useRef(new Animated.Value(0)).current;

    // Ambient Breathing Background Light Orbs & Shimmer Animations
    const orbAnim1 = useRef(new Animated.Value(0)).current;
    const orbAnim2 = useRef(new Animated.Value(0)).current;
    const badgeShimmer = useRef(new Animated.Value(0.7)).current;

    useEffect(() => {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(orbAnim1, { toValue: 1, duration: 3800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
            Animated.timing(orbAnim1, { toValue: 0, duration: 3800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(orbAnim2, { toValue: 1, duration: 4800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
            Animated.timing(orbAnim2, { toValue: 0, duration: 4800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(badgeShimmer, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
            Animated.timing(badgeShimmer, { toValue: 0.65, duration: 1800, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          ]),
        ])
      ).start();
    }, []);

    const orb1Scale = orbAnim1.interpolate({ inputRange: [0, 1], outputRange: [1.0, 1.28] });
    const orb1Y = orbAnim1.interpolate({ inputRange: [0, 1], outputRange: [0, -22] });
    const orb1Opacity = orbAnim1.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.75] });

    const orb2Scale = orbAnim2.interpolate({ inputRange: [0, 1], outputRange: [1.15, 0.9] });
    const orb2Y = orbAnim2.interpolate({ inputRange: [0, 1], outputRange: [0, 24] });
    const orb2Opacity = orbAnim2.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.65] });

    const isOpenRef = useRef(false);
    const itemAnims = useRef(ALL_MENU_ITEMS.map(() => new Animated.Value(0))).current;

    const openDrawer = () => {
      isOpenRef.current = true;
      setIsOpen(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

      drawerProgress.stopAnimation();
      Animated.timing(drawerProgress, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();

      headerAnim.setValue(0);
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 240,
        useNativeDriver: true,
      }).start();

      itemAnims.forEach((anim) => anim.setValue(0));
      Animated.stagger(
        35,
        itemAnims.map((anim) =>
          Animated.timing(anim, {
            toValue: 1,
            duration: 220,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          })
        )
      ).start();
    };

    const closeDrawer = () => {
      isOpenRef.current = false;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

      drawerProgress.stopAnimation();
      Animated.timing(drawerProgress, {
        toValue: 0,
        duration: 240,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setIsOpen(false);
      });
    };

    const toggleDrawer = () => {
      if (isOpenRef.current) closeDrawer();
      else openDrawer();
    };

    useImperativeHandle(ref, () => ({
      openDrawer,
      closeDrawer,
      toggleDrawer,
      isOpen: isOpenRef.current,
    }));

    // Real-Time Gesture Engine (Follows finger continuously with zero stickiness)
    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onStartShouldSetPanResponderCapture: () => false,
        onMoveShouldSetPanResponder: (_, gestureState: PanResponderGestureState) => {
          const { dx, dy, moveX, vx } = gestureState;
          // Only capture clear horizontal swipes (high dx, low dy, minimal velocity)
          // dx > 20 prevents accidentally stealing taps on Android
          if (!isOpenRef.current && moveX < 32 && dx > 20 && Math.abs(dx) > Math.abs(dy) * 2) {
            return true;
          }
          if (isOpenRef.current && dx < -20 && Math.abs(dx) > Math.abs(dy) * 2) {
            return true;
          }
          return false;
        },
        onMoveShouldSetPanResponderCapture: () => false,
        onPanResponderGrant: () => {
          drawerProgress.stopAnimation();
        },
        onPanResponderMove: (_, gestureState: PanResponderGestureState) => {
          const { dx } = gestureState;
          let progress = isOpenRef.current ? 1 + dx / SHIFT_TRANSLATE_X : dx / SHIFT_TRANSLATE_X;
          progress = Math.max(0, Math.min(1, progress));
          drawerProgress.setValue(progress);
        },
        onPanResponderRelease: (_, gestureState: PanResponderGestureState) => {
          const { dx, vx } = gestureState;
          const currentProgress = (drawerProgress as any)._value ?? (isOpenRef.current ? 1 : 0);

          if (isOpenRef.current) {
            if (dx < -20 || vx < -0.2 || currentProgress < 0.65) {
              closeDrawer();
            } else {
              openDrawer();
            }
          } else {
            if (dx > 30 || vx > 0.25 || currentProgress > 0.35) {
              openDrawer();
            } else {
              closeDrawer();
            }
          }
        },
      })
    ).current;

    // Derived Interpolations from SINGLE SOURCE OF TRUTH (drawerProgress)
    const homeScale = drawerProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [1.0, 0.88], // Scale down matching reference video Photo 3
    });

    const homeTranslateX = drawerProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, SHIFT_TRANSLATE_X],
    });

    const homeBorderRadius = drawerProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 28], // Curved continuous squircle corners matching Photo 3
    });

    const overlayOpacity = drawerProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 0.35],
    });

    const menuTranslateX = drawerProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [-DRAWER_WIDTH * 0.35, 0],
    });

    const menuOpacity = drawerProgress.interpolate({
      inputRange: [0, 0.15, 1],
      outputRange: [0, 0.6, 1],
    });

    const headerTranslateY = headerAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [-10, 0],
    });

    const renderMenuItemRow = (item: MenuItemData, idx: number) => {
      const isSelected = activeMenuItem === item.id;
      const isPressed = pressedItemId === item.id;
      const hasActivePress = pressedItemId !== null;

      let scaleVal = 0.96;
      let opacityVal = 0.80;

      if (isPressed) {
        scaleVal = 1.12;
        opacityVal = 1.0;
      } else if (hasActivePress && !isPressed) {
        scaleVal = 0.90;
        opacityVal = 0.45;
      } else if (isSelected) {
        scaleVal = 1.06;
        opacityVal = 1.0;
      }

      const itemTranslateX = itemAnims[idx].interpolate({
        inputRange: [0, 1],
        outputRange: [-14, 0],
      });

      return (
        <Animated.View
          key={item.id}
          style={{
            opacity: itemAnims[idx].interpolate({
              inputRange: [0, 1],
              outputRange: [0, opacityVal],
            }),
            transform: [
              { translateX: itemTranslateX },
              { scale: scaleVal },
            ],
          }}
        >
          <TouchableOpacity
            style={[
              styles.menuItemRow,
              isSelected && styles.menuItemRowActive,
              item.isLogout && styles.menuItemRowLogout,
            ]}
            activeOpacity={0.85}
            onPressIn={() => {
              Haptics.selectionAsync().catch(() => {});
              setPressedItemId(item.id);
            }}
            onPressOut={() => setPressedItemId(null)}
            onPress={() => {
              setPressedItemId(null);
              onSelectMenuItem?.(item.id);
              closeDrawer();
            }}
          >
            {/* Left Accent Bar for Active Item */}
            {isSelected && <View style={styles.activeLeftIndicator} />}

            <Ionicons
              name={item.icon as any}
              size={20}
              color={
                item.isLogout
                  ? '#EF4444'
                  : isSelected
                  ? '#52C480'
                  : 'rgba(241, 245, 249, 0.65)'
              }
            />

            <Text
              style={[
                styles.menuItemText,
                isSelected && styles.menuItemTextActive,
                item.isLogout && styles.menuItemTextLogout,
              ]}
              numberOfLines={1}
            >
              {item.label}
            </Text>

            {item.badge && (
              <View style={styles.menuBadgePill}>
                <Text style={styles.menuBadgeText}>{item.badge}</Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      );
    };

    return (
      <View style={styles.container} {...panResponder.panHandlers}>
        {/* ─── TRANSLUCENT FROSTED GLASS SIDE NAVIGATION DRAWER PANEL ─── */}
        <Animated.View
          style={[
            styles.drawerPanel,
            {
              opacity: menuOpacity,
              transform: [{ translateX: menuTranslateX }],
            },
          ]}
        >
          {/* Ambient Animated Liquid Light Orbs (breathing under BlurView) */}
          <Animated.View
            style={[
              styles.ambientOrb1,
              {
                opacity: orb1Opacity,
                transform: [{ scale: orb1Scale }, { translateY: orb1Y }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.ambientOrb2,
              {
                opacity: orb2Opacity,
                transform: [{ scale: orb2Scale }, { translateY: orb2Y }],
              },
            ]}
          />

          {/* Frosted Glass Blur & Tint Layers */}
          <BlurView intensity={45} tint="dark" style={StyleSheet.absoluteFillObject} />
          <View style={styles.glassTintOverlay} />

          <SafeAreaView style={styles.drawerSafeArea}>
            <View style={{ flex: 1 }}>
              {/* Top Header Row: Profile Avatar Pill + VIP Badge */}
              <Animated.View
                style={[
                  styles.profileHeaderRow,
                  {
                    opacity: headerAnim,
                    transform: [{ translateY: headerTranslateY }],
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.avatarBtn}
                  activeOpacity={0.85}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
                    closeDrawer();
                    if (onSelectMenuItem) {
                      onSelectMenuItem('profile');
                    } else {
                      router.push('/profile' as any);
                    }
                  }}
                >
                  {userAvatar ? (
                    <Image source={{ uri: userAvatar }} style={styles.avatarImg} />
                  ) : (
                    <Image 
                      source={{ uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random&color=fff&size=100` }} 
                      style={styles.avatarImg} 
                    />
                  )}
                  <View style={styles.headerTextWrap}>
                    <Text style={styles.headerName} numberOfLines={1}>{userName}</Text>
                    <Text style={styles.headerEmail} numberOfLines={1}>{userEmail}</Text>
                    {isEliteUser ? (
                      <Animated.View style={[styles.vipTagPill, { opacity: badgeShimmer }]}>
                        <Ionicons name="sparkles" size={10} color="#F6C450" style={{ marginRight: 4 }} />
                        <Text style={styles.vipTagTxt}>EASYBUY PRO</Text>
                      </Animated.View>
                    ) : (
                      <View style={[styles.vipTagPill, { backgroundColor: 'rgba(47,110,73,0.3)' }]}>
                        <Ionicons name="location" size={10} color="#89B882" style={{ marginRight: 4 }} />
                        <Text style={[styles.vipTagTxt, { color: '#89B882' }]} numberOfLines={1}>{selectedAddress?.city && selectedAddress.city !== 'City' ? selectedAddress.city : 'Set Location'}</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              </Animated.View>

              {/* Main Menu Items (Categories -> Help & Support) */}
              <View style={styles.mainMenuItemsList}>
                {MAIN_MENU_ITEMS.map((item, idx) => renderMenuItemRow(item, idx))}
              </View>
            </View>

            {/* Logout Row Pushed All The Way to Bottom */}
            <View style={styles.logoutBottomWrap}>
              {renderMenuItemRow(LOGOUT_ITEM, MAIN_MENU_ITEMS.length)}
            </View>
          </SafeAreaView>
        </Animated.View>

        {/* ─── SCALED HOME SCREEN CARD (SPATIAL FOREGROUND) ─── */}
        <Animated.View
          style={[
            styles.mainScreenContainer,
            {
              borderRadius: homeBorderRadius,
              transform: [{ translateX: homeTranslateX }, { scale: homeScale }],
            },
          ]}
        >
          {children}

          {/* Dimmed Interactive Overlay (Tapping closes drawer) */}
          <Animated.View
            pointerEvents={isOpen ? 'auto' : 'none'}
            style={[
              styles.dimOverlay,
              {
                opacity: overlayOpacity,
                borderRadius: homeBorderRadius,
              },
            ]}
          >
            <TouchableOpacity
              style={StyleSheet.absoluteFillObject}
              activeOpacity={1}
              onPress={closeDrawer}
            />
          </Animated.View>
        </Animated.View>
      </View>
    );
  }
);

SpatialDrawerWrapper.displayName = 'SpatialDrawerWrapper';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  drawerPanel: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    overflow: 'hidden',
  },
  ambientOrb1: {
    position: 'absolute',
    top: 20,
    left: -20,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#52C480',
    shadowColor: '#52C480',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 40,
  },
  ambientOrb2: {
    position: 'absolute',
    bottom: 100,
    left: 40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#F6C450',
    shadowColor: '#F6C450',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.75,
    shadowRadius: 35,
  },
  glassTintOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.25)', // Ultra-light transparent glass tint
  },
  drawerSafeArea: {
    flex: 1,
    width: DRAWER_WIDTH,
    paddingLeft: 18,
    paddingRight: 22,
    paddingTop: 16,
    paddingBottom: 22,
    justifyContent: 'space-between',
  },

  // ── Profile Header ──────────────────────────────────────────────
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 18,
    // Floating Frosted Glass Capsule
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  avatarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarImg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#52C480',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(82, 196, 128, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(82, 196, 128, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextWrap: {
    gap: 2,
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans-Bold',
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  headerEmail: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.55)',
    marginBottom: 2,
  },
  vipTagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(246, 196, 80, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(246, 196, 80, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  vipTagTxt: {
    fontSize: 9,
    fontFamily: 'PlusJakartaSans-Bold',
    fontWeight: '800',
    color: '#F6C450',
    letterSpacing: 0.6,
  },

  // ── Menu Items ──────────────────────────────────────────────────
  mainMenuItemsList: {
    gap: 6,
    paddingVertical: 4,
  },
  logoutBottomWrap: {
    marginTop: 'auto',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 14,
    position: 'relative',
  },
  menuItemRowActive: {
    // Glowing Emerald Frosted Glass Pill
    backgroundColor: 'rgba(82, 196, 128, 0.16)',
    borderColor: 'rgba(82, 196, 128, 0.4)',
  },
  activeLeftIndicator: {
    position: 'absolute',
    left: 0,
    top: 6,
    bottom: 6,
    width: 3.5,
    backgroundColor: '#52C480',
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },
  menuItemRowLogout: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.25)',
    paddingVertical: 11,
  },
  menuItemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: -0.1,
  },
  menuItemTextActive: {
    fontFamily: 'PlusJakartaSans-Bold',
    color: '#FFFFFF',
    fontWeight: '700',
  },
  menuItemTextLogout: {
    fontFamily: 'PlusJakartaSans-Bold',
    color: '#EF4444',
    fontWeight: '700',
  },
  menuBadgePill: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.45)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  menuBadgeText: {
    fontSize: 9,
    fontFamily: 'PlusJakartaSans-Bold',
    fontWeight: '800',
    color: '#F59E0B',
    letterSpacing: 0.5,
  },

  // ── Main Screen Card ────────────────────────────────────────────
  mainScreenContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    zIndex: 2,
    elevation: 30,
    shadowColor: '#000000',
    shadowOffset: { width: -12, height: 16 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
  },
  dimOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    zIndex: 999,
  },
});
