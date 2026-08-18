import React, { createContext, useContext, useEffect } from 'react';
import { Dimensions, ViewStyle, StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  Easing,
  SharedValue,
} from 'react-native-reanimated';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const ScrollContext = createContext<SharedValue<number> | null>(null);

export const useScrollY = () => useContext(ScrollContext);

export type RevealDirection = 'left' | 'right' | 'up' | 'scale' | 'rotate';

export interface RevealOnScrollProps {
  children: React.ReactNode;
  direction?: RevealDirection;
  delay?: number;
  duration?: number;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  index?: number;
  triggerOffset?: number;
}

export const RevealOnScroll: React.FC<RevealOnScrollProps> = ({
  children,
  direction = 'up',
  delay = 0,
  duration = 450,
  disabled = false,
  style,
  index,
  triggerOffset = 120,
}) => {
  const scrollY = useScrollY();
  const layoutY = useSharedValue(-1);
  const progress = useSharedValue(disabled ? 1 : 0);
  const hasTriggered = useSharedValue(disabled ? true : false);

  const effectiveDirection: RevealDirection = React.useMemo(() => {
    if (direction) return direction;
    if (typeof index === 'number') {
      const mode = index % 3;
      if (mode === 0) return 'left';
      if (mode === 1) return 'scale';
      return 'right';
    }
    return 'up';
  }, [direction, index]);

  useEffect(() => {
    if (disabled) {
      progress.value = 1;
      hasTriggered.value = true;
      return;
    }
    if (!scrollY) {
      if (effectiveDirection === 'scale' || effectiveDirection === 'rotate') {
        const damping = effectiveDirection === 'rotate' ? 14 : 15;
        const stiffness = effectiveDirection === 'rotate' ? 130 : 140;
        progress.value = withDelay(delay, withSpring(1, { damping, stiffness, mass: 0.9 }));
      } else {
        progress.value = withDelay(delay, withTiming(1, { duration, easing: Easing.out(Easing.cubic) }));
      }
      hasTriggered.value = true;
    }
  }, [disabled, scrollY, delay, duration, effectiveDirection]);

  const triggerAnimation = () => {
    'worklet';
    if (hasTriggered.value) return;
    hasTriggered.value = true;

    if (effectiveDirection === 'scale' || effectiveDirection === 'rotate') {
      const damping = effectiveDirection === 'rotate' ? 14 : 15;
      const stiffness = effectiveDirection === 'rotate' ? 130 : 140;
      progress.value = withDelay(
        delay,
        withSpring(1, { damping, stiffness, mass: 0.9 })
      );
    } else {
      progress.value = withDelay(
        delay,
        withTiming(1, { duration, easing: Easing.out(Easing.cubic) })
      );
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    if (disabled) {
      return {};
    }

    if (scrollY && layoutY.value >= 0 && !hasTriggered.value) {
      const threshold = layoutY.value - SCREEN_HEIGHT + triggerOffset;
      if (scrollY.value >= threshold) {
        triggerAnimation();
      }
    }

    const val = progress.value;
    const opacity = val;

    switch (effectiveDirection) {
      case 'left': {
        const translateX = (1 - val) * -60;
        return {
          opacity,
          transform: [{ translateX }],
        };
      }
      case 'right': {
        const translateX = (1 - val) * 60;
        return {
          opacity,
          transform: [{ translateX }],
        };
      }
      case 'scale': {
        const scale = 0.85 + val * 0.15;
        return {
          opacity,
          transform: [{ scale }],
        };
      }
      case 'rotate': {
        const scale = 0.9 + val * 0.1;
        const rotate = `${(1 - val) * -8}deg`;
        return {
          opacity,
          transform: [{ scale }, { rotate }],
        };
      }
      case 'up':
      default: {
        const translateY = (1 - val) * 35;
        return {
          opacity,
          transform: [{ translateY }],
        };
      }
    }
  });

  return (
    <Animated.View
      style={[style, animatedStyle]}
      onLayout={(e) => {
        const y = e.nativeEvent.layout.y;
        layoutY.value = y;
        if (scrollY && y < SCREEN_HEIGHT + 100 && !hasTriggered.value) {
          triggerAnimation();
        }
      }}
    >
      {children}
    </Animated.View>
  );
};
