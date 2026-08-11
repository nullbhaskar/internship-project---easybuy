import React, { useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface SocialButtonProps {
  provider: 'google' | 'apple' | 'facebook';
  label: string;
  onPress: () => void;
}

export const SocialButton: React.FC<SocialButtonProps> = ({
  provider,
  label,
  onPress,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Haptics.selectionAsync().catch(() => {});
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: false,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1.0,
      friction: 5,
      tension: 120,
      useNativeDriver: false,
    }).start();
  };

  const getIcon = () => {
    switch (provider) {
      case 'google':
        return <Ionicons name="logo-google" size={18} color="#EA4335" />;
      case 'apple':
        return <Ionicons name="logo-apple" size={20} color="#000000" />;
      case 'facebook':
        return <Ionicons name="logo-facebook" size={20} color="#1877F2" />;
    }
  };

  return (
    <Animated.View style={{ flex: 1, transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={styles.button}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`Sign in with ${label}`}
      >
        {getIcon()}
        <Text style={styles.text}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
    paddingHorizontal: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
});
