import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 💡 DEVELOPMENT MODE TOGGLE:
// Set to `false` so the app remembers onboarding completion and goes straight to Login on reload!
export const DEV_MODE_ALWAYS_SHOW_ONBOARDING = false;

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    async function checkStorage() {
      try {
        const val = await AsyncStorage.getItem('hasSeenOnboarding');
        if (val === 'true') {
          setHasSeenOnboarding(true);
        }
      } catch (e) {
        console.warn('Error reading hasSeenOnboarding:', e);
      } finally {
        setLoading(false);
      }
    }
    checkStorage();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2D6B42" />
      </View>
    );
  }

  // In Dev Mode, always route to Onboarding on launch
  if (DEV_MODE_ALWAYS_SHOW_ONBOARDING) {
    return <Redirect href="/onboarding" />;
  }

  if (hasSeenOnboarding) {
    return <Redirect href="/login" />;
  }

  return <Redirect href="/onboarding" />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FAFDFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
