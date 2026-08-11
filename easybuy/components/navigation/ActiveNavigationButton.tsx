import React from 'react';
import { StyleSheet, Animated, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ActiveNavigationButtonProps {
  translateX: Animated.AnimatedInterpolation<number>;
  scaleAnim: Animated.Value;
  iconName: string;
  isDarkMode: boolean;
  circleSize?: number;
}

export const ActiveNavigationButton: React.FC<ActiveNavigationButtonProps> = ({
  translateX,
  scaleAnim,
  iconName,
  isDarkMode,
  circleSize = 54,
}) => {
  const bg = isDarkMode ? '#1E1B4B' : '#0F172A';
  const borderColor = isDarkMode ? '#A855F7' : '#22C55E';
  const iconColor = isDarkMode ? '#A855F7' : '#FFFFFF';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: circleSize,
          height: circleSize,
          borderRadius: circleSize / 2,
          backgroundColor: bg,
          borderColor: borderColor,
          transform: [
            { translateX },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      <View style={styles.glowRing} />
      <Ionicons name={iconName as any} size={24} color={iconColor} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: -25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 14,
    zIndex: 10,
  },
  glowRing: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 27,
    backgroundColor: 'rgba(168, 85, 247, 0.18)',
  },
});
