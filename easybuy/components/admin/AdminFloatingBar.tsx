import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, usePathname } from 'expo-router';
import { auth } from '../../services/firebase';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import Animated, { 
  FadeInUp, 
  FadeOutUp, 
  LinearTransition,
  withSpring,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const ADMIN_EMAIL = 'admineasybuy@gmail.com';

export const AdminFloatingBar: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const check = async () => {
      try {
        const isAuthScreen = !pathname || ['/login', '/register', '/forgot-password', '/onboarding', '/'].includes(pathname);
        if (isAuthScreen) {
          setIsAdmin(false);
          return;
        }
        const stored = await AsyncStorage.getItem('isAdmin');
        const emailMatch = auth.currentUser?.email === ADMIN_EMAIL;
        setIsAdmin(stored === 'true' || emailMatch);
      } catch {
        setIsAdmin(false);
      }
    };
    check();
    const unsub = auth.onAuthStateChanged(() => check());
    return unsub;
  }, [pathname]);

  const isAuthScreen = !pathname || ['/login', '/register', '/forgot-password', '/onboarding', '/'].includes(pathname);
  if (!isAdmin || isAuthScreen) return null;

  const isOnAdminScreen = pathname === '/admin' || pathname?.startsWith('/admin');

  const toggleMinimize = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setMinimized(!minimized);
  };

  const handleSwitch = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    if (isOnAdminScreen) {
      router.replace('/home' as any);
    } else {
      router.replace('/admin' as any);
    }
  };

  // The Dynamic Island spring configuration
  const islandTransition = LinearTransition.springify().damping(16).stiffness(120);

  return (
    <View style={[styles.wrapper, { top: Math.max(insets.top + 10, 20) }]} pointerEvents="box-none">
      <Animated.View 
        entering={FadeInUp.springify().damping(14).stiffness(100)} 
        exiting={FadeOutUp}
        layout={islandTransition}
        style={[styles.shadowContainer]}
      >
        <TouchableOpacity 
          activeOpacity={0.9} 
          onPress={minimized ? toggleMinimize : undefined}
          style={{ borderRadius: 30 }}
        >
          {/* 
            On web, BlurView can sometimes create a white box if mixed with shadows. 
            We isolate the blur inside a hidden overflow container.
          */}
          <View style={[styles.blurClipper, minimized && styles.blurClipperMinimized]}>
            <BlurView intensity={Platform.OS === 'web' ? 100 : 80} tint="dark" style={styles.pill}>
              
              {/* Left Section (Dot + Label) */}
              <View style={styles.leftSection}>
                <View style={styles.pulseDot} />
                {!minimized && <Text style={styles.adminLabel} numberOfLines={1}>ADMIN</Text>}
              </View>

              {/* Actions Section */}
              <View style={styles.actions} pointerEvents={minimized ? 'none' : 'auto'}>
                <TouchableOpacity
                  style={[styles.switchBtn, minimized && styles.switchBtnMinimized]}
                  onPress={handleSwitch}
                  activeOpacity={0.85}
                >
                  <Ionicons 
                    name={isOnAdminScreen ? "home" : "shield-checkmark"} 
                    size={minimized ? 18 : 14} 
                    color="#1A3D2B" 
                  />
                  {!minimized && (
                    <Text style={styles.switchBtnText}>
                      {isOnAdminScreen ? "View App" : "Dashboard"}
                    </Text>
                  )}
                </TouchableOpacity>

                {!minimized && (
                  <TouchableOpacity
                    style={styles.minimizeBtn}
                    onPress={toggleMinimize}
                    activeOpacity={0.8}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  >
                    <Ionicons name="contract" size={16} color="#A3B8AC" />
                  </TouchableOpacity>
                )}
              </View>

            </BlurView>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 99999,
  },
  shadowContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
    borderRadius: 30,
    backgroundColor: 'transparent',
  },
  blurClipper: {
    borderRadius: 30,
    overflow: 'hidden',
    minWidth: 260, // Desktop/Web wide pill
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(30, 40, 35, 0.85)',
  },
  blurClipperMinimized: {
    minWidth: 0,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 4,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ADE80',
    shadowColor: '#4ADE80',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 2,
  },
  adminLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1.2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  switchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F6CC63',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  switchBtnMinimized: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 20,
  },
  switchBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1A3D2B',
  },
  minimizeBtn: {
    padding: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
  },
});
