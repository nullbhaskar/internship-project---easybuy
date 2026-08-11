import React, { useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import * as Haptics from 'expo-haptics';

interface AnimatedEyeIconProps {
  isVisible: boolean;
  onToggle: () => void;
  isFocused?: boolean;
}

export const AnimatedEyeIcon: React.FC<AnimatedEyeIconProps> = ({
  isVisible,
  onToggle,
  isFocused = false,
}) => {
  // 60 FPS Animated Drivers
  const pressScaleAnim = useRef(new Animated.Value(1)).current;
  const settleScaleAnim = useRef(new Animated.Value(1)).current;

  // Eyelid, Iris, Glint, and Lash Slash Drivers
  const openProgressAnim = useRef(new Animated.Value(isVisible ? 1 : 0)).current;

  // Sync state if changed externally
  useEffect(() => {
    Animated.timing(openProgressAnim, {
      toValue: isVisible ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [isVisible]);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

    // 1. Tiny Press Scale Response (0–50ms: 1.0 → 0.94 → 1.0)
    Animated.sequence([
      Animated.timing(pressScaleAnim, {
        toValue: 0.94,
        duration: 40,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }),
      Animated.timing(pressScaleAnim, {
        toValue: 1.0,
        duration: 40,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }),
    ]).start();

    // Trigger toggle around middle of animation (~140ms)
    setTimeout(() => {
      onToggle();
    }, 130);

    // 2. Full Eye Reveal / Close Transition (220–280ms total)
    if (!isVisible) {
      // OPENING: Eyelid opens → Iris appears → Highlight glints → Settle
      Animated.sequence([
        Animated.timing(openProgressAnim, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        // Tiny Settle (180–260ms: 1.02 → 1.0)
        Animated.sequence([
          Animated.timing(settleScaleAnim, { toValue: 1.02, duration: 40, useNativeDriver: false }),
          Animated.timing(settleScaleAnim, { toValue: 1.0, duration: 40, useNativeDriver: false }),
        ]),
      ]).start();
    } else {
      // CLOSING: Iris fades → Eyelid closes → Slash appears → Settle
      Animated.sequence([
        Animated.timing(openProgressAnim, {
          toValue: 0,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.sequence([
          Animated.timing(settleScaleAnim, { toValue: 1.02, duration: 40, useNativeDriver: false }),
          Animated.timing(settleScaleAnim, { toValue: 1.0, duration: 40, useNativeDriver: false }),
        ]),
      ]).start();
    }
  };

  // Interpolations
  const eyelidHeight = openProgressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [12, 0], // Eyelid height closes down to 12px, opens up to 0px
  });

  const irisScale = openProgressAnim.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0.6, 0.7, 1.0],
  });

  const irisOpacity = openProgressAnim.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0, 0.3, 1.0],
  });

  const glintOpacity = openProgressAnim.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [0, 0, 1.0],
  });

  const slashOpacity = openProgressAnim.interpolate({
    inputRange: [0, 0.6, 1],
    outputRange: [1.0, 0.3, 0],
  });

  const slashRotate = openProgressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-42deg', '-20deg'],
  });

  const mainColor = isFocused ? '#2D6B42' : '#64748B';

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      style={styles.touchTarget}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={isVisible ? 'Hide password' : 'Show password'}
    >
      <Animated.View
        style={[
          styles.eyeContainer,
          {
            transform: [
              { scale: pressScaleAnim },
              { scale: settleScaleAnim },
            ],
          },
        ]}
      >
        {/* Curved Eye Contour / Sclera Boundary */}
        <View style={[styles.eyeShape, { borderColor: mainColor }]}>
          {/* Iris and Pupil Layer */}
          <Animated.View
            style={[
              styles.iris,
              {
                backgroundColor: isFocused ? '#2D6B42' : '#334155',
                opacity: irisOpacity,
                transform: [{ scale: irisScale }],
              },
            ]}
          >
            {/* Tiny Glint Highlight Dot */}
            <Animated.View style={[styles.glint, { opacity: glintOpacity }]} />
          </Animated.View>

          {/* Upper Eyelid Mask (Sliding down when closed) */}
          <Animated.View
            style={[
              styles.eyelid,
              {
                height: eyelidHeight,
                backgroundColor: '#FFFFFF',
              },
            ]}
          />
        </View>

        {/* Diagonal Slash Line when Password is Hidden */}
        <Animated.View
          style={[
            styles.slashLine,
            {
              backgroundColor: mainColor,
              opacity: slashOpacity,
              transform: [{ rotate: slashRotate }],
            },
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchTarget: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  eyeShape: {
    width: 21,
    height: 13,
    borderRadius: 7,
    borderWidth: 1.8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  iris: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 1,
    paddingRight: 1,
  },
  glint: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#FFFFFF',
  },
  eyelid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
  },
  slashLine: {
    position: 'absolute',
    width: 22,
    height: 2,
    borderRadius: 1,
  },
});
