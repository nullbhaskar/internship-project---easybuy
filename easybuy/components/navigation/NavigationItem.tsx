import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface NavigationItemProps {
  id: string;
  label: string;
  iconActive: string;
  iconInactive: string;
  isActive: boolean;
  onPress: () => void;
  isDarkMode: boolean;
  tabWidth: number;
}

export const NavigationItem: React.FC<NavigationItemProps> = ({
  id,
  label,
  iconActive,
  iconInactive,
  isActive,
  onPress,
  isDarkMode,
  tabWidth,
}) => {
  const activeTextColor = isDarkMode ? '#A855F7' : '#0F172A';
  const inactiveTextColor = isDarkMode ? '#94A3B8' : '#64748B';
  const inactiveIconColor = isDarkMode ? '#64748B' : '#94A3B8';

  return (
    <TouchableOpacity
      style={[styles.container, { width: tabWidth }]}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`Navigate to ${label}`}
    >
      <View style={isActive ? styles.activeSpace : styles.inactiveSpace}>
        {!isActive && (
          <Ionicons
            name={iconInactive as any}
            size={20}
            color={inactiveIconColor}
          />
        )}
      </View>
      <Text
        style={[
          styles.label,
          {
            color: isActive ? activeTextColor : inactiveTextColor,
            fontWeight: isActive ? '800' : '600',
            opacity: isActive ? 1 : 0.7,
          },
        ]}
      >
        {label}
      </Text>

      {/* Active Dot Indicator */}
      {isActive && <View style={[styles.activeDot, { backgroundColor: isDarkMode ? '#A855F7' : '#7C3AED' }]} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    zIndex: 5,
  },
  activeSpace: {
    marginTop: -24,
    height: 48,
  },
  inactiveSpace: {
    marginTop: 10,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    position: 'absolute',
    bottom: 8,
    fontSize: 10,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  activeDot: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
