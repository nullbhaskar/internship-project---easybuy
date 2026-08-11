import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BenefitItemProps {
  iconName: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
}

export const BenefitItem: React.FC<BenefitItemProps> = ({
  iconName,
  title,
  subtitle,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconBox}>
        <Ionicons name={iconName} size={14} color="#2D6B42" />
      </View>
      <View style={styles.textWrapper}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    gap: 6,
  },
  iconBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(45, 107, 66, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textWrapper: {
    flex: 1,
  },
  title: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1E293B',
  },
  subtitle: {
    fontSize: 9,
    fontWeight: '500',
    color: '#64748B',
  },
});
