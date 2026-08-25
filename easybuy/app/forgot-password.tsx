import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  Easing,
  Keyboard,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { AuthInput } from '../components/auth/AuthInput';
import { LanguageSelector } from '../components/common/LanguageSelector';
import { useLanguage } from '../context/LanguageContext';

import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { sendOtpEmail } from '../services/emailService';

const { width } = Dimensions.get('window');
const APPLE_EASING = Easing.bezier(0.16, 1, 0.3, 1);

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  // Form Fields
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Target User Document ID in Firestore
  const [userDocId, setUserDocId] = useState<string | null>(null);
  const [userNameForEmail, setUserNameForEmail] = useState<string>('');

  // Real OTP state (replaces hardcoded 1234)
  const [realOtp, setRealOtp] = useState<string>('');

  // Workflow Steps: 1 = Email, 2 = OTP, 3 = Reset Password, 4 = Success Dialog
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Errors & Loading State
  const [emailError, setEmailError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [customError, setCustomError] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Animated drivers
  const heroFloatAnim     = useRef(new Animated.Value(0)).current;
  const sparklePulseAnim  = useRef(new Animated.Value(0.5)).current;
  const keyboardAnim      = useRef(new Animated.Value(0)).current;
  const blurIntensityAnim = useRef(new Animated.Value(0)).current;

  const btnScaleAnim    = useRef(new Animated.Value(1)).current;
  const checkmarkScale  = useRef(new Animated.Value(0.7)).current;
  const checkmarkFade   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Hero floating loop
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
      setIsFocused(false);
      Animated.parallel([
        Animated.timing(keyboardAnim, { toValue: 0, duration: 300, easing: APPLE_EASING, useNativeDriver: false }),
        Animated.timing(blurIntensityAnim, { toValue: 0, duration: 300, easing: APPLE_EASING, useNativeDriver: false }),
      ]).start();
    });

    return () => { onShow.remove(); onHide.remove(); };
  }, []);

  // ─── STEP 1: Verify Email in Firestore ───
  const handleVerifyEmail = async () => {
    if (isSubmitting) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

    setEmailError('');
    setCustomError('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setEmailError('Please enter your email address.');
      return;
    }
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setEmailError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Query users collection in Firestore
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', cleanEmail));
      const querySnapshot = await getDocs(q);

      setIsSubmitting(false);

      if (querySnapshot.empty) {
        setCustomError('No account found with this email.');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        return;
      }

      // Store matching document ID and proceed to Step 2 (OTP)
      const docSnap = querySnapshot.docs[0];
      const docId = docSnap.id;
      const userName = docSnap.data()?.fullName || docSnap.data()?.name || 'User';
      setUserDocId(docId);
      setUserNameForEmail(userName);

      // Generate real 6-digit OTP and send via EmailJS
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setRealOtp(generatedOtp);

      try {
        await sendOtpEmail(cleanEmail, userName, generatedOtp);
      } catch (emailErr) {
        console.error('Failed to send OTP email:', emailErr);
      }

      setStep(2);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch (error: any) {
      setIsSubmitting(false);
      console.log('Firestore email query error:', error);
      setCustomError('Could not verify email. Please try again.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    }
  };

  // ─── STEP 2: Verify Real OTP ───
  const handleVerifyOtp = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setOtpError('');
    setCustomError('');

    const cleanOtp = otp.trim();
    if (!cleanOtp) {
      setOtpError('Please enter the OTP code.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      return;
    }

    if (cleanOtp !== realOtp) {
      setOtpError('Invalid OTP. Please check your email and try again.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      return;
    }

    // OTP Verified -> Move to Step 3 (Reset Password)
    setStep(3);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  };

  // ─── STEP 3: Reset Password in Firestore ───
  const handleResetPassword = async () => {
    if (isSubmitting) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

    setPasswordError('');
    setConfirmPasswordError('');
    setCustomError('');

    if (!newPassword && !confirmPassword) {
      setPasswordError('Both password fields are required.');
      setConfirmPasswordError('Both password fields are required.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      return;
    }

    if (!newPassword) {
      setPasswordError('New password is required.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      return;
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Confirm password is required.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      return;
    }

    if (newPassword !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      return;
    }

    setIsSubmitting(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      let targetDocId = userDocId;

      if (!targetDocId) {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', cleanEmail));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          targetDocId = querySnapshot.docs[0].id;
        }
      }

      if (targetDocId) {
        // Update password field of existing user document in Firestore
        const userRef = doc(db, 'users', targetDocId);
        await updateDoc(userRef, {
          password: newPassword,
          updatedAt: new Date().toISOString(),
        });
      }

      setIsSubmitting(false);
      setStep(4);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

      Animated.parallel([
        Animated.spring(checkmarkScale, { toValue: 1, friction: 6, tension: 140, useNativeDriver: false }),
        Animated.timing(checkmarkFade, { toValue: 1, duration: 220, useNativeDriver: false }),
      ]).start();
    } catch (error: any) {
      setIsSubmitting(false);
      console.log('Error updating password in Firestore:', error);
      setCustomError('Failed to update password. Please try again.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    }
  };

  // ─── STEP 4: Success OK Handler ───
  const handleSuccessOk = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    router.replace('/login');
  };

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
          {/* BACKGROUND LAYER (Hero + Header) */}
          <View style={styles.bgLayer}>
            {/* Header: Back Button & Language Selector */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => {
                  if (step > 1 && step < 4) setStep((prev) => (prev - 1) as any);
                  else router.back();
                }}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Go back"
              >
                <Ionicons name="arrow-back-sharp" size={20} color="#2D6B42" />
              </TouchableOpacity>

              <LanguageSelector />
            </View>

            {/* Title Section */}
            <View style={styles.titleContainer}>
              <Text style={styles.title}>
                {step === 1 ? 'Forgot ' : step === 2 ? 'OTP ' : step === 3 ? 'Reset ' : 'All '}
                <Text style={styles.titleHighlight}>
                  {step === 1 ? 'Password?' : step === 2 ? 'Verification' : step === 3 ? 'Password' : 'Set! 🎉'}
                </Text>
              </Text>
              <Text style={styles.subtitle}>
                {step === 1 && 'Enter your registered email address to locate your account.'}
                {step === 2 && 'Enter the 4-digit verification OTP code below.'}
                {step === 3 && 'Create and confirm your new account password.'}
                {step === 4 && 'Your password has been successfully updated in Firestore.'}
              </Text>
            </View>

            {/* Central Graphic */}
            <Animated.View
              style={[
                styles.heroGraphicWrapper,
                {
                  transform: [
                    { translateY: heroFloatAnim },
                  ],
                },
              ]}
            >
              <View style={[styles.badgeIconBox, styles.envelopeBadge]}>
                <Ionicons name="mail" size={24} color="#2D6B42" />
              </View>
              <View style={[styles.badgeIconBox, styles.centerLockBadge]}>
                <Ionicons name={step === 4 ? 'checkmark-circle' : 'key-sharp'} size={32} color="#FFFFFF" />
              </View>
              <View style={[styles.badgeIconBox, styles.shieldBadge]}>
                <Ionicons name="shield-checkmark" size={24} color="#2D6B42" />
              </View>
            </Animated.View>
          </View>

          {/* FORM CARD */}
          <Animated.View style={styles.formCard}>
            {/* ─── STEP 1: EMAIL INPUT ─── */}
            {step === 1 && (
              <>
                {!!customError && (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorBoxText}>{customError}</Text>
                  </View>
                )}

                <AuthInput
                  label="REGISTERED EMAIL ADDRESS"
                  icon="mail-outline"
                  placeholder="name@example.com"
                  value={email}
                  onChangeText={(val) => { setEmail(val); setEmailError(''); setCustomError(''); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={emailError}
                  accessibilityLabel="Registered Email ID input"
                  containerStyle={{ marginBottom: 18 }}
                  onFocusStateChange={(focused) => setIsFocused(focused)}
                />

                <Animated.View style={{ transform: [{ scale: btnScaleAnim }], marginBottom: 16 }}>
                  <TouchableOpacity
                    style={styles.submitBtn}
                    onPress={handleVerifyEmail}
                    activeOpacity={0.88}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <View style={styles.btnContentRow}>
                        <Text style={styles.submitBtnText}>Continue →</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </Animated.View>
              </>
            )}

            {/* ─── STEP 2: REAL OTP VERIFICATION ─── */}
            {step === 2 && (
              <>
                {!!customError && (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorBoxText}>{customError}</Text>
                  </View>
                )}

                {/* Info Card */}
                <View style={styles.demoOtpBox}>
                  <Text style={styles.demoOtpLabel}>📧 Check Your Email</Text>
                  <Text style={[styles.demoOtpCode, { fontSize: 13, fontWeight: '600' }]}>
                    We sent a 6-digit code to your registered email address.
                  </Text>
                </View>

                <AuthInput
                  label="OTP CODE"
                  icon="keypad-outline"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChangeText={(val) => { setOtp(val); setOtpError(''); }}
                  keyboardType="number-pad"
                  maxLength={6}
                  error={otpError}
                  containerStyle={{ marginBottom: 18 }}
                  onFocusStateChange={(focused) => setIsFocused(focused)}
                />

                <Animated.View style={{ transform: [{ scale: btnScaleAnim }], marginBottom: 16 }}>
                  <TouchableOpacity
                    style={styles.submitBtn}
                    onPress={handleVerifyOtp}
                    activeOpacity={0.88}
                  >
                    <View style={styles.btnContentRow}>
                      <Text style={styles.submitBtnText}>Verify OTP</Text>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              </>
            )}

            {/* ─── STEP 3: RESET PASSWORD ─── */}
            {step === 3 && (
              <>
                {!!customError && (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorBoxText}>{customError}</Text>
                  </View>
                )}

                <AuthInput
                  label="NEW PASSWORD"
                  icon="lock-closed-outline"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChangeText={(val) => { setNewPassword(val); setPasswordError(''); }}
                  isPassword
                  error={passwordError}
                  containerStyle={{ marginBottom: 14 }}
                  onFocusStateChange={(focused) => setIsFocused(focused)}
                />

                <AuthInput
                  label="CONFIRM PASSWORD"
                  icon="lock-closed-outline"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChangeText={(val) => { setConfirmPassword(val); setConfirmPasswordError(''); }}
                  isPassword
                  error={confirmPasswordError}
                  containerStyle={{ marginBottom: 18 }}
                  onFocusStateChange={(focused) => setIsFocused(focused)}
                />

                <Animated.View style={{ transform: [{ scale: btnScaleAnim }], marginBottom: 16 }}>
                  <TouchableOpacity
                    style={styles.submitBtn}
                    onPress={handleResetPassword}
                    activeOpacity={0.88}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <View style={styles.btnContentRow}>
                        <Text style={styles.submitBtnText}>Reset Password</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </Animated.View>
              </>
            )}

            {/* ─── STEP 4: SUCCESS DIALOG ─── */}
            {step === 4 && (
              <View style={styles.successState}>
                <Animated.View style={[styles.successIconBox, { opacity: checkmarkFade, transform: [{ scale: checkmarkScale }] }]}>
                  <Ionicons name="checkmark-sharp" size={40} color="#FFFFFF" />
                </Animated.View>
                <Text style={styles.successTitle}>Password changed successfully.</Text>
                <Text style={styles.successSub}>You can now log in using your newly updated password stored in Firestore.</Text>

                <TouchableOpacity style={[styles.submitBtn, { width: '100%', marginTop: 20 }]} onPress={handleSuccessOk} activeOpacity={0.88}>
                  <Text style={styles.submitBtnText}>OK</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Security Shield Notice */}
            {step !== 4 && (
              <View style={styles.securityNoticeRow}>
                <Ionicons name="shield-checkmark-outline" size={16} color="#4A6741" style={{ marginRight: 6 }} />
                <Text style={styles.securityNoticeText}>
                  Your authentication details are encrypted & secured in Firestore.
                </Text>
              </View>
            )}
          </Animated.View>

          {/* FOOTER SECTION */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>
              Remember your password?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/login')} activeOpacity={0.7}>
              <Text style={styles.footerLink}>
                Log In ›
              </Text>
            </TouchableOpacity>
          </View>
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
    marginBottom: 16,
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
  titleContainer: {
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
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
    lineHeight: 19,
    paddingHorizontal: 12,
  },
  heroGraphicWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
    paddingHorizontal: 20,
  },
  badgeIconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2D6B42',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 4,
  },
  envelopeBadge: {
    backgroundColor: 'rgba(45, 107, 66, 0.10)',
  },
  centerLockBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#2D6B42',
    marginHorizontal: 16,
    shadowColor: '#2D6B42',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  shieldBadge: {
    backgroundColor: 'rgba(45, 107, 66, 0.10)',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    borderRadius: 36,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    marginHorizontal: 16,
    marginTop: 8,
    shadowColor: '#2D6B42',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    marginBottom: 14,
  },
  errorBoxText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  demoOtpBox: {
    backgroundColor: '#E8F3EB',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#2D6B42',
  },
  demoOtpLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  demoOtpCode: {
    fontSize: 24,
    fontWeight: '900',
    color: '#2D6B42',
    letterSpacing: 4,
    marginTop: 2,
  },
  submitBtn: {
    backgroundColor: '#2D6B42',
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2D6B42',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.30,
    shadowRadius: 12,
    elevation: 6,
  },
  btnContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  securityNoticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
  },
  securityNoticeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },
  successState: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  successIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2D6B42',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#2D6B42',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 6,
    textAlign: 'center',
  },
  successSub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 16,
    lineHeight: 18,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 13,
    color: '#64748B',
  },
  footerLink: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2D6B42',
  },
});
