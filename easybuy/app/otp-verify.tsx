import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Keyboard,
  Animated,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { executePostLoginFlow } from '../services/locationPermissionService';
import { sendOtpEmail } from '../services/emailService';

const RESEND_COOLDOWN = 60;

export default function OtpVerifyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    email: string;
    name: string;
    password: string;
    expectedOtp: string;
  }>();
  
  const { setAuthenticatedUser } = useAuth();

  const [expectedOtp, setExpectedOtp] = useState(params.expectedOtp);
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const [resendAvailable, setResendAvailable] = useState(false);
  const [success, setSuccess] = useState(false);

  const inputRefs = useRef<Array<TextInput | null>>([null, null, null, null, null, null]);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          setResendAvailable(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleDigitChange = (value: string, index: number) => {
    const cleaned = value.replace(/\D/g, '').slice(-1);
    const updated = [...digits];
    updated[index] = cleaned;
    setDigits(updated);
    setError('');

    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    // Auto-submit when all filled
    if (cleaned && index === 5) {
      const code = [...updated.slice(0, 5), cleaned].join('');
      if (code.length === 6) {
        Keyboard.dismiss();
        submitOtp(code);
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const submitOtp = async (codeOverride?: string) => {
    const code = codeOverride || digits.join('');
    if (code.length !== 6) {
      setError('Please enter all 6 digits.');
      return;
    }
    if (isVerifying) return;
    setIsVerifying(true);
    setError('');
    
    try {
      if (code !== expectedOtp) {
        throw new Error('Incorrect code. Please try again.');
      }

      // OTP verified — now create the Firebase Auth account + Firestore user doc
      // Fix: Generate a STABLE uid using the email so their cart data survives logouts!
      const stableUidFallback = 'user_' + params.email!.toLowerCase().replace(/[^a-z0-9]/g, '');
      let uid = stableUidFallback;
      
      try {
        const cred = await createUserWithEmailAndPassword(auth, params.email!, params.password!);
        uid = cred.user.uid;
      } catch (authErr: any) {
        // If already exists (e.g. retry), get the uid from existing session or fallback to the stable one
        if (authErr.code !== 'auth/email-already-in-use') throw authErr;
        uid = auth.currentUser?.uid || stableUidFallback;
      }

      await setDoc(doc(db, 'users', uid), {
        uid,
        fullName: params.name?.trim() || '',
        email: params.email?.toLowerCase(),
        createdAt: new Date().toISOString(),
      });

      await setAuthenticatedUser({
        uid,
        email: params.email!.toLowerCase(),
        fullName: params.name?.trim() || '',
      });

      setSuccess(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      executePostLoginFlow().catch(() => {});

      // Replace so Back can never return here
      router.replace('/home' as any);
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      shake();
      setError(err?.message || 'Verification failed. Please try again.');
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!resendAvailable || isResending) return;
    setIsResending(true);
    setError('');
    
    try {
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      await sendOtpEmail(params.email!, params.name!, newOtp);
      
      setExpectedOtp(newOtp);
      setCooldown(RESEND_COOLDOWN);
      setResendAvailable(false);
      
      // restart countdown
      const interval = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) { setResendAvailable(true); clearInterval(interval); return 0; }
          return prev - 1;
        });
      }, 1000);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch (err: any) {
      setError(err?.message || 'Could not resend. Try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
        <Ionicons name="arrow-back" size={20} color="#2D6B42" />
      </TouchableOpacity>

      <View style={styles.center}>
        <Image
          source={require('../assets/images/easybuy_logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>Check your email</Text>
        <Text style={styles.subtitle}>
          We sent a 6-digit code to{'\n'}
          <Text style={styles.emailHighlight}>{params.email}</Text>
        </Text>

        <Animated.View style={[styles.boxesRow, { transform: [{ translateX: shakeAnim }] }]}>
          {digits.map((d, i) => (
            <TextInput
              key={i}
              ref={(ref) => { inputRefs.current[i] = ref; }}
              style={[styles.digitBox, d ? styles.digitBoxFilled : null, error ? styles.digitBoxError : null]}
              value={d}
              onChangeText={(v) => handleDigitChange(v, i)}
              onKeyPress={(e) => handleKeyPress(e, i)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              textContentType="oneTimeCode"
              autoComplete="sms-otp"
            />
          ))}
        </Animated.View>

        {!!error && (
          <View style={styles.errorRow}>
            <Ionicons name="alert-circle-outline" size={14} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.verifyBtn, isVerifying && styles.verifyBtnDisabled]}
          onPress={() => submitOtp()}
          activeOpacity={0.85}
          disabled={isVerifying}
        >
          {isVerifying ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.verifyBtnText}>Verify</Text>
          )}
        </TouchableOpacity>

        <View style={styles.resendRow}>
          {resendAvailable ? (
            <TouchableOpacity onPress={handleResend} disabled={isResending} activeOpacity={0.7}>
              {isResending ? (
                <ActivityIndicator size="small" color="#7C3AED" />
              ) : (
                <Text style={styles.resendLink}>Resend code</Text>
              )}
            </TouchableOpacity>
          ) : (
            <Text style={styles.cooldownText}>Resend in <Text style={{ fontWeight: '700' }}>{cooldown}s</Text></Text>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  backBtn: {
    position: 'absolute',
    top: 56,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  emailHighlight: {
    color: '#7C3AED',
    fontWeight: '700',
  },
  boxesRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  digitBox: {
    width: 46,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  digitBoxFilled: {
    borderColor: '#7C3AED',
    backgroundColor: '#F3E8FF',
  },
  digitBoxError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
  },
  verifyBtn: {
    width: '100%',
    height: 52,
    backgroundColor: '#7C3AED',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  verifyBtnDisabled: {
    opacity: 0.6,
  },
  verifyBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  resendRow: {
    marginTop: 20,
    alignItems: 'center',
  },
  resendLink: {
    color: '#7C3AED',
    fontWeight: '700',
    fontSize: 14,
  },
  cooldownText: {
    color: '#94A3B8',
    fontSize: 13,
  },
});
