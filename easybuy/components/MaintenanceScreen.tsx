import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useMaintenance } from '../context/MaintenanceContext';

const { width, height } = Dimensions.get('window');

export default function MaintenanceScreen() {
  const { isMaintenanceMode } = useMaintenance();

  if (!isMaintenanceMode) return null;

  return (
    <Animated.View 
      entering={FadeIn.duration(400)} 
      exiting={FadeOut.duration(400)} 
      style={styles.container}
    >
      <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />
      <Animated.View 
        entering={SlideInDown.springify().damping(15)} 
        exiting={SlideOutDown} 
        style={styles.content}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="construct-outline" size={64} color="#F59E0B" />
        </View>
        <Text style={styles.title}>System Maintenance</Text>
        <Text style={styles.subtitle}>
          EasyBuy servers are currently down for scheduled upgrades and maintenance. We'll be back online shortly with an even better shopping experience!
        </Text>
        
        <View style={styles.statusIndicator}>
          <View style={styles.pulseDot} />
          <Text style={styles.statusText}>Engineers are working on it...</Text>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99998, // Just below OfflineScreen
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  content: {
    width: width * 0.85,
    maxWidth: 400,
    backgroundColor: '#1C1C1E',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 10,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 15,
    color: '#A1A1AA',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
    marginRight: 10,
  },
  statusText: {
    color: '#F59E0B',
    fontSize: 13,
    fontWeight: '500',
  },
});
