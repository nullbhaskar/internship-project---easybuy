import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ADMIN_THEME } from './ReplicaTheme';

export type AdminTab = 'home' | 'analytics' | 'orders' | 'activity' | 'products';
export type ReplicaTab = AdminTab;

interface AdminBottomNavProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
}

export const AdminBottomNav: React.FC<AdminBottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: 'grid-outline', activeIcon: 'grid' },
    { id: 'analytics', label: 'Analytics', icon: 'bar-chart-outline', activeIcon: 'bar-chart' },
    { id: 'orders', label: 'Orders', icon: 'document-text-outline', activeIcon: 'document-text' },
    { id: 'activity', label: 'Activity', icon: 'time-outline', activeIcon: 'time' },
    { id: 'products', label: 'Catalog', icon: 'cube-outline', activeIcon: 'cube' },
  ] as const;

  return (
    <View style={styles.navContainer}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tabItem}
            onPress={() => onTabChange(tab.id as AdminTab)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={(isActive ? tab.activeIcon : tab.icon) as any}
              size={20}
              color={isActive ? ADMIN_THEME.textDark : ADMIN_THEME.textSubtle}
            />
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export const ReplicaBottomNav = AdminBottomNav;

const styles = StyleSheet.create({
  navContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -3 },
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 3,
  },
  tabLabelActive: {
    color: '#0F172A',
    fontWeight: '800',
  },
});
