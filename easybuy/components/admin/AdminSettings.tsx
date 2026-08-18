import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, R, S } from './adminTheme';

interface AdminSettingsProps {
  adminEmail: string;
  totalProducts: number;
  totalOrders: number;
  totalCategories: number;
  isFirebaseConnected: boolean;
  onLogout: () => void;
  onRefresh: () => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({
  adminEmail,
  totalProducts,
  totalOrders,
  totalCategories,
  isFirebaseConnected,
  onLogout,
  onRefresh,
}) => {
  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Sign out of admin panel?')) onLogout();
    } else {
      Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: onLogout },
      ]);
    }
  };

  const Row = ({
    icon,
    label,
    value,
    accent,
    onPress,
    danger,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value?: string;
    accent?: string;
    onPress?: () => void;
    danger?: boolean;
  }) => (
    <TouchableOpacity
      style={sStyles.row}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
      disabled={!onPress}
    >
      <View style={[sStyles.rowIcon, { backgroundColor: danger ? C.dangerDim : `${accent || C.primary}22` }]}>
        <Ionicons name={icon} size={18} color={danger ? C.danger : accent || C.primary} />
      </View>
      <Text style={[sStyles.rowLabel, danger && { color: C.danger }]}>{label}</Text>
      {value !== undefined && (
        <Text style={sStyles.rowValue}>{value}</Text>
      )}
      {onPress && (
        <Ionicons
          name="chevron-forward"
          size={16}
          color={danger ? C.danger : C.textMuted}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <View>
      {/* Profile Section */}
      <View style={sStyles.profileCard}>
        <View style={sStyles.avatar}>
          <Ionicons name="shield-checkmark" size={28} color={C.primary} />
        </View>
        <View style={sStyles.profileInfo}>
          <Text style={sStyles.profileName}>Admin</Text>
          <Text style={sStyles.profileEmail}>{adminEmail}</Text>
          <View style={sStyles.roleBadge}>
            <Text style={sStyles.roleText}>Super Admin</Text>
          </View>
        </View>
      </View>

      {/* Store Information */}
      <Text style={sStyles.groupLabel}>STORE INFORMATION</Text>
      <View style={sStyles.card}>
        <Row icon="storefront-outline" label="Store Name"        value="EasyBuy"            accent={C.primary} />
        <View style={sStyles.divider} />
        <Row icon="cube-outline"       label="Total Products"    value={String(totalProducts)}  accent={C.secondary} />
        <View style={sStyles.divider} />
        <Row icon="albums-outline"     label="Total Categories"  value={String(totalCategories)} accent={C.violet} />
        <View style={sStyles.divider} />
        <Row icon="receipt-outline"    label="Total Orders"      value={String(totalOrders)}    accent={C.warning} />
      </View>

      {/* Connection Status */}
      <Text style={sStyles.groupLabel}>SYSTEM</Text>
      <View style={sStyles.card}>
        <View style={sStyles.row}>
          <View style={[sStyles.rowIcon, { backgroundColor: isFirebaseConnected ? C.successDim : C.dangerDim }]}>
            <Ionicons name="cloud-outline" size={18} color={isFirebaseConnected ? C.success : C.danger} />
          </View>
          <Text style={sStyles.rowLabel}>Firebase Status</Text>
          <View style={[sStyles.statusBadge, { backgroundColor: isFirebaseConnected ? C.successDim : C.dangerDim }]}>
            <View style={[sStyles.statusDot, { backgroundColor: isFirebaseConnected ? C.success : C.danger }]} />
            <Text style={[sStyles.statusText, { color: isFirebaseConnected ? C.success : C.danger }]}>
              {isFirebaseConnected ? 'Connected' : 'Disconnected'}
            </Text>
          </View>
        </View>
        <View style={sStyles.divider} />
        <Row icon="refresh-outline" label="Refresh Data" accent={C.primary} onPress={onRefresh} />
      </View>

      {/* App Info */}
      <Text style={sStyles.groupLabel}>APP INFO</Text>
      <View style={sStyles.card}>
        <Row icon="information-circle-outline" label="Version"   value="1.0.0"         accent={C.textMuted} />
        <View style={sStyles.divider} />
        <Row icon="code-slash-outline"         label="Platform"  value={Platform.OS}   accent={C.textMuted} />
      </View>

      {/* Logout */}
      <TouchableOpacity style={sStyles.logoutCard} onPress={handleLogout} activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={20} color={C.danger} />
        <Text style={sStyles.logoutText}>Sign Out</Text>
      </TouchableOpacity>

      <View style={{ height: 28 }} />
    </View>
  );
};

const sStyles = StyleSheet.create({
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.lg,
    backgroundColor: C.surface2,
    borderRadius: R.card,
    padding: S.xl,
    marginBottom: S.xl,
    borderWidth: 1,
    borderColor: C.border,
  },
  avatar: {
    width: 60, height: 60, borderRadius: 20,
    backgroundColor: C.primaryDim,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: C.primaryGlow,
  },
  profileInfo: { flex: 1, gap: 3 },
  profileName: { color: C.textPrimary, fontSize: 18, fontWeight: '800' },
  profileEmail: { color: C.textMuted, fontSize: 12 },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: C.primaryDim,
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3,
    marginTop: 4,
  },
  roleText: { color: C.primary, fontSize: 10, fontWeight: '800' },

  groupLabel: {
    color: C.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: S.sm,
    marginTop: S.sm,
  },
  card: {
    backgroundColor: C.surface2,
    borderRadius: R.card,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
    marginBottom: S.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: S.lg,
    gap: S.md,
  },
  rowIcon: {
    width: 36, height: 36, borderRadius: 11,
    justifyContent: 'center', alignItems: 'center',
  },
  rowLabel: { color: C.textPrimary, fontSize: 14, fontWeight: '600', flex: 1 },
  rowValue: { color: C.textSecondary, fontSize: 14, fontWeight: '700' },
  divider: { height: 1, backgroundColor: C.border, marginLeft: 64 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '700' },

  logoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: S.sm,
    backgroundColor: C.dangerDim,
    borderRadius: R.card,
    padding: S.lg,
    borderWidth: 1,
    borderColor: 'rgba(244,63,94,0.25)',
    marginBottom: S.lg,
  },
  logoutText: { color: C.danger, fontSize: 16, fontWeight: '800' },
});
