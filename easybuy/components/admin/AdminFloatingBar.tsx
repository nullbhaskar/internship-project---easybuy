import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  PanResponder,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, usePathname } from 'expo-router';
import { auth } from '../../services/firebase';

const { width, height } = Dimensions.get('window');

const ADMIN_EMAIL = 'admineasybuy@gmail.com';

export const AdminFloatingBar: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Bubble drag position (only used in minimized mode)
  const pan = useRef(new Animated.ValueXY({ x: width - 72, y: height * 0.35 })).current;
  const barSlide = useRef(new Animated.Value(-60)).current;
  const barOpacity = useRef(new Animated.Value(0)).current;

  // Check admin status on mount and when auth changes
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
    // Re-check every time the screen changes (covers login/logout)
    const unsub = auth.onAuthStateChanged(() => check());
    return unsub;
  }, [pathname]);

  // Animate bar in/out
  useEffect(() => {
    if (isAdmin) {
      Animated.parallel([
        Animated.spring(barSlide, { toValue: 0, tension: 80, friction: 12, useNativeDriver: true }),
        Animated.timing(barOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.timing(barOpacity, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    }
  }, [isAdmin]);

  // Drag responder for minimized bubble
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: () => pan.flattenOffset(),
      onPanResponderGrant: () => pan.setOffset({ x: (pan.x as any)._value, y: (pan.y as any)._value }),
    })
  ).current;

  // Hide completely on login/auth screens or when not admin
  const isAuthScreen = !pathname || ['/login', '/register', '/forgot-password', '/onboarding', '/'].includes(pathname);
  if (!isAdmin || isAuthScreen) return null;

  const isOnAdminScreen = pathname === '/admin' || pathname?.startsWith('/admin');

  // ── Minimized floating bubble ──────────────────────────────────
  if (minimized) {
    return (
      <Animated.View
        style={[styles.bubble, { transform: pan.getTranslateTransform() }]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          onPress={() => setMinimized(false)}
          onLongPress={() => {
            if (isOnAdminScreen) {
              router.push('/home' as any);
            } else {
              router.push('/admin' as any);
            }
          }}
          activeOpacity={0.85}
          style={styles.bubbleInner}
        >
          <Ionicons name={isOnAdminScreen ? 'home' : 'shield-checkmark'} size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // ── Full bar ───────────────────────────────────────────────────
  return (
    <Animated.View
      style={[
        styles.bar,
        { transform: [{ translateY: barSlide }], opacity: barOpacity },
      ]}
      pointerEvents="box-none"
    >
      {/* Left: context-aware nav button */}
      {isOnAdminScreen ? (
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => router.push('/home' as any)}
          activeOpacity={0.85}
        >
          <Ionicons name="home-outline" size={14} color="#FFFFFF" />
          <Text style={styles.navBtnText}>View App</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => router.push('/admin' as any)}
          activeOpacity={0.85}
        >
          <Ionicons name="shield-checkmark-outline" size={14} color="#FFFFFF" />
          <Text style={styles.navBtnText}>Admin Panel</Text>
        </TouchableOpacity>
      )}

      {/* Center label */}
      <View style={styles.centerLabel}>
        <View style={styles.adminDot} />
        <Text style={styles.adminLabel}>ADMIN MODE</Text>
      </View>

      {/* Right: minimize */}
      <TouchableOpacity
        style={styles.minimizeBtn}
        onPress={() => setMinimized(true)}
        activeOpacity={0.8}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="remove" size={16} color="rgba(255,255,255,0.7)" />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 38,
    backgroundColor: '#1A3D2B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    zIndex: 9999,
    // subtle amber bottom border to distinguish from content
    borderBottomWidth: 1.5,
    borderBottomColor: '#F6CC63',
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(246,204,99,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(246,204,99,0.35)',
  },
  navBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F6CC63',
    letterSpacing: 0.3,
  },
  centerLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  adminDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ADE80',
  },
  adminLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1.5,
  },
  minimizeBtn: {
    padding: 4,
  },
  // Minimized draggable bubble
  bubble: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1A3D2B',
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    borderWidth: 2,
    borderColor: '#F6CC63',
  },
  bubbleInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
