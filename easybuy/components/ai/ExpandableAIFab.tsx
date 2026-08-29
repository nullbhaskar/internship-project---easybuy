/**
 * ExpandableAIFab — 3D Meta Orb with Sleek Speed Dial
 *
 * - Liquid 3D morphing core with unbreakable Reanimated physics.
 * - Premium vertical speed dial menu (as requested).
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Pressable, 
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

const ORB_SIZE = 56;
const R = ORB_SIZE / 2;
const FAB_GRAD: [string, string] = ['#7C3AED', '#4C1D95'];

interface ExpandableAIFabProps {
  onOpenVoice: () => void;
  onOpenChat: () => void;
  closeSignal?: number;
}

export const ExpandableAIFab: React.FC<ExpandableAIFabProps> = ({ onOpenVoice, onOpenChat, closeSignal }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const menuAnim = useSharedValue(0);

  // Auto-close when user scrolls (closeSignal increments each time)
  useEffect(() => {
    if (closeSignal && closeSignal > 0) {
      setIsOpen(false);
      menuAnim.value = withSpring(0, { mass: 0.6, damping: 20, stiffness: 200 });
    }
  }, [closeSignal]);
  
  // ─── Un-stoppable UI Thread Physics ──────────────────────────────────────
  const rotateVal = useSharedValue(0);
  const tl = useSharedValue(R);
  const tr = useSharedValue(R);
  const bl = useSharedValue(R);
  const br = useSharedValue(R);
  const breath = useSharedValue(1);

  useEffect(() => {
    if (isOpen) {
      rotateVal.value = withRepeat(withTiming(360, { duration: 2500, easing: Easing.linear }), -1, false);
      
      tl.value = withRepeat(withTiming(16, { duration: 1100, easing: Easing.inOut(Easing.ease) }), -1, true);
      tr.value = withRepeat(withTiming(20, { duration: 1400, easing: Easing.inOut(Easing.ease) }), -1, true);
      bl.value = withRepeat(withTiming(18, { duration: 1700, easing: Easing.inOut(Easing.ease) }), -1, true);
      br.value = withRepeat(withTiming(16, { duration: 1300, easing: Easing.inOut(Easing.ease) }), -1, true);
      
      breath.value = withRepeat(withTiming(1.06, { duration: 900, easing: Easing.inOut(Easing.ease) }), -1, true);
    } else {
      rotateVal.value = 0;
      breath.value = withTiming(1, { duration: 300 });
      tl.value = withTiming(R, { duration: 300 });
      tr.value = withTiming(R, { duration: 300 });
      bl.value = withTiming(R, { duration: 300 });
      br.value = withTiming(R, { duration: 300 });
    }
  }, [isOpen]);

  const toggle = useCallback(() => {
    const next = !isOpen;
    setIsOpen(next);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    menuAnim.value = withSpring(next ? 1 : 0, {
      mass: 1,
      damping: 16,
      stiffness: 140,
    });
  }, [isOpen, menuAnim]);

  const handleVoice = useCallback(() => {
    toggle();
    setTimeout(onOpenVoice, 200);
  }, [toggle, onOpenVoice]);

  const handleChat = useCallback(() => {
    toggle();
    setTimeout(onOpenChat, 200);
  }, [toggle, onOpenChat]);

  // ─── Animated Styles ─────────────────────────────────────────────────────
  
  // Staggered spring animations for the speed dial items
  const askAiStyle = useAnimatedStyle(() => {
    const progress = interpolate(menuAnim.value, [0, 0.8], [0, 1], 'clamp');
    return {
      opacity: progress,
      transform: [
        { translateY: interpolate(progress, [0, 1], [0, -85]) },
        { scale: interpolate(progress, [0, 1], [0.4, 1]) },
      ],
    };
  });

  
  const auraOpacityStyle = useAnimatedStyle(() => ({
    opacity: interpolate(menuAnim.value, [0, 0.5, 1], [0, 0, 1], 'clamp'),
  }));

  const idleOpacityStyle = useAnimatedStyle(() => ({
    opacity: interpolate(menuAnim.value, [0, 0.5], [1, 0], 'clamp'),
  }));

  const maskStyle = useAnimatedStyle(() => ({
    borderTopLeftRadius: tl.value,
    borderTopRightRadius: tr.value,
    borderBottomLeftRadius: bl.value,
    borderBottomRightRadius: br.value,
    transform: [{ scale: breath.value }]
  }));

  const rotateStyle1 = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotateVal.value}deg` }] }));
  const rotateStyle2 = useAnimatedStyle(() => ({ transform: [{ rotate: `${-rotateVal.value * 1.3}deg` }] }));
  const rotateStyle3 = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotateVal.value * 1.7}deg` }] }));

  return (
    <View style={styles.root} pointerEvents="box-none">


      
      {/* ─── SLEEK SPEED DIAL MENU ─── */}
      

      <Animated.View style={[styles.speedDialItem, askAiStyle]} pointerEvents={isOpen ? 'auto' : 'none'}>
        <View style={styles.speedDialLabelContainer}>
          <Text style={styles.speedDialLabel}>Ask AI</Text>
        </View>
        <TouchableOpacity style={styles.speedDialIcon} onPress={handleChat} activeOpacity={0.7}>
          <LinearGradient colors={['#1A0033', '#05001A']} style={StyleSheet.absoluteFill} />
          <Ionicons name="sparkles" size={16} color="#FF00FF" />
        </TouchableOpacity>
      </Animated.View>

      {/* ─── THE 3D META ORB ─── */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {
          if (isOpen) {
            handleVoice();
            toggle();
          } else {
            toggle();
          }
        }}
        style={styles.orbHitbox}
      >
        <Animated.View style={[styles.orbMask, maskStyle]}>
          
          {/* IDLE STATE: Premium Purple */}
          <Animated.View style={[StyleSheet.absoluteFill, idleOpacityStyle]}>
            <LinearGradient
              colors={FAB_GRAD}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.center}>
              <Ionicons name="sparkles" size={16} color="rgba(255,255,255,0.95)" />
            </View>
          </Animated.View>

          {/* ACTIVE STATE: Wobbly Liquid Aura */}
          <Animated.View style={[StyleSheet.absoluteFill, auraOpacityStyle, { backgroundColor: '#0D0026' }]}>
            
            {/* Spinning Cyan */}
            <Animated.View style={[styles.auraLayer, rotateStyle1]}>
              <LinearGradient 
                colors={['rgba(33, 212, 237, 1)', 'rgba(33, 212, 237, 0)']}
                start={{ x: 0.2, y: 0.2 }} end={{ x: 0.8, y: 0.8 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
            
            {/* Spinning Magenta */}
            <Animated.View style={[styles.auraLayer, rotateStyle2]}>
              <LinearGradient 
                colors={['rgba(140, 92, 245, 1)', 'rgba(140, 92, 245, 0)']}
                start={{ x: 0.8, y: 0.2 }} end={{ x: 0.2, y: 0.8 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>

            {/* Spinning Neon Green */}
            <Animated.View style={[styles.auraLayer, rotateStyle3]}>
              <LinearGradient 
                colors={['rgba(237, 71, 153, 1)', 'rgba(237, 71, 153, 0)']}
                start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>

            {/* 3D LIGHTING OVERLAYS */}
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              <LinearGradient 
                colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.9)']}
                start={{ x: 0, y: 0.4 }} end={{ x: 0, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            </View>
            <View style={styles.orbHighlight} pointerEvents="none" />

          <View style={styles.center} pointerEvents="none">
              <Ionicons name="mic" size={24} color="#FFFFFF" />
            </View>
          </Animated.View>

        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

// ─── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    bottom: 96,
    right: 18,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    zIndex: 9999,
  },
  // ─── Speed Dial Styles ───
  speedDialItem: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  speedDialLabelContainer: {
    backgroundColor: 'rgba(13, 0, 38, 0.85)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  speedDialLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  speedDialIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  
  // ─── Core Orb Styles ───
  orbHitbox: {
    width: ORB_SIZE,
    height: ORB_SIZE,
    borderRadius: ORB_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
  
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  orbMask: {
    width: ORB_SIZE,
    height: ORB_SIZE,
    borderRadius: ORB_SIZE / 2,
    overflow: 'hidden', 
  },
  auraLayer: {
    position: 'absolute',
    width: ORB_SIZE * 2.5, 
    height: ORB_SIZE * 2.5,
    top: -(ORB_SIZE * 2.5 - ORB_SIZE) / 2,     
    left: -(ORB_SIZE * 2.5 - ORB_SIZE) / 2,    
  },
  orbHighlight: {
    position: 'absolute',
    top: 4,
    left: '18%',
    right: '18%',
    height: '24%',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.4)', 
  },
  center: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
