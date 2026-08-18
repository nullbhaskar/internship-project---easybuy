import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Animated,
  Dimensions,
  Easing,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';

import { AuthInput } from '../components/auth/AuthInput';
import { BenefitItem } from '../components/auth/BenefitItem';
import { LanguageSelector } from '../components/common/LanguageSelector';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { executePostLoginFlow } from '../services/locationPermissionService';

const { width, height: screenHeight } = Dimensions.get('window');
const isSmallScreen = screenHeight < 760;
const NORMAL_HERO_HEIGHT = isSmallScreen ? Math.min(width * 0.30, 115) : width * 0.42;

// Apple iOS Smooth Spring Bezier Curve: cubic-bezier(0.16, 1, 0.3, 1)
const APPLE_EASING = Easing.bezier(0.16, 1, 0.3, 1);

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { setGuestMode } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [focusedField, setFocusedField] = useState<'username' | 'password' | null>(null);
  const [blurVal, setBlurVal] = useState(0);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [identifierErrorKey, setIdentifierErrorKey] = useState('');
  const [passwordErrorKey, setPasswordErrorKey] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthSuccess, setIsAuthSuccess] = useState(false);

  // ─── Animated Values ───────────────────────────────────────────────────────
  const logoFadeAnim     = useRef(new Animated.Value(0)).current;
  const logoScaleAnim    = useRef(new Animated.Value(0.92)).current;
  const heroFadeAnim     = useRef(new Animated.Value(0)).current;
  const heroSlideAnim    = useRef(new Animated.Value(20)).current;
  const panelFadeAnim    = useRef(new Animated.Value(0)).current;
  const panelSlideAnim   = useRef(new Animated.Value(28)).current;
  const welcomeFadeAnim  = useRef(new Animated.Value(0)).current;
  const inputsFadeAnim   = useRef(new Animated.Value(0)).current;
  const btnFadeAnim      = useRef(new Animated.Value(0)).current;
  const benefitsFadeAnim = useRef(new Animated.Value(0)).current;

  const screenExitAnim   = useRef(new Animated.Value(1)).current;
  const heroFloatAnim    = useRef(new Animated.Value(0)).current;
  const sparklePulseAnim = useRef(new Animated.Value(0.5)).current;
  const sparkleScaleAnim = useRef(new Animated.Value(0.92)).current;

  // Keyboard / Focus progress driver (0 → 1)
  const keyboardAnim      = useRef(new Animated.Value(0)).current;
  const blurIntensityAnim = useRef(new Animated.Value(0)).current;

  const forgotPassScale  = useRef(new Animated.Value(1)).current;
  const btnScaleAnim     = useRef(new Animated.Value(1)).current;
  const checkmarkScale   = useRef(new Animated.Value(0.7)).current;
  const checkmarkFade    = useRef(new Animated.Value(0)).current;

  // Stepped blur listener
  useEffect(() => {
    let lastStep = -1;
    const id = blurIntensityAnim.addListener(({ value }) => {
      const step = Math.round(value / 4) * 4;
      if (step !== lastStep) {
        lastStep = step;
        setBlurVal(step);
      }
    });
    return () => blurIntensityAnim.removeListener(id);
  }, []);

  // ─── Entrance Sequence ───────────────────────────────────────────────────────
  useEffect(() => {
    Animated.stagger(50, [
      Animated.parallel([
        Animated.timing(heroFadeAnim, { toValue: 1, duration: 380, easing: APPLE_EASING, useNativeDriver: false }),
        Animated.timing(heroSlideAnim, { toValue: 0, duration: 380, easing: APPLE_EASING, useNativeDriver: false }),
      ]),
      Animated.parallel([
        Animated.timing(logoFadeAnim, { toValue: 1, duration: 360, easing: APPLE_EASING, useNativeDriver: false }),
        Animated.timing(logoScaleAnim, { toValue: 1, duration: 360, easing: APPLE_EASING, useNativeDriver: false }),
      ]),
      Animated.parallel([
        Animated.timing(panelFadeAnim, { toValue: 1, duration: 360, easing: APPLE_EASING, useNativeDriver: false }),
        Animated.timing(panelSlideAnim, { toValue: 0, duration: 360, easing: APPLE_EASING, useNativeDriver: false }),
      ]),
      Animated.timing(welcomeFadeAnim,  { toValue: 1, duration: 280, useNativeDriver: false }),
      Animated.timing(inputsFadeAnim,   { toValue: 1, duration: 280, useNativeDriver: false }),
      Animated.timing(btnFadeAnim,      { toValue: 1, duration: 280, useNativeDriver: false }),
      Animated.timing(benefitsFadeAnim, { toValue: 1, duration: 280, useNativeDriver: false }),
    ]).start();

    // Hero float loop
    Animated.loop(Animated.sequence([
      Animated.timing(heroFloatAnim, { toValue: -6, duration: 2800, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
      Animated.timing(heroFloatAnim, { toValue: 0,  duration: 2800, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
    ])).start();

    // Ambient glow pulse
    Animated.loop(Animated.sequence([
      Animated.parallel([
        Animated.timing(sparklePulseAnim, { toValue: 1.0, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
        Animated.timing(sparkleScaleAnim, { toValue: 1.06, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
      ]),
      Animated.parallel([
        Animated.timing(sparklePulseAnim, { toValue: 0.5, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
        Animated.timing(sparkleScaleAnim, { toValue: 0.92, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
      ]),
    ])).start();
  }, []);

  // ─── Keyboard & Focus Listeners (Universal Adaptive Height Sensing) ───────────
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = Keyboard.addListener(showEvent, (e) => {
      if (e?.endCoordinates?.height) {
        setKeyboardHeight(e.endCoordinates.height);
      }
      Animated.parallel([
        Animated.timing(keyboardAnim, { toValue: 1, duration: 320, easing: APPLE_EASING, useNativeDriver: false }),
        Animated.timing(blurIntensityAnim, { toValue: 32, duration: 320, easing: APPLE_EASING, useNativeDriver: false }),
      ]).start();
    });

    const onHide = Keyboard.addListener(hideEvent, () => {
      setFocusedField(null);
      setKeyboardHeight(0);
      Animated.parallel([
        Animated.timing(keyboardAnim, { toValue: 0, duration: 280, easing: APPLE_EASING, useNativeDriver: false }),
        Animated.timing(blurIntensityAnim, { toValue: 0, duration: 280, easing: APPLE_EASING, useNativeDriver: false }),
      ]).start();
    });

    return () => { onShow.remove(); onHide.remove(); };
  }, []);

  // Focus Transition Driver
  useEffect(() => {
    const isFocused = focusedField !== null;
    Animated.parallel([
      Animated.timing(blurIntensityAnim, {
        toValue: isFocused ? 32 : 0,
        duration: 320,
        easing: APPLE_EASING,
        useNativeDriver: false,
      }),
      Animated.timing(keyboardAnim, {
        toValue: isFocused ? 1 : 0,
        duration: 320,
        easing: APPLE_EASING,
        useNativeDriver: false,
      }),
    ]).start();
  }, [focusedField]);

  // ─── Validation & Form Handlers ─────────────────────────────────────────────
  const validate = () => {
    let ok = true;
    setAuthError('');

    const cleanIdentifier = identifier.trim();
    const cleanPassword = password.trim();

    if (!cleanIdentifier) {
      setIdentifierErrorKey('usernameRequired');
      ok = false;
    } else {
      setIdentifierErrorKey('');
    }

    if (!cleanPassword) {
      setPasswordErrorKey('passwordRequired');
      ok = false;
    } else if (password.length < 6) {
      setPasswordErrorKey('passwordMinLength');
      ok = false;
    } else {
      setPasswordErrorKey('');
    }

    return ok;
  };

  const handleLogin = async () => {
    if (isSubmitting || isAuthSuccess) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    if (validate()) {
      setIsSubmitting(true);
      setAuthError('');
      try {
        const cleanEmail = identifier.trim().toLowerCase();
        const isAdminEmail = cleanEmail === 'admineasybuy@gmail.com' && password === 'admin@123';

        let isAuthenticated = false;

        if (isAdminEmail) {
          isAuthenticated = true;
          try {
            await signInWithEmailAndPassword(auth, cleanEmail, password);
          } catch (authErr) {
            console.warn('Admin auth sign-in failed, continuing with static admin access:', authErr);
          }
        } else {
          // 1. Check email address and password against Firestore users collection
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where('email', '==', cleanEmail), where('password', '==', password));
          const querySnapshot = await getDocs(q);
          isAuthenticated = !querySnapshot.empty;

          // 2. Also authenticate via Firebase Auth if needed
          if (!isAuthenticated) {
            try {
              await signInWithEmailAndPassword(auth, cleanEmail, password);
              isAuthenticated = true;
            } catch (authErr) {
              // Both failed
            }
          } else {
            try {
              await signInWithEmailAndPassword(auth, cleanEmail, password);
            } catch (e) {}
          }
        }

        if (isAuthenticated) {
          setIsSubmitting(false);
          setIsAuthSuccess(true);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

          const isAdminEmail = cleanEmail === 'admineasybuy@gmail.com' && password === 'admin@123';
          if (isAdminEmail) {
            await AsyncStorage.setItem('isAdmin', 'true');
          } else {
            await AsyncStorage.removeItem('isAdmin');
          }

          executePostLoginFlow().catch((e) => console.log('Post login flow error:', e));

          Animated.parallel([
            Animated.spring(checkmarkScale, { toValue: 1, friction: 6, tension: 140, useNativeDriver: false }),
            Animated.timing(checkmarkFade, { toValue: 1, duration: 220, useNativeDriver: false }),
          ]).start(() => {
            setTimeout(() => {
              Animated.timing(screenExitAnim, { toValue: 0, duration: 340, easing: APPLE_EASING, useNativeDriver: false })
                .start(() => {
                  setIsAuthSuccess(false);
                  screenExitAnim.setValue(1);
                  if (isAdminEmail) {
                    router.replace('/admin' as any);
                  } else {
                    router.replace('/home' as any);
                  }
                });
            }, 380);
          });
        } else {
          setIsSubmitting(false);
          setAuthError('Invalid email address or password. Please try again.');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        }
      } catch (error: any) {
        setIsSubmitting(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        console.warn('Firebase Login Error:', error.code, error.message);
        if (error.code === 'auth/network-request-failed' || error.message?.includes('network-request-failed')) {
          setAuthError('Network error. Please check your connection or continue as guest below.');
        } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
          setAuthError('Invalid email or password. Please try again.');
        } else if (error.code === 'auth/invalid-email') {
          setIdentifierErrorKey('validEmailRequired');
        } else if (error.code === 'auth/user-disabled') {
          setAuthError('This user account has been disabled.');
        } else if (error.code === 'auth/too-many-requests') {
          setAuthError('Too many failed attempts. Please try again later.');
        } else {
          setAuthError('Authentication failed. Please check your credentials or continue as guest.');
        }
      }
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    }
  };

  // GPU-Accelerated Adaptive Interpolations
  const heroHeight     = keyboardAnim.interpolate({ inputRange: [0, 1], outputRange: [NORMAL_HERO_HEIGHT, 0] });
  const heroTranslateY = keyboardAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -NORMAL_HERO_HEIGHT * 0.4] });
  const heroScale      = keyboardAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.35] });
  const heroOpacity    = keyboardAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0.2, 0] });
  const taglineOp      = keyboardAnim.interpolate({ inputRange: [0, 0.4, 1], outputRange: [1, 0.1, 0] });
  const bgDimOp        = keyboardAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.92] });
  const brandTranslateY = keyboardAnim.interpolate({ inputRange: [0, 1], outputRange: [0, isSmallScreen ? -50 : -20] });
  const brandScale      = keyboardAnim.interpolate({ inputRange: [0, 1], outputRange: [1, isSmallScreen ? 0.75 : 0.88] });

  // Adaptive card shift so bottom rounded corners float above any keyboard height
  const cardTransY = Animated.add(
    panelSlideAnim,
    keyboardAnim.interpolate({ inputRange: [0, 1], outputRange: [0, isSmallScreen ? -110 : -60] })
  );
  const cardScale  = keyboardAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.01] });

  // Trust badges bar collapses completely when keyboard is open
  const badgesOp       = keyboardAnim.interpolate({ inputRange: [0, 0.2, 1], outputRange: [1, 0, 0] });
  const badgesHeight   = keyboardAnim.interpolate({ inputRange: [0, 1], outputRange: [42, 0] });
  const badgesMarginTop= keyboardAnim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <Animated.View style={{ flex: 1, opacity: screenExitAnim, transform: [{ scale: screenExitAnim }] }}>

        {/* Ambient Glow */}
        <Animated.View
          pointerEvents="none"
          style={[styles.ambientGlow, { opacity: sparklePulseAnim, transform: [{ scale: sparkleScaleAnim }] }]}
        />

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              keyboardHeight > 0 && { paddingBottom: Math.max(24, keyboardHeight * 0.4) }
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
            scrollEnabled={true}
          >

            {/* 1. BACKGROUND LAYER (Blurred behind floating card on focus) */}
            <View style={styles.bgLayer}>
              <View style={styles.heroSection}>

                {/* Top bar with Language Selector */}
                <View style={styles.topBar}>
                  <View />
                  <LanguageSelector />
                </View>

                {/* Brand */}
                <Animated.View
                  style={[
                    styles.brandContainer,
                    {
                      opacity: logoFadeAnim,
                      transform: [
                        { scale: Animated.multiply(logoScaleAnim, brandScale) },
                        { translateY: brandTranslateY },
                      ],
                    },
                  ]}
                >
                  <View style={styles.logoBadge}>
                    <Image source={require('../assets/images/easybuy_logo.png')} style={styles.logoImage} resizeMode="contain" />
                  </View>
                  <Text style={styles.brandTitle}>Easy<Text style={styles.brandTitleAccent}>Buy</Text></Text>
                  <Animated.Text style={[styles.tagline, { opacity: taglineOp }]}>{t('tagline')}</Animated.Text>
                </Animated.View>

                {/* Hero 3D Graphic */}
                <Animated.View
                  style={[
                    styles.heroWrapper,
                    {
                      height: heroHeight,
                      opacity: Animated.multiply(heroFadeAnim, heroOpacity),
                      transform: [
                        { translateY: heroSlideAnim },
                        { translateY: heroFloatAnim },
                        { translateY: heroTranslateY },
                        { scale: heroScale },
                      ],
                    },
                  ]}
                >
                  <Image source={require('../assets/images/login_hero.png')} style={styles.heroImage} resizeMode="contain" />
                </Animated.View>
              </View>

              {/* Dynamic Gaussian Blur Overlay over Background Layer (iOS, Android & Web) */}
              {blurVal > 0.5 && (
                <BlurView
                  intensity={blurVal}
                  tint="extraLight"
                  style={[
                    StyleSheet.absoluteFillObject,
                    Platform.OS === 'web' ? ({ backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' } as any) : null,
                  ]}
                  pointerEvents="none"
                />
              )}

              {/* Soft Translucent Frosted Glass Layer */}
              <Animated.View
                pointerEvents="none"
                style={[
                  StyleSheet.absoluteFillObject,
                  {
                    backgroundColor: 'rgba(232, 242, 235, 0.85)',
                    opacity: bgDimOp,
                  },
                ]}
              />
            </View>

            {/* 2. FOREGROUND TRUE FLOATING CARD LAYER (32px Rounded Corners on ALL 4 Sides) */}
            <Animated.View
              style={[
                styles.card,
                {
                  opacity: panelFadeAnim,
                  transform: [{ translateY: cardTransY }, { scale: cardScale }],
                },
              ]}
            >
              {/* Card Header */}
              <Animated.View style={[styles.cardHeader, { opacity: welcomeFadeAnim }]}>
                <Text style={styles.welcomeHeading}>{t('welcomeHeading')}</Text>
                <Text style={styles.welcomeSub}>{t('welcomeSubtitle')}</Text>
              </Animated.View>

              {/* Input Fields */}
              <Animated.View style={{ opacity: inputsFadeAnim }}>
                <AuthInput
                  placeholder={t('usernamePlaceholder')}
                  value={identifier}
                  onChangeText={(text) => {
                    setIdentifier(text);
                    if (identifierErrorKey) setIdentifierErrorKey('');
                    if (authError) setAuthError('');
                  }}
                  iconName="mail-outline"
                  keyboardType="email-address"
                  error={identifierErrorKey ? t(identifierErrorKey as any) : ''}
                  accessibilityLabel="Email ID input"
                  containerStyle={{ marginBottom: 14 }}
                  onFocusStateChange={(focused) => { if (focused) setFocusedField('username'); }}
                />
                <AuthInput
                  placeholder={t('passwordPlaceholder')}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (passwordErrorKey) setPasswordErrorKey('');
                    if (authError) setAuthError('');
                  }}
                  iconName="lock-closed-outline"
                  isPassword
                  error={passwordErrorKey ? t(passwordErrorKey as any) : ''}
                  accessibilityLabel="Password input"
                  containerStyle={{ marginBottom: 10 }}
                  onFocusStateChange={(focused) => { if (focused) setFocusedField('password'); }}
                />
              </Animated.View>

              {/* Forgot Password Link */}
              <Animated.View style={[styles.forgotRow, { transform: [{ scale: forgotPassScale }] }]}>
                <TouchableOpacity
                  onPress={() => router.push('/forgot-password')}
                  onPressIn={() => Animated.timing(forgotPassScale, { toValue: 0.96, duration: 65, useNativeDriver: false }).start()}
                  onPressOut={() => Animated.timing(forgotPassScale, { toValue: 1, duration: 65, useNativeDriver: false }).start()}
                  activeOpacity={0.7}
                >
                  <Text style={styles.forgotText}>{t('forgotPasswordLink')}</Text>
                </TouchableOpacity>
              </Animated.View>

              {authError ? (
                <Text style={{ color: '#EF4444', fontSize: 12, fontWeight: '600', textAlign: 'center', marginBottom: 10 }}>
                  {authError}
                </Text>
              ) : null}

              {/* Login Button */}
              <Animated.View style={[styles.btnWrapper, { opacity: btnFadeAnim }]}>
                <Animated.View style={{ transform: [{ scale: btnScaleAnim }] }}>
                  <TouchableOpacity
                    style={[styles.loginBtn, isAuthSuccess && styles.loginBtnSuccess]}
                    onPress={handleLogin}
                    onPressIn={() => { if (!isSubmitting && !isAuthSuccess) Animated.timing(btnScaleAnim, { toValue: 0.96, duration: 70, useNativeDriver: false }).start(); }}
                    onPressOut={() => Animated.timing(btnScaleAnim, { toValue: 1, duration: 70, useNativeDriver: false }).start()}
                    activeOpacity={0.88}
                    disabled={isSubmitting || isAuthSuccess}
                    accessibilityRole="button"
                    accessibilityLabel="Login to EasyBuy"
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : isAuthSuccess ? (
                      <Animated.View style={{ opacity: checkmarkFade, transform: [{ scale: checkmarkScale }] }}>
                        <Ionicons name="checkmark-sharp" size={24} color="#fff" />
                      </Animated.View>
                    ) : (
                      <Text style={styles.loginBtnText}>{t('loginButton')}</Text>
                    )}
                  </TouchableOpacity>
                </Animated.View>
              </Animated.View>

              {/* Sign Up Link */}
              <View style={styles.signUpRow}>
                <Text style={styles.signUpText}>{t('noAccountText')}{' '}</Text>
                <TouchableOpacity onPress={() => router.push('/register')} activeOpacity={0.7}>
                  <Text style={styles.signUpAccent}>{t('signUpLink')}</Text>
                </TouchableOpacity>
              </View>

              {/* Guest Login Fallback Option */}
              <TouchableOpacity
                style={styles.guestBtn}
                onPress={async () => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  await setGuestMode();
                  router.replace('/home' as any);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.guestBtnText}>Continue as Guest ⚡</Text>
              </TouchableOpacity>

              {/* Trust Badges — Fades away & collapses on keyboard open */}
              <Animated.View
                style={[
                  styles.badgesRow,
                  {
                    opacity: Animated.multiply(benefitsFadeAnim, badgesOp),
                    height: badgesHeight,
                    marginTop: badgesMarginTop,
                  },
                ]}
              >
                <BenefitItem iconName="shield-checkmark-outline" title={t('badge1Title')} subtitle={t('badge1Subtitle')} />
                <View style={styles.badgeDivider} />
                <BenefitItem iconName="bus-outline" title={t('badge2Title')} subtitle={t('badge2Subtitle')} />
                <View style={styles.badgeDivider} />
                <BenefitItem iconName="ribbon-outline" title={t('badge3Title')} subtitle={t('badge3Subtitle')} />
              </Animated.View>
            </Animated.View>

          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F2EB',
  },
  ambientGlow: {
    position: 'absolute',
    top: -70,
    left: -70,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(45, 107, 66, 0.20)',
    zIndex: 0,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  bgLayer: {
    position: 'relative',
    width: '100%',
  },
  heroSection: {
    paddingTop: 4,
    paddingHorizontal: 22,
    alignItems: 'center',
  },
  topBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 4,
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#fff',
    padding: 7,
    shadowColor: '#2D6B42',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: { width: '100%', height: '100%' },
  brandTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.6,
  },
  brandTitleAccent: { color: '#2D6B42' },
  tagline: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A6741',
    marginTop: 1,
  },
  heroWrapper: {
    width: width * 0.78,
    height: NORMAL_HERO_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
    overflow: 'hidden',
  },
  heroImage: { width: '100%', height: '100%' },

  // TRUE FLOATING CARD WITH 32px ROUNDED CORNERS ON ALL 4 CORNERS
  card: {
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: isSmallScreen ? 2 : 8,
    paddingHorizontal: 22,
    paddingTop: isSmallScreen ? 14 : 20,
    paddingBottom: isSmallScreen ? 14 : 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 28,
    elevation: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    overflow: 'hidden',
  },
  cardHeader: { marginBottom: isSmallScreen ? 10 : 16 },
  welcomeHeading: {
    fontSize: isSmallScreen ? 20 : 22,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 2,
  },
  welcomeSub: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  forgotRow: { alignItems: 'flex-end', marginBottom: isSmallScreen ? 12 : 18 },
  forgotText: { fontSize: 13, fontWeight: '600', color: '#2D6B42' },
  btnWrapper: { width: '100%', marginBottom: isSmallScreen ? 10 : 16 },
  loginBtn: {
    backgroundColor: '#2D6B42',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2D6B42',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.38,
    shadowRadius: 12,
    elevation: 8,
  },
  loginBtnSuccess: { backgroundColor: '#1E5230' },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
  signUpRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  signUpText: { fontSize: 13, color: '#64748B' },
  signUpAccent: { fontSize: 13, fontWeight: '700', color: '#2D6B42' },
  guestBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#E8F3EB',
    alignSelf: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#D8EADF',
  },
  guestBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E513B',
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(45, 107, 66, 0.06)',
    borderRadius: 14,
    paddingHorizontal: 8,
    overflow: 'hidden',
  },
  badgeDivider: { width: 1, height: 18, backgroundColor: 'rgba(45, 107, 66, 0.15)' },
});
