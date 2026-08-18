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
import { C } from './adminTheme';

interface BottomNavProps {
  active: AdminSection;
  onSelect: (section: AdminSection) => void;
}

const TABS: Array<{
  id: AdminSection;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  color: string;
}> = [
  { id: 'dashboard',  label: 'Home',       icon: 'grid-outline',     activeIcon: 'grid',             color: C.primary },
  { id: 'products',   label: 'Products',   icon: 'cube-outline',     activeIcon: 'cube',             color: C.secondary },
  { id: 'categories', label: 'Categories', icon: 'albums-outline',   activeIcon: 'albums',           color: C.violet },
  { id: 'orders',     label: 'Orders',     icon: 'receipt-outline',  activeIcon: 'receipt',          color: C.warning },
  { id: 'analytics',  label: 'Analytics',  icon: 'bar-chart-outline',activeIcon: 'bar-chart',        color: C.success },
];

export const AdminBottomNav: React.FC<BottomNavProps> = ({ active, onSelect }) => {
  const scaleAnims = useRef(TABS.map(() => new Animated.Value(1))).current;
  const bgAnims    = useRef(TABS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    TABS.forEach((tab, i) => {
      Animated.parallel([
        Animated.spring(scaleAnims[i], {
          toValue: active === tab.id ? 1 : 1,
          useNativeDriver: true,
        }),
        Animated.timing(bgAnims[i], {
          toValue: active === tab.id ? 1 : 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    });
  }, [active]);

  const handlePress = (tab: typeof TABS[0], index: number) => {
    if (tab.id === active) return;
    Animated.sequence([
      Animated.timing(scaleAnims[index], {
        toValue: 0.88,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnims[index], {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync().catch(() => {});
    }
    onSelect(tab.id);
  };

  return (
    <View style={styles.container}>
      {TABS.map((tab, i) => {
        const isActive = active === tab.id;
        const bgColor = bgAnims[i].interpolate({
          inputRange: [0, 1],
          outputRange: ['rgba(0,0,0,0)', `${tab.color}22`],
        });

        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tab}
            onPress={() => handlePress(tab, i)}
            activeOpacity={0.9}
          >
            <Animated.View
              style={[
                styles.iconWrap,
                { backgroundColor: bgColor, transform: [{ scale: scaleAnims[i] }] },
              ]}
            >
              <Ionicons
                name={isActive ? tab.activeIcon : tab.icon}
                size={22}
                color={isActive ? tab.color : C.textMuted}
              />
              {isActive && (
                <View style={[styles.activeDot, { backgroundColor: tab.color }]} />
              )}
            </Animated.View>
            <Text style={[styles.label, isActive && { color: tab.color, fontWeight: '700' }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: C.surface,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingTop: 8,
    paddingHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 20,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  iconWrap: {
    width: 44,
    height: 36,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  activeDot: {
    position: 'absolute',
    bottom: 3,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  label: {
    fontSize: 10,
    color: C.textMuted,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
