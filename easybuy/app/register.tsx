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

import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { executePostLoginFlow } from '../services/locationPermissionService';

const { width } = Dimensions.get('window');
const NORMAL_HERO_HEIGHT = width * 0.44;
const APPLE_EASING = Easing.bezier(0.16, 1, 0.3, 1);

export default function RegisterScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [focusedField, setFocusedField] = useState<'name' | 'email' | 'password' | null>(null);
  const [blurVal, setBlurVal] = useState(0);

  const [nameErrorKey, setNameErrorKey] = useState('');
  const [emailErrorKey, setEmailErrorKey] = useState('');
  const [passwordErrorKey, setPasswordErrorKey] = useState('');
  const [customError, setCustomError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Animated values
  const heroFloatAnim     = useRef(new Animated.Value(0)).current;
  const sparklePulseAnim  = useRef(new Animated.Value(0.5)).current;
  const keyboardAnim      = useRef(new Animated.Value(0)).current;
  const blurIntensityAnim = useRef(new Animated.Value(0)).current;

  const btnScaleAnim = useRef(new Animated.Value(1)).current;

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

  useEffect(() => {
    // Hero float loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(heroFloatAnim, { toValue: -6, duration: 2800, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
        Animated.timing(heroFloatAnim, { toValue: 0, duration: 2800, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
      ])
    ).start();

    // Pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(sparklePulseAnim, { toValue: 1.0, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
        Animated.timing(sparklePulseAnim, { toValue: 0.5, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
      ])
    ).start();

    // Keyboard listeners
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = Keyboard.addListener(showEvent, () => {
      Animated.parallel([
        Animated.timing(keyboardAnim, { toValue: 1, duration: 350, easing: APPLE_EASING, useNativeDriver: false }),
        Animated.timing(blurIntensityAnim, { toValue: 32, duration: 350, easing: APPLE_EASING, useNativeDriver: false }),
      ]).start();
    });

    const onHide = Keyboard.addListener(hideEvent, () => {
      setFocusedField(null);
      Animated.parallel([
        Animated.timing(keyboardAnim, { toValue: 0, duration: 300, easing: APPLE_EASING, useNativeDriver: false }),
        Animated.timing(blurIntensityAnim, { toValue: 0, duration: 300, easing: APPLE_EASING, useNativeDriver: false }),
      ]).start();
    });

    return () => { onShow.remove(); onHide.remove(); };
  }, []);

  // Focus Driver
  useEffect(() => {
    const isFocused = focusedField !== null;
    Animated.parallel([
      Animated.timing(blurIntensityAnim, {
        toValue: isFocused ? 32 : 0,
        duration: 350,
        easing: APPLE_EASING,
        useNativeDriver: false,
      }),
      Animated.timing(keyboardAnim, {
        toValue: isFocused ? 1 : 0,
        duration: 350,
        easing: APPLE_EASING,
        useNativeDriver: false,
      }),
    ]).start();
  }, [focusedField]);

  const validate = () => {
    let isValid = true;
    setCustomError('');

    const cleanName = name.trim();
    if (!cleanName) {
      setNameErrorKey('fullNameRequired');
      isValid = false;
    } else {
      setNameErrorKey('');
    }

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setEmailErrorKey('emailRequired');
      isValid = false;
    } else if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setEmailErrorKey('validEmailRequired');
      isValid = false;
    } else {
      setEmailErrorKey('');
    }

    if (!password) {
      setPasswordErrorKey('passwordRequired');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordErrorKey('passwordMinLength');
      isValid = false;
    } else {
      setPasswordErrorKey('');
    }

    return isValid;
  };

  const handleRegister = async () => {
    if (isSubmitting) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    if (validate()) {
      setIsSubmitting(true);
      setCustomError('');
      try {
        const cleanEmail = email.trim().toLowerCase();

        // 1. Check for duplicate email in Firestore users collection
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', cleanEmail));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          setCustomError('This email address is already registered in Firestore. Please log in.');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
          setIsSubmitting(false);
          return;
        }

        // 2. Create user with Firebase Auth
        let uid = 'user_' + Date.now();
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
          uid = userCredential.user.uid;
        } catch (authErr: any) {
          console.log('Firebase auth register notice:', authErr);
        }

        // 3. Save user profile to Firestore 'users' collection (fullName, email, password, createdAt)
        await setDoc(doc(db, 'users', uid), {
          uid: uid,
          fullName: name.trim(),
          email: cleanEmail,
          password: password,
          createdAt: new Date().toISOString(),
        });

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        executePostLoginFlow().catch((e) => console.log('Post login flow error:', e));
        router.replace('/home' as any);
      } catch (error: any) {
        console.warn('Firebase Registration Error:', error.code, error.message);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        if (error.code === 'auth/email-already-in-use') {
          setCustomError('This email is already registered. Try logging in!');
        } else if (error.code === 'auth/invalid-email') {
          setEmailErrorKey('validEmailRequired');
        } else {
          setCustomError(error.message || 'Registration failed.');
        }
      } finally {
        setIsSubmitting(false);
      }
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    }
  };

  // Real-Time Password Strength Checker Algorithm
  const getPasswordStrength = () => {
    if (!password) return { level: 0, label: '', color: '#E2E8F0' };

    let score = 0;

    // 1. Length evaluation
    if (password.length >= 6) score += 1;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;

    // 2. Character diversity evaluation
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1; // Mixed case
    if (/[0-9]/.test(password)) score += 1; // Numbers
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1; // Special symbols

    // 4-Tier Strength Level Calculation
    if (score >= 5) {
      return { level: 4, label: t('perfectText' as any) || 'Perfect ✨', color: '#2D6B42' };
    }
    if (score >= 4) {
      return { level: 3, label: t('strongText' as any) || 'Strong', color: '#10B981' };
    }
    if (score >= 3) {
      return { level: 2, label: t('mediumText' as any) || 'Medium', color: '#F59E0B' };
    }
    return { level: 1, label: t('weakText' as any) || 'Weak', color: '#EF4444' };
  };

  const strength = getPasswordStrength();

  // Interpolations
  const heroTranslateY = keyboardAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -NORMAL_HERO_HEIGHT * 0.45] });
  const heroScale      = keyboardAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.45] });
  const heroOpacity    = keyboardAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0.3, 0] });
  const bgDimOp        = keyboardAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.90] });
  const cardTransY     = keyboardAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -NORMAL_HERO_HEIGHT * 0.65] });
  const badgesOp       = keyboardAnim.interpolate({ inputRange: [0, 0.3, 1], outputRange: [1, 0, 0] });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Ambient Glow */}
      <Animated.View
        pointerEvents="none"
        style={[styles.ambientGlow, { opacity: sparklePulseAnim }]}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          {/* BACKGROUND LAYER */}
          <View style={styles.bgLayer}>
            {/* Header: Back Button, Logo Badge & Language Selector */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => router.back()}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Go back"
              >
                <Ionicons name="arrow-back" size={20} color="#2D6B42" />
              </TouchableOpacity>

              <View style={styles.logoBadge}>
                <Image source={require('../assets/images/easybuy_logo.png')} style={styles.logoImage} resizeMode="contain" />
              </View>

              <LanguageSelector />
            </View>

            {/* Title Section */}
            <View style={styles.titleContainer}>
              <Text style={styles.title}>
                Create <Text style={styles.titleHighlight}>Account</Text> 
              </Text>
              <Text style={styles.subtitle}>
                {t('createAccountSubtitle')}
              </Text>
            </View>

            {/* 3D Hero Shopping Illustration */}
            <Animated.View
              style={[
                styles.heroWrapper,
                {
                  opacity: heroOpacity,
                  transform: [
                    { translateY: heroFloatAnim },
                    { translateY: heroTranslateY },
                    { scale: heroScale },
                  ],
                },
              ]}
            >
              <Image source={require('../assets/images/onboarding_hero.png')} style={styles.heroImage} resizeMode="contain" />
            </Animated.View>

            {/* Gaussian Blur Overlay */}
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

            {/* Soft Translucent Glass Overlay */}
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

          {/* FOREGROUND FLOATING CARD */}
          <Animated.View
            style={[
              styles.card,
              { transform: [{ translateY: cardTransY }] },
            ]}
          >
            {/* Full Name Input */}
            <AuthInput
              placeholder={t('fullNamePlaceholder')}
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (nameErrorKey) setNameErrorKey('');
              }}
              iconName="person-outline"
              autoCapitalize="words"
              error={nameErrorKey ? t(nameErrorKey as any) : ''}
              accessibilityLabel="Full name input"
              containerStyle={{ marginBottom: 14 }}
              onFocusStateChange={(focused) => setFocusedField(focused ? 'name' : null)}
            />

            {/* Email or Phone Number Input */}
            <AuthInput
              placeholder={t('emailPhonePlaceholder')}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailErrorKey) setEmailErrorKey('');
              }}
              iconName="mail-outline"
              keyboardType="email-address"
              error={emailErrorKey ? t(emailErrorKey as any) : ''}
              accessibilityLabel="Email ID input"
              containerStyle={{ marginBottom: 14 }}
              onFocusStateChange={(focused) => setFocusedField(focused ? 'email' : null)}
            />

            {/* Password Input */}
            <AuthInput
              placeholder={t('passwordRegisterPlaceholder')}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (passwordErrorKey) setPasswordErrorKey('');
              }}
              iconName="lock-closed-outline"
              isPassword
              error={passwordErrorKey ? t(passwordErrorKey as any) : ''}
              accessibilityLabel="Password input"
              containerStyle={{ marginBottom: 10 }}
              onFocusStateChange={(focused) => setFocusedField(focused ? 'password' : null)}
            />

            {/* Password Strength Indicator Bar */}
            {password.length > 0 && (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthRow}>
                  <View style={styles.strengthBarsRow}>
                    {[1, 2, 3, 4].map((index) => (
                      <View
                        key={index}
                        style={[
                          styles.strengthBarSegment,
                          {
                            backgroundColor:
                              index <= strength.level ? strength.color : '#E2E8F0',
                          },
                        ]}
                      />
                    ))}
                  </View>
                  <Text style={[styles.strengthLabel, { color: strength.color }]}>
                    {strength.label}
                  </Text>
                </View>
                <View style={styles.strengthNoticeRow}>
                  <Ionicons name="shield-checkmark-outline" size={14} color="#4A6741" style={{ marginRight: 6 }} />
                  <Text style={styles.strengthNoticeText}>
                    {t('passwordStrengthNotice' as any) || 'Use 8+ characters with a mix of letters, numbers & symbols.'}
                  </Text>
                </View>
              </View>
            )}

            {customError ? (
              <Text style={{ color: '#EF4444', fontSize: 12, fontWeight: '600', textAlign: 'center', marginBottom: 8 }}>
                {customError}
              </Text>
            ) : null}

            {/* Sign Up CTA Button */}
            <Animated.View style={{ transform: [{ scale: btnScaleAnim }], marginTop: 12, marginBottom: 16 }}>
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleRegister}
                onPressIn={() => { if (!isSubmitting) Animated.timing(btnScaleAnim, { toValue: 0.96, duration: 70, useNativeDriver: false }).start(); }}
                onPressOut={() => Animated.timing(btnScaleAnim, { toValue: 1, duration: 70, useNativeDriver: false }).start()}
                activeOpacity={0.88}
                disabled={isSubmitting}
                accessibilityRole="button"
                accessibilityLabel="Sign up for EasyBuy"
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.submitBtnText}>{t('signUpButton')}</Text>
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* Terms of Service & Privacy Policy Checkbox Row */}
            <TouchableOpacity
              style={styles.termsRow}
              onPress={() => setAgreeTerms(!agreeTerms)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, agreeTerms && styles.checkboxActive]}>
                {agreeTerms && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
              </View>
              <Text style={styles.termsText}>
                {t('termsNotice' as any) || "I agree to EasyBuy's Terms of Service & Privacy Policy"}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* FOOTER SECTION */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>{t('alreadyAccountText')}{' '}</Text>
            <TouchableOpacity onPress={() => router.push('/login')} activeOpacity={0.7}>
              <Text style={styles.footerLink}>{t('loginLink')} →</Text>
            </TouchableOpacity>
          </View>

          {/* Trust Badges Bar */}
          <Animated.View style={[styles.badgesRow, { opacity: badgesOp }]}>
            <BenefitItem iconName="shield-checkmark-outline" title={t('badge1Title')} subtitle={t('badge1Subtitle')} />
            <View style={styles.badgeDivider} />
            <BenefitItem iconName="bus-outline" title={t('badge2Title')} subtitle={t('badge2Subtitle')} />
            <View style={styles.badgeDivider} />
            <BenefitItem iconName="ribbon-outline" title={t('badge3Title')} subtitle={t('badge3Subtitle')} />
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  header: {
    paddingTop: 8,
    paddingHorizontal: 20,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2D6B42',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    padding: 7,
    shadowColor: '#2D6B42',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: { width: '100%', height: '100%' },

  titleContainer: {
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: -0.4,
  },
  titleHighlight: {
    color: '#2D6B42',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },

  heroWrapper: {
    width: width * 0.78,
    height: NORMAL_HERO_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 4,
    overflow: 'hidden',
  },
  heroImage: { width: '100%', height: '100%' },

  // Floating Full-Rounded White Card
  card: {
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 8,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.13,
    shadowRadius: 28,
    elevation: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.85)',
  },

  // Password Strength Bar
  strengthContainer: {
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  strengthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  strengthBarsRow: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 12,
  },
  strengthBarSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    marginRight: 6,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  strengthNoticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  strengthNoticeText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
  },

  submitBtn: {
    backgroundColor: '#2D6B42',
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2D6B42',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.38,
    shadowRadius: 12,
    elevation: 8,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#2D6B42',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    backgroundColor: '#FFFFFF',
  },
  checkboxActive: {
    backgroundColor: '#2D6B42',
  },
  termsText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    flex: 1,
  },

  // Footer Section
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 16,
  },
  footerText: {
    fontSize: 13,
    color: '#64748B',
  },
  footerLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2D6B42',
  },

  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(45, 107, 66, 0.06)',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginHorizontal: 16,
  },
  badgeDivider: { width: 1, height: 18, backgroundColor: 'rgba(45, 107, 66, 0.15)' },
});
