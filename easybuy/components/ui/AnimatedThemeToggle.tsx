import React, { useRef, useEffect } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface AnimatedThemeToggleProps {
  isDarkMode: boolean;
  onToggle: () => void;
}

export const AnimatedThemeToggle: React.FC<AnimatedThemeToggleProps> = ({
  isDarkMode,
  onToggle,
}) => {
  // Animation Drivers
  const animValue = useRef(new Animated.Value(isDarkMode ? 1 : 0)).current;
  const knobScaleX = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Squish effect on toggle
    Animated.sequence([
      Animated.timing(knobScaleX, {
        toValue: 1.25,
        duration: 100,
        useNativeDriver: false,
      }),
      Animated.spring(knobScaleX, {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: false,
      }),
    ]).start();

    // Slide & Rotate Transition
    Animated.timing(animValue, {
      toValue: isDarkMode ? 1 : 0,
      duration: 300,
      easing: Easing.out(Easing.back(1.5)),
      useNativeDriver: false,
    }).start();
  }, [isDarkMode]);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onToggle();
  };

  // Interpolations
  const slideX = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 24],
  });

  const rotateDeg = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const trackBgColor = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#F1F5F9', '#1E293B'],
  });

  const trackBorderColor = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E2E8F0', '#334155'],
  });

  const knobBgColor = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#FFFFFF', '#0F172A'],
  });

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
      <Animated.View
        style={[
          styles.track,
          {
            backgroundColor: trackBgColor,
            borderColor: trackBorderColor,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.knob,
            {
              backgroundColor: knobBgColor,
              transform: [
                { translateX: slideX },
                { scaleX: knobScaleX },
              ],
            },
          ]}
        >
          <Animated.View style={{ transform: [{ rotate: rotateDeg }] }}>
            <Ionicons
              name={isDarkMode ? 'moon' : 'sunny'}
              size={13}
              color={isDarkMode ? '#F6CC63' : '#F59E0B'}
            />
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  track: {
    width: 52,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    justifyContent: 'center',
    paddingHorizontal: 1,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  knob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
});
