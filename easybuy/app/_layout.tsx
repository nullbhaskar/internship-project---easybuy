import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Image, Animated, LogBox } from 'react-native';
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
import { LocationPickerModal } from '../components/location';
import { AdminFloatingBar } from '../components/admin/AdminFloatingBar';

import { ProductTransitionProvider } from '../context/ProductTransitionContext';

import {
  useFonts,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import {
  Outfit_600SemiBold,
  Outfit_700Bold,
} from '@expo-google-fonts/outfit';

import { AuthProvider } from '../context/AuthContext';
import { ErrorBoundary } from '../components/ErrorBoundary';

// Suppress Expo Go SDK 53 Push Notification warning during development
LogBox.ignoreLogs(['expo-notifications: Android Push notifications']);

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
        // Safely load icon fonts & Google fonts with timeout racing to prevent fontfaceobserver error
        await Promise.race([
          Font.loadAsync({
            ...Ionicons.font,
            'PlusJakartaSans-Medium': PlusJakartaSans_500Medium,
            'PlusJakartaSans-SemiBold': PlusJakartaSans_600SemiBold,
            'PlusJakartaSans-Bold': PlusJakartaSans_700Bold,
            'PlusJakartaSans-ExtraBold': PlusJakartaSans_800ExtraBold,
            'Outfit-SemiBold': Outfit_600SemiBold,
            'Outfit-Bold': Outfit_700Bold,
          }),
          new Promise((resolve) => setTimeout(resolve, 2500)),
        ]).catch((e) => console.log('Font load fallback activated:', e));

        await new Promise((resolve) => setTimeout(resolve, 600));
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
      <ErrorBoundary>
        <LanguageProvider>
          <AuthProvider>
            <AddressProvider>
              <CartProvider>
                <WishlistProvider>
                  <ProductTransitionProvider>
                    <Stack
                      screenOptions={{
                        headerShown: false,
                        animation: 'fade',
                        animationDuration: 240,
                      }}
                    >
                      <Stack.Screen name="index" options={{ animation: 'fade' }} />
                      <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
                      <Stack.Screen name="login" options={{ animation: 'slide_from_bottom' }} />
                      <Stack.Screen name="register" options={{ animation: 'slide_from_right' }} />
                      <Stack.Screen name="forgot-password" options={{ animation: 'slide_from_right' }} />
                      <Stack.Screen name="admin" options={{ animation: 'slide_from_bottom' }} />
                      <Stack.Screen name="home" options={{ animation: 'fade' }} />
                      <Stack.Screen name="profile" options={{ animation: 'fade_from_bottom' }} />
                      <Stack.Screen name="quickbuy" options={{ animation: 'slide_from_bottom', animationDuration: 260 }} />
                      <Stack.Screen name="orders" options={{ animation: 'slide_from_right' }} />
                      <Stack.Screen name="all-items" options={{ animation: 'slide_from_right' }} />
                      <Stack.Screen name="offers" options={{ animation: 'fade_from_bottom' }} />
                      <Stack.Screen name="add-address" options={{ animation: 'slide_from_bottom' }} />
                      <Stack.Screen name="product/[id]" options={{ animation: 'none' }} />
                    </Stack>
                    <CartDrawerModal />
                    <WishlistDrawerModal />
                    <LocationPickerModal />
                    <AdminFloatingBar />
                  </ProductTransitionProvider>
                </WishlistProvider>
              </CartProvider>
            </AddressProvider>
          </AuthProvider>
        </LanguageProvider>
      </ErrorBoundary>
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