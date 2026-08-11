import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Modal,
  TouchableWithoutFeedback,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageCode } from '../../constants/translations';

const LANGUAGE_OPTIONS: { code: LanguageCode; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'bn', label: 'বাংলা' },
];

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  // 60 FPS Butter-Smooth Animation Drivers
  const dropdownAnim = useRef(new Animated.Value(0)).current;
  const arrowRotateAnim = useRef(new Animated.Value(0)).current;
  const pillScaleAnim = useRef(new Animated.Value(1)).current;

  const currentOption = LANGUAGE_OPTIONS.find((opt) => opt.code === language) || LANGUAGE_OPTIONS[0];

  const openMenu = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setIsOpen(true);

    // Pill Micro-Scale Feedback
    Animated.sequence([
      Animated.timing(pillScaleAnim, { toValue: 0.95, duration: 60, useNativeDriver: false }),
      Animated.spring(pillScaleAnim, { toValue: 1.0, friction: 5, tension: 140, useNativeDriver: false }),
    ]).start();

    // Menu Dropdown Entrance (Scale 0.92 -> 1, Slide -10px -> 0, Opacity 0 -> 1)
    Animated.parallel([
      Animated.spring(dropdownAnim, {
        toValue: 1,
        friction: 6,
        tension: 130,
        useNativeDriver: false,
      }),
      Animated.timing(arrowRotateAnim, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();
  };

  const closeMenu = (callback?: () => void) => {
    Animated.parallel([
      Animated.timing(dropdownAnim, {
        toValue: 0,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(arrowRotateAnim, {
        toValue: 0,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start(() => {
      setIsOpen(false);
      if (callback) callback();
    });
  };

  const handleSelectLanguage = (code: LanguageCode) => {
    Haptics.selectionAsync().catch(() => {});
    closeMenu(() => {
      setLanguage(code);
    });
  };

  const arrowRotation = arrowRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const menuScale = dropdownAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.92, 1.0],
  });

  const menuTranslateY = dropdownAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-10, 0],
  });

  return (
    <View style={styles.container}>
      {/* SINGLE CLEAN LANGUAGE SELECTOR PILL (NO FLAGS) */}
      <Animated.View style={{ transform: [{ scale: pillScaleAnim }] }}>
        <TouchableOpacity
          style={styles.langPill}
          onPress={isOpen ? () => closeMenu() : openMenu}
          activeOpacity={0.8}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Select language"
        >
          <Ionicons name="globe-outline" size={14} color="#2D6B42" />
          <Text style={styles.langText}>{currentOption.label}</Text>
          <Animated.View style={{ transform: [{ rotate: arrowRotation }] }}>
            <Ionicons name="chevron-down" size={13} color="#2D6B42" />
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>

      {/* DROPDOWN POPUP MENU MODAL */}
      <Modal
        visible={isOpen}
        transparent={true}
        animationType="none"
        onRequestClose={() => closeMenu()}
      >
        <TouchableWithoutFeedback onPress={() => closeMenu()}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <Animated.View
                style={[
                  styles.dropdownMenu,
                  {
                    opacity: dropdownAnim,
                    transform: [
                      { scale: menuScale },
                      { translateY: menuTranslateY },
                    ],
                  },
                ]}
              >
                {LANGUAGE_OPTIONS.map((item) => {
                  const isSelected = item.code === language;
                  return (
                    <TouchableOpacity
                      key={item.code}
                      style={[
                        styles.menuItem,
                        isSelected && styles.selectedMenuItem,
                      ]}
                      onPress={() => handleSelectLanguage(item.code)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.menuItemText,
                          isSelected && styles.selectedMenuItemText,
                        ]}
                      >
                        {item.label}
                      </Text>
                      {isSelected && (
                        <Ionicons name="checkmark" size={16} color="#2D6B42" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 100,
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  langText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2D6B42',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 54,
    paddingRight: 24,
  },
  dropdownMenu: {
    width: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 6,
    shadowColor: '#2D6B42',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(45, 107, 66, 0.12)',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  selectedMenuItem: {
    backgroundColor: 'rgba(45, 107, 66, 0.08)',
  },
  menuItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  selectedMenuItemText: {
    color: '#2D6B42',
    fontWeight: '700',
  },
});
