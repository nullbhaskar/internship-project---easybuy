import React from 'react';
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

interface LoyaltyModalProps {
  visible: boolean;
  onClose: () => void;
  isDarkMode?: boolean;
}

const PERKS = [
  { icon: 'flash', title: 'Unlimited Free 10-Min Delivery', desc: 'No delivery fees on any grocery orders above ₹149.' },
  { icon: 'sparkles', title: '2X EasyPoints Multiplier', desc: 'Earn double reward points on every purchase.' },
  { icon: 'gift', title: 'Exclusive Midnight Flash Drops', desc: 'Early 2 AM access to daily flash deals before general release.' },
  { icon: 'headset', title: '24/7 VIP Concierge Support', desc: 'Direct priority resolution in under 2 minutes.' },
];

export const LoyaltyModal: React.FC<LoyaltyModalProps> = ({
  visible,
  onClose,
  isDarkMode = false,
}) => {
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
                <Ionicons name="ribbon" size={20} color="#8B5CF6" />
              </View>
              <View>
                <Text style={[styles.modalTitle, isDarkMode && { color: '#F8FAFC' }]}>
                  EasyBuy VIP Pass & Loyalty
                </Text>
                <Text style={[styles.modalSub, isDarkMode && { color: '#94A3B8' }]}>
                  Subscription details & exclusive tier benefits
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={20} color={isDarkMode ? '#94A3B8' : '#64748B'} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* 1. VIP Pass Status Hero Card */}
            <View style={styles.vipCard}>
              <View style={styles.vipTopRow}>
                <View>
                  <View style={styles.vipBadge}>
                    <Text style={styles.vipBadgeTxt}>👑 GOLD VIP MEMBER</Text>
                  </View>
                  <Text style={styles.vipPlanTitle}>EasyPass Pro Unlimited</Text>
                </View>
                <Ionicons name="shield-checkmark" size={32} color="#F59E0B" />
              </View>
              <Text style={styles.vipRenewal}>Subscription Active • Renews on Sep 10, 2026</Text>

              <View style={styles.xpProgressWrap}>
                <View style={styles.xpTextRow}>
                  <Text style={styles.xpLabel}>Level 7 Gold Tier</Text>
                  <Text style={styles.xpValue}>680 / 1000 XP to Platinum</Text>
                </View>
                <View style={styles.xpBarBg}>
                  <View style={[styles.xpBarFill, { width: '68%' }]} />
                </View>
              </View>
            </View>

            {/* 2. Subscription Perks List */}
            <Text style={[styles.sectionTitle, isDarkMode && { color: '#F8FAFC' }]}>
              ✨ Your Active Subscription Perks
            </Text>
            {PERKS.map((p, i) => (
              <View key={i} style={[styles.perkCard, isDarkMode && styles.perkCardDark]}>
                <View style={styles.perkIconBg}>
                  <Ionicons name={p.icon as any} size={18} color="#8B5CF6" />
                </View>
                <View style={styles.perkInfo}>
                  <Text style={[styles.perkTitle, isDarkMode && { color: '#F8FAFC' }]}>{p.title}</Text>
                  <Text style={styles.perkDesc}>{p.desc}</Text>
                </View>
              </View>
            ))}

            <TouchableOpacity
              style={styles.manageSubBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
              }}
            >
              <Text style={styles.manageSubBtnTxt}>Manage EasyPass Subscription</Text>
            </TouchableOpacity>
          </ScrollView>
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
    height: '78%',
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
    backgroundColor: '#F3E8FF',
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
  vipCard: {
    backgroundColor: '#1E1B4B',
    borderRadius: 22,
    padding: 18,
    marginBottom: 20,
    elevation: 6,
  },
  vipTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  vipBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.25)',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  vipBadgeTxt: {
    fontSize: 10,
    fontWeight: '900',
    color: '#F59E0B',
    letterSpacing: 0.5,
  },
  vipPlanTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  vipRenewal: {
    fontSize: 11,
    fontWeight: '600',
    color: '#A5B4FC',
    marginBottom: 16,
  },
  xpProgressWrap: {
    marginTop: 4,
  },
  xpTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  xpLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  xpValue: {
    fontSize: 10,
    fontWeight: '700',
    color: '#C084FC',
  },
  xpBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(168, 85, 247, 0.3)',
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#C084FC',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 12,
  },
  perkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  perkCardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  perkIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  perkInfo: {
    flex: 1,
  },
  perkTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  perkDesc: {
    fontSize: 10,
    fontWeight: '500',
    color: '#64748B',
  },
  manageSubBtn: {
    marginTop: 16,
    backgroundColor: '#7C3AED',
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  manageSubBtnTxt: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
