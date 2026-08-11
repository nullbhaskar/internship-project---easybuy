import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const WHEEL_SIZE = width * 0.72;

export interface SpinReward {
  id: string;
  label: string;
  sub: string;
  emoji: string;
  code: string;
  color: string;
}

const REWARDS: SpinReward[] = [
  { id: '1', label: '₹100 OFF', sub: 'On orders above ₹499', emoji: '🎁', code: 'SPIN100', color: '#EF4444' },
  { id: '2', label: '50 Coins', sub: 'Added to EasyWallet', emoji: '🪙', code: 'COINS50', color: '#F59E0B' },
  { id: '3', label: 'Free Delivery', sub: 'On your next 3 orders', emoji: '🚚', code: 'FREEDEL', color: '#10B981' },
  { id: '4', label: 'Free Snack', sub: 'Complimentary Kurkure', emoji: '🍿', code: 'FREESNACK', color: '#3B82F6' },
  { id: '5', label: '20% Cashback', sub: 'Instant wallet credit', emoji: '⚡', code: 'CASH20', color: '#8B5CF6' },
  { id: '6', label: 'Jackpot ₹500', sub: 'Mega Shopping Pass', emoji: '🌟', code: 'JACKPOT500', color: '#EC4899' },
];

export const SpinWinModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  isDarkMode?: boolean;
}> = ({ visible, onClose, isDarkMode }) => {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const [isSpinning, setIsSpinning] = useState(false);
  const [wonReward, setWonReward] = useState<SpinReward | null>(null);
  const [hasSpunToday, setHasSpunToday] = useState(false);

  const spinWheel = () => {
    if (isSpinning) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setIsSpinning(true);
    setWonReward(null);

    // Pick random reward index (0..5)
    const randomIndex = Math.floor(Math.random() * REWARDS.length);
    const targetReward = REWARDS[randomIndex];

    // Compute rotation angle: 5 full spins (1800 deg) + segment alignment
    const segmentAngle = 360 / REWARDS.length;
    const targetAngle = 1800 + (REWARDS.length - 1 - randomIndex) * segmentAngle + segmentAngle / 2;

    spinAnim.setValue(0);

    // Haptic tick timer during spin
    const tickInterval = setInterval(() => {
      Haptics.selectionAsync().catch(() => {});
    }, 180);

    Animated.timing(spinAnim, {
      toValue: targetAngle,
      duration: 3400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start(() => {
      clearInterval(tickInterval);
      setIsSpinning(false);
      setWonReward(targetReward);
      setHasSpunToday(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    });
  };

  const interpolatedSpin = spinAnim.interpolate({
    inputRange: [0, 3600],
    outputRange: ['0deg', '3600deg'],
  });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.modalCard, isDarkMode && styles.modalCardDark]}>

          {/* Close Button */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
            <Ionicons name="close" size={22} color={isDarkMode ? '#F8FAFC' : '#0F172A'} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.badge}>🎡 DAILY MYSTERY REWARD</Text>
            <Text style={[styles.title, isDarkMode && { color: '#F8FAFC' }]}>Spin & Win ⚡</Text>
            <Text style={[styles.sub, isDarkMode && { color: '#94A3B8' }]}>
              Spin the wheel to win instant coupons, cashback & coins!
            </Text>
          </View>

          {/* Wheel Container */}
          <View style={styles.wheelContainer}>
            {/* Top Pointer Arrow */}
            <View style={styles.pointerArrow} />

            {/* Rotating Wheel */}
            <Animated.View
              style={[
                styles.wheel,
                { transform: [{ rotate: interpolatedSpin }] },
              ]}
            >
              {REWARDS.map((item, idx) => {
                const angle = (360 / REWARDS.length) * idx;
                return (
                  <View
                    key={item.id}
                    style={[
                      styles.slice,
                      {
                        backgroundColor: item.color,
                        transform: [
                          { rotate: `${angle}deg` },
                          { translateY: -WHEEL_SIZE / 4 },
                        ],
                      },
                    ]}
                  >
                    <Text style={styles.sliceEmoji}>{item.emoji}</Text>
                    <Text style={styles.sliceLabel}>{item.label}</Text>
                  </View>
                );
              })}
            </Animated.View>

            {/* Center Spin Button */}
            <TouchableOpacity
              style={[styles.centerBtn, isSpinning && { opacity: 0.7 }]}
              onPress={spinWheel}
              disabled={isSpinning}
              activeOpacity={0.85}
            >
              <Text style={styles.centerBtnTxt}>{isSpinning ? '...' : 'SPIN'}</Text>
            </TouchableOpacity>
          </View>

          {/* Reward Winner Card */}
          {wonReward && (
            <View style={styles.rewardCard}>
              <Text style={styles.rewardEmoji}>🎉 {wonReward.emoji}</Text>
              <Text style={styles.rewardTitle}>YOU WON {wonReward.label}!</Text>
              <Text style={styles.rewardSub}>{wonReward.sub}</Text>

              <View style={styles.couponPill}>
                <Text style={styles.couponCode}>{wonReward.code}</Text>
              </View>

              <TouchableOpacity style={styles.claimBtn} onPress={onClose} activeOpacity={0.88}>
                <Text style={styles.claimBtnTxt}>Claim & Shop Now 🛍️</Text>
              </TouchableOpacity>
            </View>
          )}

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    position: 'relative',
  },
  modalCardDark: {
    backgroundColor: '#1E293B',
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  badge: {
    fontSize: 10,
    fontWeight: '900',
    color: '#D97706',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 4,
  },
  sub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '600',
  },

  // WHEEL
  wheelContainer: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 12,
  },
  pointerArrow: {
    position: 'absolute',
    top: -12,
    zIndex: 20,
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderTopWidth: 20,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#0F172A',
  },
  wheel: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    borderRadius: WHEEL_SIZE / 2,
    backgroundColor: '#0F172A',
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 4,
    borderColor: '#0F172A',
  },
  slice: {
    position: 'absolute',
    width: WHEEL_SIZE / 2,
    height: WHEEL_SIZE / 2,
    top: WHEEL_SIZE / 4,
    left: WHEEL_SIZE / 4,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 12,
    borderRadius: 8,
  },
  sliceEmoji: {
    fontSize: 18,
    marginBottom: 2,
  },
  sliceLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    textAlign: 'center',
  },
  centerBtn: {
    position: 'absolute',
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFFFFF',
    borderWidth: 4,
    borderColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  centerBtnTxt: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0F172A',
  },

  // WINNER CARD
  rewardCard: {
    width: '100%',
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  rewardEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  rewardTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#065F46',
    marginBottom: 2,
  },
  rewardSub: {
    fontSize: 11,
    color: '#047857',
    fontWeight: '600',
    marginBottom: 10,
  },
  couponPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#10B981',
    borderStyle: 'dashed',
    marginBottom: 12,
  },
  couponCode: {
    fontSize: 14,
    fontWeight: '900',
    color: '#059669',
    letterSpacing: 1,
  },
  claimBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  claimBtnTxt: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
});
