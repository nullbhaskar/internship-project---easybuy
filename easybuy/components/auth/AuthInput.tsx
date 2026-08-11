import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Animated,
  KeyboardTypeOptions,
  StyleProp,
  ViewStyle,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { AnimatedEyeIcon } from './AnimatedEyeIcon';

interface AuthInputProps {
  label?: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  iconName?: keyof typeof Ionicons.glyphMap;
  icon?: keyof typeof Ionicons.glyphMap;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  error?: string;
  isPassword?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  accessibilityLabel?: string;
  containerStyle?: StyleProp<ViewStyle>;
  onFocusStateChange?: (focused: boolean) => void;
  isInactive?: boolean;
  maxLength?: number;
}

export const AuthInput: React.FC<AuthInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  iconName = 'mail-outline',
  icon,
  secureTextEntry = false,
  keyboardType = 'default',
  error,
  isPassword = false,
  autoCapitalize = 'none',
  accessibilityLabel,
  containerStyle,
  onFocusStateChange,
  isInactive = false,
  maxLength,
}) => {
  const activeIcon = icon || iconName;
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Focus Animations
  const focusAnim = useRef(new Animated.Value(0)).current;
  const iconScaleAnim = useRef(new Animated.Value(1)).current;
  const inactiveAnim = useRef(new Animated.Value(0)).current;

  // Floating Badge Animations
  const labelSlideAnim = useRef(new Animated.Value(8)).current;
  const labelOpacityAnim = useRef(new Animated.Value(0)).current;

  // Horizontal Shake Driver on Error (220ms)
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Text Fade Transition Driver for Password Visibility Toggle
  const textFadeAnim = useRef(new Animated.Value(1)).current;

  // Handle inactive state transitions
  useEffect(() => {
    Animated.timing(inactiveAnim, {
      toValue: isInactive ? 1 : 0,
      duration: 250,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [isInactive]);

  // Trigger shake when error is present
  useEffect(() => {
    if (error) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: -4, duration: 55, useNativeDriver: false }),
        Animated.timing(shakeAnim, { toValue: 4, duration: 55, useNativeDriver: false }),
        Animated.timing(shakeAnim, { toValue: -2, duration: 55, useNativeDriver: false }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 55, useNativeDriver: false }),
      ]).start();
    }
  }, [error]);

  const handleFocus = () => {
    setIsFocused(true);
    if (onFocusStateChange) onFocusStateChange(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

    // Icon Micro-Interaction: 1.0 → 1.08 → 1.0 over 180ms
    Animated.sequence([
      Animated.timing(iconScaleAnim, {
        toValue: 1.08,
        duration: 90,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }),
      Animated.timing(iconScaleAnim, {
        toValue: 1.0,
        duration: 90,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }),
    ]).start();

    // Field Focus Transition: 250ms cubic-bezier
    Animated.parallel([
      Animated.timing(focusAnim, {
        toValue: 1,
        duration: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(labelSlideAnim, {
        toValue: -2,
        duration: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(labelOpacityAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (onFocusStateChange) onFocusStateChange(false);

    Animated.parallel([
      Animated.timing(focusAnim, {
        toValue: 0,
        duration: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(labelSlideAnim, {
        toValue: 8,
        duration: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(labelOpacityAnim, {
        toValue: value ? 0.85 : 0,
        duration: 220,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handleTextChange = (text: string) => {
    onChangeText(text);
  };

  const handleEyeToggle = () => {
    // Subtle opacity transition during password text reveal
    Animated.sequence([
      Animated.timing(textFadeAnim, { toValue: 0.4, duration: 60, useNativeDriver: false }),
      Animated.timing(textFadeAnim, { toValue: 1.0, duration: 90, useNativeDriver: false }),
    ]).start();

    setShowPassword((prev) => !prev);
  };

  // Interpolations
  const focusScale = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1.0, 1.01],
  });

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [error ? '#EF4444' : '#E2E8F0', '#2D6B42'],
  });

  const backgroundColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#F8FAFC', '#FFFFFF'],
  });

  const iconBgColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(45, 107, 66, 0.06)', 'rgba(45, 107, 66, 0.14)'],
  });

  const shadowOpacity = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.03, 0.18],
  });

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Floating Badge Label */}
      <Animated.View
        style={[
          styles.badgeLabelContainer,
          {
            opacity: labelOpacityAnim,
            transform: [{ translateY: labelSlideAnim }],
          },
        ]}
      >
        <Text style={styles.badgeLabelText}>
          {placeholder.toUpperCase()}
        </Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.inputScaleContainer,
          {
            transform: [
              { scale: focusScale },
              { translateX: shakeAnim },
            ],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.inputWrapper,
            {
              borderColor,
              backgroundColor,
              borderWidth: isFocused ? 1.8 : 1,
              shadowOpacity,
            },
          ]}
        >
          {/* Left Icon Badge with Scale Micro-Interaction */}
          <Animated.View
            style={[
              styles.iconBox,
              {
                backgroundColor: iconBgColor,
                transform: [{ scale: iconScaleAnim }],
              },
            ]}
          >
            <Ionicons
              name={activeIcon as any}
              size={18}
              color={isFocused ? '#2D6B42' : '#475569'}
            />
          </Animated.View>

          {/* Text Input */}
          <Animated.View style={[styles.textInputWrapper, { opacity: textFadeAnim }]}>
            <TextInput
              style={styles.textInput}
              placeholder={isFocused ? '' : placeholder}
              placeholderTextColor="#94A3B8"
              value={value}
              onChangeText={handleTextChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              secureTextEntry={isPassword && !showPassword}
              keyboardType={keyboardType}
              autoCapitalize={autoCapitalize}
              maxLength={maxLength}
              accessible={true}
              accessibilityLabel={accessibilityLabel || placeholder}
            />
          </Animated.View>

          {/* Custom Animated Eye Reveal Icon */}
          {isPassword && (
            <AnimatedEyeIcon
              isVisible={showPassword}
              onToggle={handleEyeToggle}
              isFocused={isFocused}
            />
          )}
        </Animated.View>
      </Animated.View>

      {/* Inline Validation Error Message */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
    position: 'relative',
  },
  badgeLabelContainer: {
    position: 'absolute',
    top: -9,
    left: 14,
    zIndex: 10,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  badgeLabelText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2D6B42',
    letterSpacing: 0.6,
  },
  inputScaleContainer: {
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    borderRadius: 16,
    paddingHorizontal: 12,
    shadowColor: '#2D6B42',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textInputWrapper: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
  },
  textInput: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    height: '100%',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    marginLeft: 14,
  },
});
