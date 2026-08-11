import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const MARGIN_HORIZ = 20;
const CAPSULE_WIDTH = width - MARGIN_HORIZ * 2;
const TAB_COUNT = 3;
const TAB_WIDTH = CAPSULE_WIDTH / TAB_COUNT;

export interface EasyBuyTab {
  id: string;
  label: string;
  iconActive: string;
  iconInactive: string;
  badge?: number;
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
  const activeIndex = EASYBUY_TABS.findIndex((t) => t.id === activeTab);
  const safeIndex = activeIndex >= 0 ? activeIndex : 0;

  const pillTranslateX = useRef(new Animated.Value(safeIndex * TAB_WIDTH)).current;

  useEffect(() => {
    Animated.spring(pillTranslateX, {
      toValue: safeIndex * TAB_WIDTH,
      friction: 6,
      tension: 180,
      useNativeDriver: true,
    }).start();
  }, [safeIndex]);

  const handleTabPress = (tabId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onTabChange(tabId);
  };

  return (
    <View style={styles.outerWrapper}>
      {/* FLOATING GLASS DOCK */}
      <View
        style={[
          styles.capsuleBar,
          isDarkMode ? styles.capsuleBarDark : styles.capsuleBarLight,
        ]}
      >
        {/* ACTIVE PILL POSITIONED WITH ANIMATED SPRING */}
        <Animated.View
          style={[
            styles.slidingActivePill,
            isDarkMode ? styles.activePillDark : styles.activePillLight,
            {
              left: 5,
              width: TAB_WIDTH - 10,
              transform: [{ translateX: pillTranslateX }],
            },
          ]}
        />

        {/* 3 INTERACTIVE TABS */}
        {EASYBUY_TABS.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabItem}
              onPress={() => handleTabPress(tab.id)}
              activeOpacity={0.85}
            >
              <View
                style={[
                  styles.iconBox,
                  isActive && (isDarkMode ? styles.iconBoxActiveDark : styles.iconBoxActiveLight),
                ]}
              >
                <Ionicons
                  name={(isActive ? tab.iconActive : tab.iconInactive) as any}
                  size={21}
                  color={
                    isActive
                      ? isDarkMode
                        ? '#C084FC'
                        : '#0F172A'
                      : isDarkMode
                      ? '#64748B'
                      : '#94A3B8'
                  }
                />
              </View>

              <Text
                style={[
                  styles.tabLabel,
                  isActive
                    ? isDarkMode
                      ? styles.labelActiveDark
                      : styles.labelActiveLight
                    : isDarkMode
                    ? styles.labelInactiveDark
                    : styles.labelInactiveLight,
                ]}
              >
                {tab.label}
              </Text>

              {isActive && (
                <View
                  style={[
                    styles.activeDot,
                    isDarkMode ? styles.dotDark : styles.dotLight,
                  ]}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerWrapper: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  capsuleBar: {
    flexDirection: 'row',
    width: CAPSULE_WIDTH,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,

    // Glassmorphism & Shadow
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
  capsuleBarLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderColor: 'rgba(226, 232, 240, 0.8)',
    borderWidth: 1.5,
    shadowColor: '#0F172A',
  },
  capsuleBarDark: {
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    borderColor: 'rgba(51, 65, 85, 0.7)',
    borderWidth: 1.5,
    shadowColor: '#000000',
  },
  slidingActivePill: {
    position: 'absolute',
    height: 52,
    borderRadius: 26,
    top: 6,
  },
  activePillLight: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
    borderWidth: 1,
  },
  activePillDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
  },
  tabItem: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxActiveLight: {
    backgroundColor: 'transparent',
  },
  iconBoxActiveDark: {
    backgroundColor: 'transparent',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 0.2,
  },
  labelActiveLight: {
    color: '#0F172A',
    fontWeight: '700',
  },
  labelActiveDark: {
    color: '#F8FAFC',
    fontWeight: '700',
  },
  labelInactiveLight: {
    color: '#94A3B8',
  },
  labelInactiveDark: {
    color: '#64748B',
  },
  activeDot: {
    position: 'absolute',
    bottom: 6,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  dotLight: {
    backgroundColor: '#0F172A',
  },
  dotDark: {
    backgroundColor: '#C084FC',
  },
});
