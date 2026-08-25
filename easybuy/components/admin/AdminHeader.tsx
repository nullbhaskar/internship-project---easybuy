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
  dashboard:  { title: 'Dashboard',  subtitle: 'Store overview' },
  products:   { title: 'Catalog',   subtitle: 'Manage catalog' },
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
        
        <TouchableOpacity onPress={onLogout} style={styles.avatarWrap}>
          <Image 
            source={{ uri: 'https://i.pravatar.cc/100?img=11' }} 
            style={styles.avatar} 
          />
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
    padding: 4,
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
