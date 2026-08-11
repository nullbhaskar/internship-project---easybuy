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
  SafeAreaView,
  Image,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';

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
  { id: 'wallet', label: 'Wallet', icon: 'wallet-outline' },
  { id: 'loyalty', label: 'Loyalty & Subscription', icon: 'ribbon-outline' },
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
}

export const SpatialDrawerWrapper = forwardRef<SpatialDrawerRef, SpatialDrawerWrapperProps>(
  (
    {
      children,
      activeMenuItem = 'categories',
      onSelectMenuItem,
      userName = 'Bhaskar',
      userEmail = 'bhaskar@email.com',
      userAvatar,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [pressedItemId, setPressedItemId] = useState<string | null>(null);

    // SINGLE SOURCE OF TRUTH: drawerProgress (0 = closed, 1 = open)
    const drawerProgress = useRef(new Animated.Value(0)).current;

    // Header entrance animation
    const headerAnim = useRef(new Animated.Value(0)).current;

    // Menu items stagger animations
    const itemAnims = useRef(ALL_MENU_ITEMS.map(() => new Animated.Value(0))).current;

    const isOpenRef = useRef(false);

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
        onMoveShouldSetPanResponder: (_, gestureState: PanResponderGestureState) => {
          const { dx, dy, moveX } = gestureState;
          if (!isOpenRef.current && moveX < 32 && dx > 8 && Math.abs(dx) > Math.abs(dy)) {
            return true;
          }
          if (isOpenRef.current && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
            return true;
          }
          return false;
        },
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
              item.isLogout && styles.menuItemRowLogout,
            ]}
            activeOpacity={0.9}
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
            <Ionicons
              name={item.icon as any}
              size={21}
              color={
                item.isLogout
                  ? '#FF6B6B'
                  : (isSelected || isPressed)
                  ? '#FFFFFF'
                  : 'rgba(255, 255, 255, 0.85)'
              }
            />

            <Text
              style={[
                styles.menuItemText,
                (isSelected || isPressed) && styles.menuItemTextActive,
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
        {/* ─── PURE TEXT & ICON FISHEYE MAGNIFICATION SIDE PANEL (NO BOXES) ─── */}
        <Animated.View
          style={[
            styles.drawerPanel,
            {
              opacity: menuOpacity,
              transform: [{ translateX: menuTranslateX }],
            },
          ]}
        >
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
                    <View style={styles.avatarCircle}>
                      <Ionicons name="person-outline" size={20} color="#FFFFFF" />
                    </View>
                  )}
                  <View style={styles.headerTextWrap}>
                    <Text style={styles.headerName} numberOfLines={1}>{userName}</Text>
                    <View style={styles.vipTagPill}>
                      <Text style={styles.vipTagTxt}>👑 EASYBUY PRO</Text>
                    </View>
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
    backgroundColor: '#0F4C28', // Rich Clean Vibrant Forest Emerald
  },
  drawerPanel: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#0F4C28',
    zIndex: 1,
  },
  drawerSafeArea: {
    flex: 1,
    paddingLeft: 20,
    paddingRight: 28,
    paddingTop: 16,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginBottom: 12,
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
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextWrap: {
    gap: 3,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  vipTagPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  vipTagTxt: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  mainMenuItemsList: {
    gap: 10,
    paddingVertical: 6,
  },
  logoutBottomWrap: {
    marginTop: 'auto',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
  },
  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 11,
    borderRadius: 14,
    backgroundColor: 'transparent', // 100% NO BOXES / NO CONTAINERS
    borderWidth: 0,
    gap: 16,
  },
  menuItemRowLogout: {
    paddingVertical: 10,
  },
  menuItemText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  menuItemTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  menuItemTextLogout: {
    color: '#FF6B6B',
    fontWeight: '900',
  },
  menuBadgePill: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  menuBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  mainScreenContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    zIndex: 2,
    elevation: 25,
    shadowColor: '#000000',
    shadowOffset: { width: -8, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
  },
  dimOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    zIndex: 999,
  },
});
