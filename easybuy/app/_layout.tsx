import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Image, Animated } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { LanguageProvider } from '../context/LanguageContext';
import { AddressProvider } from '../context/AddressContext';
import { ThemeProvider } from '../constants/ThemeContext';
import { CartProvider } from '../context/CartContext';
import { WishlistProvider } from '../context/WishlistContext';
import { CartDrawerModal } from '../components/cart/CartDrawerModal';
import { WishlistDrawerModal } from '../components/wishlist/WishlistDrawerModal';
import { LocationPickerModal } from '../components/location/LocationPickerModal';

import { ProductTransitionProvider } from '../context/ProductTransitionContext';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    async function prepare() {
      // Smooth fade-in and scale animation for logo
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: false,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: false,
        }),
      ]).start();

      try {
        // Safely load icon fonts with timeout racing to prevent 6000ms fontfaceobserver error
        await Promise.race([
          Font.loadAsync(Ionicons.font),
          new Promise((resolve) => setTimeout(resolve, 2000)),
        ]).catch((e) => console.log('Font load fallback activated:', e));

        await new Promise((resolve) => setTimeout(resolve, 800));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
        await SplashScreen.hideAsync().catch(() => {});
      }
    }

    prepare();
  }, []);

  if (!appIsReady) {
    return (
      <View style={styles.splashContainer}>
        <StatusBar style="dark" backgroundColor="#FFF5C6" />
        <Animated.View
          style={[
            styles.logoWrapper,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Image
            source={require('../assets/images/easybuy_logo.png')}
            style={styles.splashLogo}
            resizeMode="contain"
          />
        </Animated.View>
      </View>
    );
  }

  return (
    <ThemeProvider>
      <LanguageProvider>
        <AddressProvider>
          <CartProvider>
            <WishlistProvider>
              <ProductTransitionProvider>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="index" />
                  <Stack.Screen name="onboarding" />
                  <Stack.Screen name="login" />
                  <Stack.Screen name="register" />
                  <Stack.Screen name="forgot-password" />
                  <Stack.Screen name="home" />
                  <Stack.Screen name="profile" />
                  <Stack.Screen name="quickbuy" />
                  <Stack.Screen name="orders" />
                  <Stack.Screen name="all-items" />
                  <Stack.Screen name="offers" />
                  <Stack.Screen name="add-address" />
                  <Stack.Screen name="product/[id]" options={{ animation: 'none' }} />
                </Stack>
                <CartDrawerModal />
                <WishlistDrawerModal />
                <LocationPickerModal />
              </ProductTransitionProvider>
            </WishlistProvider>
          </CartProvider>
        </AddressProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#FFF5C6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashLogo: {
    width: 220,
    height: 220,
  },
});
