import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

interface Props {
  iconName: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  actionText?: string;
  onAction?: () => void;
  isDark?: boolean;
}

export function EmptyStateView({ iconName, title, subtitle, actionText, onAction, isDark }: Props) {
  const router = useRouter();

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View style={[styles.iconContainer, isDark && styles.iconContainerDark]}>
        <Ionicons name={iconName} size={48} color={isDark ? '#F8FAFC' : '#0F172A'} />
      </View>
      <Text style={[styles.title, isDark && styles.textLight]}>{title}</Text>
      <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>{subtitle}</Text>
      
      {(actionText && onAction) ? (
        <TouchableOpacity
          style={[styles.button, isDark && styles.buttonDark]}
          onPress={() => {
            Haptics.selectionAsync().catch(() => {});
            onAction();
          }}
          activeOpacity={0.8}
        >
          <Text style={[styles.buttonText, isDark && styles.buttonTextDark]}>{actionText}</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.button, isDark && styles.buttonDark]}
          onPress={() => {
            Haptics.selectionAsync().catch(() => {});
            router.push('/home');
          }}
          activeOpacity={0.8}
        >
          <Text style={[styles.buttonText, isDark && styles.buttonTextDark]}>Go to Home</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 300,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: 'transparent',
  },
  containerDark: {
    backgroundColor: '#0F172A',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  iconContainerDark: {
    backgroundColor: '#1E293B',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  textLight: {
    color: '#F8FAFC',
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  subtitleDark: {
    color: '#94A3B8',
  },
  button: {
    backgroundColor: '#0F172A',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  buttonDark: {
    backgroundColor: '#F8FAFC',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextDark: {
    color: '#0F172A',
  },
});
