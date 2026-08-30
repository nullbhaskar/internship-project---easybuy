import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AdminSection } from './adminTypes';

interface AdminHeaderProps {
  activeSection: AdminSection;
  onLogout: () => void;
  isFirebaseConnected?: boolean;
}

const SECTION_TITLES: Record<AdminSection, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Overview & Analytics' },
  aicontrol: { title: 'AI Control', subtitle: 'System Intelligence' },
  stock: { title: 'Inventory', subtitle: 'Stock Management' },
  products: { title: 'Products', subtitle: 'Catalog Directory' },
  orders: { title: 'Orders', subtitle: 'Fulfillment Center' },
};

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  activeSection,
  onLogout,
  isFirebaseConnected = true,
}) => {
  const { title } = SECTION_TITLES[activeSection] || SECTION_TITLES.dashboard;

  return (
    <View style={styles.container}>
      {/* Left � Logo + Title */}
      <View style={styles.left}>
        <View style={styles.logoWrap}>
          <Ionicons name="storefront-outline" size={16} color="#4F46E5" />
        </View>
        <Text style={styles.appName}>{title}</Text>
      </View>

      {/* Right � Actions & Profile */}
      <View style={styles.right}>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="search" size={20} color="#475569" />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={onLogout} style={styles.textAvatar}>
          <Text style={styles.textAvatarChar}>A</Text>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center'
  },
  textAvatarChar: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700'
  },
  avatarWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
});
