import React, { useEffect, useState } from 'react';
import {
  LayoutChangeEvent,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import Reanimated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

// ─────────────────────────────────────────────────────────────
// EasyBuy Motion Kit — Apple-style trending animations
// Built on Reanimated 4 (all motion runs on the UI thread @60fps)
//
//   <StaggerIn index={i}>     → cascade fade + rise + scale entrance
//   <PressableScale>          → springy press micro-interaction
//   <Marquee text="...">      → infinite scrolling ticker strip
//   <FloatLoop>               → gentle continuous floating motion
// ─────────────────────────────────────────────────────────────

interface StaggerInProps {
  children: React.ReactNode;
  /** Position in the cascade — each step adds delayStep ms */
  index?: number;
  /** Base delay between siblings in ms */
  delayStep?: number;
  /** How far the element rises from (px) */
  distance?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Apple product-page style entrance: element fades in while rising
 * and gently scaling up with spring physics. Give siblings increasing
 * `index` values for the signature cascading reveal.
 */
export const StaggerIn: React.FC<StaggerInProps> = ({
  children,
  index = 0,
  delayStep = 90,
  distance = 26,
  style,
}) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      Math.min(index, 10) * delayStep,
      withSpring(1, { damping: 19, stiffness: 160, mass: 0.9 })
    );
  }, [index, delayStep, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateY: (1 - progress.value) * distance },
      { scale: 0.96 + progress.value * 0.04 },
    ],
  }));

  return <Reanimated.View style={[style, animatedStyle]}>{children}</Reanimated.View>;
};

const AnimatedTouchable = Reanimated.createAnimatedComponent(TouchableOpacity);

interface PressableScaleProps {
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  style?: StyleProp<ViewStyle>;
  /** Scale while finger is down (default 0.96) */
  pressScale?: number;
  activeOpacity?: number;
  disabled?: boolean;
}

/**
 * Springy press micro-interaction — card sinks softly under the finger
 * and pops back with spring physics. The tactile "Apple button" feel.
 */
export const PressableScale: React.FC<PressableScaleProps> = ({
  children,
  onPress,
  onLongPress,
  onPressIn,
  onPressOut,
  style,
  pressScale = 0.96,
  activeOpacity = 0.92,
  disabled,
}) => {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    'worklet';
    scale.value = withTiming(pressScale, { duration: 120, easing: Easing.out(Easing.quad) });
    if (onPressIn) {
      onPressIn();
    }
  };

  const handlePressOut = () => {
    'worklet';
    scale.value = withSpring(1, { damping: 13, stiffness: 240, mass: 0.8 });
    if (onPressOut) {
      onPressOut();
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedTouchable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={activeOpacity}
      disabled={disabled}
      style={[style, animatedStyle]}
    >
      {children}
    </AnimatedTouchable>
  );
};

interface MarqueeProps {
  text: string;
  /** Scroll speed in px per second */
  speed?: number;
  /** Gap between repeating copies in px */
  gap?: number;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

/**
 * Infinite auto-scrolling ticker strip — the marquee trend seen across
 * modern e-commerce / hype-drop websites. Content repeats seamlessly.
 */
export const Marquee: React.FC<MarqueeProps> = ({
  text,
  speed = 42,
  gap = 56,
  style,
  textStyle,
}) => {
  const [copyWidth, setCopyWidth] = useState(0);
  const translateX = useSharedValue(0);

  useEffect(() => {
    if (copyWidth <= 0) return;
    const travel = copyWidth + gap;
    const duration = Math.max((travel / speed) * 1000, 2000);
    translateX.value = 0;
    translateX.value = withRepeat(
      withTiming(-travel, { duration, easing: Easing.linear }),
      -1,
      false
    );
  }, [copyWidth, speed, gap, translateX]);

  const handleLayout = (e: LayoutChangeEvent) => {
    setCopyWidth(e.nativeEvent.layout.width);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={[styles.marqueeClip, style]} pointerEvents="none">
      <Reanimated.View style={[styles.marqueeRow, animatedStyle]}>
        {[0, 1].map((copy) => (
          <View key={copy} style={{ paddingRight: gap }} onLayout={copy === 0 ? handleLayout : undefined}>
            <Text style={[styles.marqueeText, textStyle]} numberOfLines={1}>
              {text}
            </Text>
          </View>
        ))}
      </Reanimated.View>
    </View>
  );
};

interface FloatLoopProps {
  children: React.ReactNode;
  /** Vertical float amplitude in px */
  distance?: number;
  /** Duration of one full up-down cycle in ms */
  duration?: number;
  /** Add a subtle playful rotation */
  rotate?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Gentle continuous floating loop — makes icons/illustrations feel
 * weightless and alive even when nothing else is happening.
 */
export const FloatLoop: React.FC<FloatLoopProps> = ({
  children,
  distance = 7,
  duration = 2400,
  rotate = false,
  style,
}) => {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withRepeat(
      withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, [duration, t]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: -distance * t.value },
      ...(rotate ? [{ rotate: `${Math.sin(t.value * Math.PI) * 3}deg` }] : []),
    ],
  }));

  return <Reanimated.View style={[style, animatedStyle]}>{children}</Reanimated.View>;
};

const styles = StyleSheet.create({
  marqueeClip: {
    overflow: 'hidden',
  },
  marqueeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  marqueeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
