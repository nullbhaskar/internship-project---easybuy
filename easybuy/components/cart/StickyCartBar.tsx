import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming 
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../context/CartContext';
import { useEasyBuyTheme } from '../../constants/ThemeContext';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

// Screens where the floating bar should NOT appear
const HIDDEN_SCREENS = ['/cart', '/checkout', '/login', '/register', '/otp-verify', '/onboarding', '/', '/admin'];

export const StickyCartBar = () => {
  const { totalItems, totalAmount, openCart } = useCart();
  const { isDarkMode } = useEasyBuyTheme();
  const pathname = usePathname();
  const router = useRouter();

  const translateY = useSharedValue(150); // Start off-screen
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Hide if no items OR if on a hidden screen
    if (totalItems === 0 || HIDDEN_SCREENS.includes(pathname)) {
      translateY.value = withTiming(150, { duration: 300 });
      opacity.value = withTiming(0, { duration: 300 });
    } else {
      // Show
      translateY.value = withSpring(0, { damping: 16, stiffness: 120 });
      opacity.value = withTiming(1, { duration: 300 });
    }
  }, [totalItems, pathname]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    };
  });

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    router.push('/cart'); // Navigates directly to your original cart page
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]} pointerEvents={totalItems === 0 || HIDDEN_SCREENS.includes(pathname) ? 'none' : 'auto'}>
      <TouchableOpacity 
        style={[styles.bar, isDarkMode && styles.barDark]} 
        activeOpacity={0.9} 
        onPress={handlePress}
      >
        {/* Left Side: Summary */}
        <View style={styles.leftContent}>
          <View style={[styles.iconCircle, isDarkMode && { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
            <Ionicons name="cart" size={18} color="#FFFFFF" />
            <View style={[styles.badge, isDarkMode && { borderColor: '#1E293B' }]}>
              <Text style={styles.badgeText}>{totalItems}</Text>
            </View>
          </View>
          <View style={styles.textStack}>
            <Text style={[styles.itemCountText, isDarkMode && { color: '#94A3B8' }]}>{totalItems} item{totalItems > 1 ? 's' : ''}</Text>
            <Text style={styles.priceText}>₹{totalAmount.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        {/* Right Side: Action */}
        <View style={styles.rightContent}>
          <Text style={styles.actionText}>View Cart</Text>
          <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 95 : 75, 
    alignSelf: 'center', // perfectly center without stretching
    zIndex: 9999,
    elevation: 15,
  },
  bar: {
    minWidth: 240, // very minimal compact width
    height: 54, // slightly slimmer
    backgroundColor: '#2F6E49', 
    borderRadius: 27, // fully rounded pill
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 8,
    paddingRight: 16,
    shadowColor: '#2F6E49',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
  },
  barDark: {
    backgroundColor: '#1E293B',
    shadowColor: '#000000',
    shadowOpacity: 0.5,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#2F6E49',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontFamily: 'PlusJakartaSans-ExtraBold',
  },
  textStack: {
    justifyContent: 'center',
  },
  itemCountText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 10,
    fontFamily: 'PlusJakartaSans-SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priceText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'PlusJakartaSans-ExtraBold',
    marginTop: -2,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 24, // push it to the right
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'PlusJakartaSans-Bold',
  },
});
