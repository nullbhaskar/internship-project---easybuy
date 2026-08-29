import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { AdminSection } from './adminTypes';

interface BottomNavProps {
  active: AdminSection;
  onSelect: (section: AdminSection) => void;
}

const TABS: Array<{
  id: AdminSection;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
}> = [
  { id: 'dashboard',  label: 'Dashboard',  icon: 'grid-outline',     activeIcon: 'grid' },
  { id: 'products',   label: 'Products',   icon: 'bag-handle-outline', activeIcon: 'bag-handle' },
  { id: 'orders',     label: 'Orders',     icon: 'receipt-outline',  activeIcon: 'receipt' },
  { id: 'stock',      label: 'Stock',      icon: 'cube-outline',     activeIcon: 'cube' },
  { id: 'aicontrol',  label: 'AI Control', icon: 'hardware-chip-outline', activeIcon: 'hardware-chip' },
];

export const AdminBottomNav: React.FC<BottomNavProps> = ({ active, onSelect }) => {
  const handlePress = (tab: typeof TABS[0]) => {
    if (tab.id === active) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onSelect(tab.id);
  };

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        {TABS.map((tab) => {
          const isActive = active === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              activeOpacity={0.8}
              onPress={() => handlePress(tab)}
              style={styles.tab}
            >
              <View style={[styles.iconContainer, isActive && styles.activeIconContainer]}>
                <Ionicons
                  name={isActive ? tab.activeIcon : tab.icon}
                  size={20}
                  color={isActive ? '#3B82F6' : '#94A3B8'}
                />
              </View>
              <Text style={[styles.label, isActive && styles.activeLabel]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 100,
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 100,
    paddingHorizontal: 8,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 400,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  iconContainer: {
    width: 40,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconContainer: {
    backgroundColor: '#EFF6FF',
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
  },
  activeLabel: {
    color: '#3B82F6',
  },
});
