import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface WalletModalProps {
  visible: boolean;
  onClose: () => void;
  isDarkMode?: boolean;
}

const COUPONS = [
  {
    code: 'EASYBUY50',
    title: '50% OFF up to ₹150',
    desc: 'Valid on orders above ₹299. Applies to all items.',
    expiry: 'Expires in 3 days',
    bg: '#FEF3C7',
    textColor: '#92400E',
  },
  {
    code: 'QUICK20',
    title: '₹20 Instant Cashback',
    desc: 'Valid on QuickBuy 10-Min grocery drops.',
    expiry: 'Expires tomorrow',
    bg: '#DCFCE7',
    textColor: '#166534',
  },
  {
    code: 'VIPFREESHIP',
    title: 'Free 10-Min Delivery',
    desc: 'Zero delivery fee on all orders above ₹149.',
    expiry: 'VIP Member Perk',
    bg: '#F3E8FF',
    textColor: '#6B21A8',
  },
];

const POINT_REWARDS = [
  { id: 'p1', title: '₹50 EasyBuy Voucher', points: 500, emoji: '🎟️' },
  { id: 'p2', title: '₹100 EasyBuy Voucher', points: 950, emoji: '🎁' },
  { id: 'p3', title: '1-Month Free Delivery Pass', points: 1200, emoji: '⚡' },
];

export const WalletModal: React.FC<WalletModalProps> = ({
  visible,
  onClose,
  isDarkMode = false,
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [points, setPoints] = useState(1250);
  const [balance, setBalance] = useState(450.0);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const copyCoupon = (code: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setCopiedCode(code);
    setToastMsg(`Copied coupon code: ${code}`);
    setTimeout(() => {
      setCopiedCode(null);
      setToastMsg(null);
    }, 3000);
  };

  const redeemReward = (reward: typeof POINT_REWARDS[0]) => {
    if (points < reward.points) {
      setToastMsg('Not enough EasyPoints for this reward!');
      setTimeout(() => setToastMsg(null), 3000);
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setPoints((prev) => prev - reward.points);
    setToastMsg(`🎉 Successfully redeemed: ${reward.title}!`);
    setTimeout(() => setToastMsg(null), 3500);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalCard, isDarkMode && styles.modalCardDark]}>
          {/* Header Bar */}
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderLeft}>
              <View style={styles.modalHeaderIconBg}>
                <Ionicons name="wallet" size={20} color="#2563EB" />
              </View>
              <View>
                <Text style={[styles.modalTitle, isDarkMode && { color: '#F8FAFC' }]}>
                  EasyWallet & Coupons
                </Text>
                <Text style={[styles.modalSub, isDarkMode && { color: '#94A3B8' }]}>
                  Cash balance, coupons & reward points
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={20} color={isDarkMode ? '#94A3B8' : '#64748B'} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* 1. Wallet Balance Hero Card */}
            <View style={styles.balanceCard}>
              <View style={styles.balanceTopRow}>
                <View>
                  <Text style={styles.balanceLabel}>Total Wallet Balance</Text>
                  <Text style={styles.balanceAmount}>₹{balance.toFixed(2)}</Text>
                </View>
                <View style={styles.pointsBadge}>
                  <Text style={styles.pointsText}>🪙 {points} Points</Text>
                </View>
              </View>
              <View style={styles.balanceActionRow}>
                <TouchableOpacity
                  style={styles.addCashBtn}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                    setBalance((prev) => prev + 100);
                    setToastMsg('₹100 added to EasyWallet!');
                    setTimeout(() => setToastMsg(null), 3000);
                  }}
                >
                  <Ionicons name="add-circle" size={16} color="#FFFFFF" />
                  <Text style={styles.addCashBtnTxt}>+ Add Money</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.historyBtn}>
                  <Text style={styles.historyBtnTxt}>Transactions</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 2. Active Coupons & Vouchers Section */}
            <Text style={[styles.sectionTitle, isDarkMode && { color: '#F8FAFC' }]}>
              🎟️ Available Coupons & Vouchers
            </Text>
            {COUPONS.map((c) => (
              <View key={c.code} style={[styles.couponCard, { backgroundColor: c.bg }]}>
                <View style={styles.couponLeft}>
                  <Text style={[styles.couponTitle, { color: c.textColor }]}>{c.title}</Text>
                  <Text style={[styles.couponDesc, { color: c.textColor + 'CC' }]}>{c.desc}</Text>
                  <Text style={[styles.couponExpiry, { color: c.textColor + '99' }]}>{c.expiry}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.copyBtn, { backgroundColor: c.textColor }]}
                  onPress={() => copyCoupon(c.code)}
                >
                  <Text style={styles.copyBtnTxt}>
                    {copiedCode === c.code ? 'COPIED ✓' : c.code}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}

            {/* 3. EasyPoints Store Section */}
            <Text style={[styles.sectionTitle, { marginTop: 20 }, isDarkMode && { color: '#F8FAFC' }]}>
              🪙 EasyPoints Rewards Store ({points} Points Available)
            </Text>
            {POINT_REWARDS.map((r) => (
              <View
                key={r.id}
                style={[styles.rewardCard, isDarkMode && styles.rewardCardDark]}
              >
                <Text style={styles.rewardEmoji}>{r.emoji}</Text>
                <View style={styles.rewardInfo}>
                  <Text style={[styles.rewardTitle, isDarkMode && { color: '#F8FAFC' }]}>{r.title}</Text>
                  <Text style={styles.rewardPointsCost}>{r.points} Points</Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.redeemBtn,
                    points < r.points && styles.redeemBtnDisabled,
                  ]}
                  onPress={() => redeemReward(r)}
                >
                  <Text style={styles.redeemBtnTxt}>REDEEM</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          {/* Toast Notice */}
          {toastMsg && (
            <View style={styles.toastNotice}>
              <Text style={styles.toastNoticeTxt}>{toastMsg}</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    height: '82%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 16,
    paddingHorizontal: 20,
  },
  modalCardDark: {
    backgroundColor: '#0F172A',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalHeaderIconBg: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
  },
  modalSub: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    paddingVertical: 16,
    paddingBottom: 40,
  },
  balanceCard: {
    backgroundColor: '#1E293B',
    borderRadius: 22,
    padding: 18,
    marginBottom: 20,
    elevation: 6,
  },
  balanceTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 2,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: '900',
    color: '#22C55E',
  },
  pointsBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  pointsText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#F59E0B',
  },
  balanceActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addCashBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 14,
  },
  addCashBtnTxt: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  historyBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 14,
  },
  historyBtnTxt: {
    fontSize: 12,
    fontWeight: '700',
    color: '#CBD5E1',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 12,
  },
  couponCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
  },
  couponLeft: {
    flex: 1,
    paddingRight: 10,
  },
  couponTitle: {
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 2,
  },
  couponDesc: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 4,
  },
  couponExpiry: {
    fontSize: 9,
    fontWeight: '700',
  },
  copyBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },
  copyBtnTxt: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  rewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  rewardCardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  rewardEmoji: {
    fontSize: 22,
    marginRight: 12,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  rewardPointsCost: {
    fontSize: 10,
    fontWeight: '700',
    color: '#F59E0B',
  },
  redeemBtn: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  redeemBtnDisabled: {
    backgroundColor: '#94A3B8',
  },
  redeemBtnTxt: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  toastNotice: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 10,
  },
  toastNoticeTxt: {
    fontSize: 12,
    fontWeight: '800',
    color: '#22C55E',
  },
});
