import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export interface EasyBuyTab {
  id: string;
  label: string;
  iconActive: string;
  iconInactive: string;
}

export const EASYBUY_TABS: EasyBuyTab[] = [
  { id: 'home', label: 'Home', iconActive: 'home', iconInactive: 'home-outline' },
  { id: 'orders', label: 'Orders', iconActive: 'receipt', iconInactive: 'receipt-outline' },
  { id: 'profile', label: 'Profile', iconActive: 'person', iconInactive: 'person-outline' },
];

interface ExperimentalNavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  isDarkMode?: boolean;
}

export const ExperimentalNavigation: React.FC<ExperimentalNavigationProps> = ({
  activeTab,
  onTabChange,
  isDarkMode = false,
}) => {
  // Animated value for each tab (0 = inactive, 1 = active)
  const animValues = useRef(
    EASYBUY_TABS.map((tab) => new Animated.Value(tab.id === activeTab ? 1 : 0))
  ).current;

  useEffect(() => {
    // 120 FPS Native UI Thread Fluid Transition
    Animated.parallel(
      EASYBUY_TABS.map((tab, idx) => {
        const isActive = tab.id === activeTab;
        return Animated.timing(animValues[idx], {
          toValue: isActive ? 1 : 0,
          duration: 160,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true, // Native UI thread execution (60/120 FPS locked)
        });
      })
    ).start();
  }, [activeTab]);

  const handleTabPress = (tabId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onTabChange(tabId);
  };

  return (
    <View style={[styles.tabBarWrapper, isDarkMode && styles.tabBarWrapperDark]}>
      {EASYBUY_TABS.map((tab, idx) => {
        const isActive = activeTab === tab.id;
        const anim = animValues[idx];

        // Active pill animations
        const activeScale = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.88, 1],
        });
        const activeOpacity = anim.interpolate({
          inputRange: [0, 0.4, 1],
          outputRange: [0, 0.5, 1],
        });

        // Inactive container animations
        const inactiveOpacity = anim.interpolate({
          inputRange: [0, 0.6, 1],
          outputRange: [1, 0.4, 0],
        });
        const inactiveScale = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0.88],
        });

        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.navTabContainer}
            onPress={() => handleTabPress(tab.id)}
            activeOpacity={0.85}
          >
            {/* Active Pill Container (horizontal icon + text) */}
            <Animated.View
              pointerEvents={isActive ? 'auto' : 'none'}
              style={[
                styles.activePillContainer,
                isDarkMode && styles.activePillContainerDark,
                {
                  position: 'absolute',
                  opacity: activeOpacity,
                  transform: [{ scale: activeScale }],
                },
              ]}
            >
              <Ionicons
                name={tab.iconActive as any}
                size={18}
                color={isDarkMode ? '#52C480' : '#2F6E49'}
              />
              <Text
                style={[
                  styles.activePillText,
                  isDarkMode && styles.activePillTextDark,
                ]}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
            </Animated.View>

            {/* Inactive Container (vertical icon top, label below) */}
            <Animated.View
              pointerEvents={!isActive ? 'auto' : 'none'}
              style={[
                styles.inactiveTabContainer,
                {
                  opacity: inactiveOpacity,
                  transform: [{ scale: inactiveScale }],
                },
              ]}
            >
              <Ionicons
                name={tab.iconInactive as any}
                size={20}
                color={isDarkMode ? '#64748B' : '#94A3B8'}
              />
              <Text
                style={[
                  styles.inactiveTabLabel,
                  isDarkMode && { color: '#64748B' },
                ]}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
            </Animated.View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarWrapper: {
    flexDirection: 'row',
    width: '100%',
    height: 64,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    zIndex: 999,
  },
  tabBarWrapperDark: {
    backgroundColor: '#0F172A',
    borderTopColor: '#1E293B',
  },
  navTabContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    position: 'relative',
  },
  activePillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E2EFE0', // Soft sage green shade
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 22,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(47, 110, 73, 0.2)',
  },
  activePillContainerDark: {
    backgroundColor: 'rgba(47, 110, 73, 0.25)',
    borderColor: 'rgba(82, 196, 128, 0.35)',
  },
  activePillText: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'PlusJakartaSans-Bold',
    fontWeight: '800',
    color: '#2F6E49', // Deep emerald green text
  },
  activePillTextDark: {
    color: '#52C480',
  },
  inactiveTabContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  inactiveTabLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
  },
});


