import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, S } from './adminTheme';
import { AdminSection } from './adminTypes';

interface AdminHeaderProps {
  activeSection: AdminSection;
  onLogout: () => void;
  isFirebaseConnected?: boolean;
}

const SECTION_TITLES: Record<AdminSection, { title: string; subtitle: string }> = {
  dashboard:  { title: 'Dashboard',  subtitle: 'Store overview' },
  products:   { title: 'Products',   subtitle: 'Manage catalog' },
  categories: { title: 'Categories', subtitle: 'Browse by category' },
  orders:     { title: 'Orders',     subtitle: 'Order management' },
  analytics:  { title: 'Analytics',  subtitle: 'Store insights' },
  settings:   { title: 'Settings',   subtitle: 'Admin preferences' },
};

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  activeSection,
  onLogout,
  isFirebaseConnected = true,
}) => {
  const { title, subtitle } = SECTION_TITLES[activeSection] || SECTION_TITLES.dashboard;

  return (
    <View style={styles.container}>
      {/* Left — Logo + Title */}
      <View style={styles.left}>
        <View style={styles.logoWrap}>
          <Ionicons name="shield-checkmark" size={20} color={C.primary} />
        </View>
        <View>
          <View style={styles.titleRow}>
            <Text style={styles.appName}>EasyBuy</Text>
            <View style={[styles.statusDot, { backgroundColor: isFirebaseConnected ? C.success : C.danger }]} />
          </View>
          <Text style={styles.sectionSub}>{subtitle}</Text>
        </View>
      </View>

      {/* Right — Actions */}
      <View style={styles.right}>
        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={16} color={C.danger} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: S.lg,
    paddingVertical: S.md,
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm + 2,
  },
  logoWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: C.primaryDim,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.primaryGlow,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  appName: {
    color: C.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginTop: 1,
  },
  sectionSub: {
    color: C.textMuted,
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: C.dangerDim,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(244,63,94,0.2)',
  },
  logoutText: {
    color: C.danger,
    fontSize: 12,
    fontWeight: '700',
  },
});
