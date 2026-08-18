import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Animated,
  Easing,
  Dimensions,
  Image,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  isDarkMode?: boolean;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  isDarkMode = false,
}) => {
  const router = useRouter();

  // Animation values
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const cardOpacityAnim = useRef(new Animated.Value(0)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Spring scale + Fade in
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6.5,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacityAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset values
      scaleAnim.setValue(0.85);
      cardOpacityAnim.setValue(0);
      backdropOpacity.setValue(0);
    }
  }, [visible]);

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.85,
        duration: 220,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacityAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const handleSelectQuickBuy = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.85,
        duration: 200,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
      router.push('/quickbuy');
    });
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* BLUR BACKGROUND BACKDROP */}
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: backdropOpacity }]}>
          <BlurView
            intensity={60}
            tint={isDarkMode ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          >
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={handleClose}
            />
          </BlurView>
        </Animated.View>

        {/* CENTERED DIALOG CARD WITH FROSTED GLASS TRANSLUCENCY */}
        <Animated.View
          style={[
            styles.dialogCardWrapper,
            {
              opacity: cardOpacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <BlurView
            intensity={85}
            tint={isDarkMode ? 'dark' : 'light'}
            style={[
              styles.dialogCard,
              isDarkMode ? styles.dialogCardDark : styles.dialogCardLight,
            ]}
          >
            {/* HEADER */}
            <View style={styles.header}>
              <Text style={[styles.headerTitle, isDarkMode && { color: '#F8FAFC' }]}>
                Select Store Mode
              </Text>
              <TouchableOpacity
                onPress={handleClose}
                activeOpacity={0.7}
                style={[styles.closeBtnCircle, isDarkMode && styles.closeBtnCircleDark]}
              >
                <Ionicons name="close" size={16} color={isDarkMode ? '#94A3B8' : '#64748B'} />
              </TouchableOpacity>
            </View>

            {/* STORE MODE SWITCHER BOXES */}
            <View style={styles.switchContainer}>
              {/* EASYBUY HOME (ACTIVE) */}
              <TouchableOpacity
                style={[
                  styles.switchBox,
                  styles.switchBoxActive,
                  isDarkMode && styles.switchBoxActiveDark,
                ]}
                onPress={handleClose}
                activeOpacity={0.9}
              >
                {/* Card Background Image */}
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop&q=80' }}
                  style={styles.cardBgImage}
                />
                {/* Shading overlay layer */}
                <View style={styles.cardGradientOverlay} />

                {/* Title overlay pill */}
                <View style={styles.titlePill}>
                  <Text style={styles.cardTitleText}>EasyBuy Home</Text>
                </View>

                {/* Subtitle / badge info overlay pill */}
                <View style={styles.badgePill}>
                  <Ionicons name="home" size={10} color="#FFA451" />
                  <Text style={styles.cardBadgeText}>Standard</Text>
                </View>

                {/* Floating selection checkmark badge */}
                <View style={styles.floatingActionCircle}>
                  <Ionicons name="checkmark" size={14} color="#FFA451" />
                </View>
              </TouchableOpacity>

              {/* QUICKBUY (INACTIVE -> NAVIGATES) */}
              <TouchableOpacity
                style={[
                  styles.switchBox,
                  styles.switchBoxInactive,
                  isDarkMode && styles.switchBoxInactiveDark,
                ]}
                onPress={handleSelectQuickBuy}
                activeOpacity={0.9}
              >
                {/* Card Background Image */}
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=300&auto=format&fit=crop&q=80' }}
                  style={styles.cardBgImage}
                />
                {/* Shading overlay layer */}
                <View style={styles.cardGradientOverlay} />

                {/* Title overlay pill */}
                <View style={styles.titlePill}>
                  <Text style={styles.cardTitleText}>QuickBuy</Text>
                </View>

                {/* Subtitle / badge info overlay pill */}
                <View style={styles.badgePill}>
                  <Ionicons name="flash" size={10} color="#FFA451" />
                  <Text style={styles.cardBadgeText}>10-20 min 🛵</Text>
                </View>

                {/* Floating action circle */}
                <View style={[styles.floatingActionCircle, { backgroundColor: 'rgba(255, 255, 255, 0.75)' }]}>
                  <Ionicons name="arrow-forward" size={14} color="#64748B" />
                </View>
              </TouchableOpacity>
            </View>
          </BlurView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  dialogCardWrapper: {
    width: '90%',
    maxWidth: 360,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.25,
    shadowRadius: 30,
    elevation: 12,
  },
  dialogCard: {
    width: '100%',
    borderRadius: 24,
    paddingTop: 24,
    paddingBottom: 28,
    paddingHorizontal: 20,
    overflow: 'hidden',
  },
  dialogCardLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.75)',
  },
  dialogCardDark: {
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  closeBtnCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnCircleDark: {
    backgroundColor: '#334155',
  },
  switchContainer: {
    flexDirection: 'row',
    gap: 14,
  },
  switchBox: {
    flex: 1,
    height: 220,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  switchBoxInactive: {
    borderColor: '#E2E8F0',
  },
  switchBoxInactiveDark: {
    borderColor: '#334155',
  },
  switchBoxActive: {
    borderColor: '#FFA451',
    shadowColor: '#FFA451',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  switchBoxActiveDark: {
    borderColor: '#FFA451',
  },
  cardBgImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cardGradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.38)',
  },
  titlePill: {
    position: 'absolute',
    bottom: 48,
    left: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    borderRadius: 12,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  cardTitleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  badgePill: {
    position: 'absolute',
    bottom: 12,
    left: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 8,
    paddingVertical: 3,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  floatingActionCircle: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});
