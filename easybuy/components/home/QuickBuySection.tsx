import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Animated,
  Easing,
  Dimensions,
  Vibration,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface QuickBuyItemData {
  id: string;
  name: string;
  time?: string;
  bg: string;
  image?: string;
  isMore?: boolean;
}

interface QuickBuySectionProps {
  items: QuickBuyItemData[];
  isDarkMode?: boolean;
  onSeeAll?: () => void;
  onSelectItem?: (item: QuickBuyItemData) => void;
}

const ITEM_WIDTH = 58;
const ITEM_GAP = 10;
const SNAP_INTERVAL = ITEM_WIDTH + ITEM_GAP;

export const QuickBuySection: React.FC<QuickBuySectionProps> = ({
  items,
  isDarkMode = false,
  onSeeAll,
  onSelectItem,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<QuickBuyItemData | null>(null);
  const [scrollXOffset, setScrollXOffset] = useState(0);

  // 1. Initial Load Card Animation
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(10)).current;

  // 2. Staggered Entry & Press Scale
  const itemAnimValues = useRef(items.map(() => new Animated.Value(0))).current;
  const pressScaleValues = useRef(items.map(() => new Animated.Value(1))).current;

  // 3. Green Delivery Dot Pulse
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // 4. See All Arrow Slide
  const seeAllArrowX = useRef(new Animated.Value(0)).current;

  // 5. 6-Second Premium Shine Sweep
  const shineAnim = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    // ─── 1. Card Entry Animation (500ms) ───
    Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(cardTranslateY, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // ─── Staggered Item Appearance (60ms delay per item) ───
    const staggeredAnimations = items.map((_, index) =>
      Animated.timing(itemAnimValues[index], {
        toValue: 1,
        duration: 350,
        delay: index * 60,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      })
    );
    Animated.parallel(staggeredAnimations).start();

    // ─── Delivery Indicator Green Dot Pulse (2s Loop) ───
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.35,
          duration: 1000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // ─── Premium Shine Sweep Every 6 Seconds ───
    const triggerShine = () => {
      shineAnim.setValue(-1);
      Animated.timing(shineAnim, {
        toValue: 2,
        duration: 1800,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }).start();
    };

    triggerShine();
    const shineInterval = setInterval(triggerShine, 6000);

    return () => {
      clearInterval(shineInterval);
    };
  }, []);

  // See All Button Interaction
  const handleSeeAllPressIn = () => {
    Animated.timing(seeAllArrowX, {
      toValue: 4,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const handleSeeAllPressOut = () => {
    Animated.timing(seeAllArrowX, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  // Item Press Bounce Animation
  const handleItemPressIn = (index: number) => {
    Animated.timing(pressScaleValues[index], {
      toValue: 0.94,
      duration: 100,
      useNativeDriver: false,
    }).start();
  };

  const handleItemPressOut = (index: number, item: QuickBuyItemData) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setSelectedId(item.id);

    Animated.sequence([
      Animated.spring(pressScaleValues[index], {
        toValue: 1.05,
        friction: 4,
        tension: 180,
        useNativeDriver: false,
      }),
      Animated.spring(pressScaleValues[index], {
        toValue: 1,
        friction: 6,
        tension: 140,
        useNativeDriver: false,
      }),
    ]).start();

    if (onSelectItem) {
      onSelectItem(item);
    }
  };

  // Long Press Preview Handler
  const handleLongPress = (item: QuickBuyItemData) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    Vibration.vibrate(30);
    setPreviewItem(item);
    setTimeout(() => setPreviewItem(null), 1800);
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = event.nativeEvent.contentOffset.x;
    setScrollXOffset(x);
  };

  const shineTranslateX = shineAnim.interpolate({
    inputRange: [-1, 2],
    outputRange: [-SCREEN_WIDTH * 0.5, SCREEN_WIDTH * 1.2],
  });

  return (
    <View
      style={[
        styles.container,
        isDarkMode && styles.containerDark,
      ]}
    >
      {/* ─── Premium Shine Sweep Light Line ─── */}
      <Animated.View
        style={[
          styles.shineLine,
          {
            transform: [{ translateX: shineTranslateX }, { rotate: '25deg' }],
          },
        ]}
      />

      {/* ─── QuickBuy Header ─── */}
      <View style={styles.header}>
        <View style={styles.titleGroup}>
          <Ionicons name="flash" size={16} color="#F59E0B" />
          <Text style={styles.titleText}>QuickBuy</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>10–20 min 🛵</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={onSeeAll}
          onPressIn={handleSeeAllPressIn}
          onPressOut={handleSeeAllPressOut}
          activeOpacity={0.8}
          style={styles.seeAllBtn}
        >
          <Text style={styles.seeAllText}>See all</Text>
          <Animated.View style={{ transform: [{ translateX: seeAllArrowX }] }}>
            <Ionicons name="chevron-forward" size={13} color="#94A3B8" />
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* ─── Long Press Toast Tooltip ─── */}
      {previewItem && (
        <View style={styles.previewTooltip}>
          <Text style={styles.previewText}>⚡ Express 10-Min: {previewItem.name}</Text>
        </View>
      )}

      {/* ─── Professional Horizontal Scroll with Smooth Cross-Platform Swipe Fade ─── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={SNAP_INTERVAL}
        decelerationRate="fast"
        scrollEventThrottle={16}
        onScroll={handleScroll}
        contentContainerStyle={styles.scrollContent}
      >
        {items.map((item, idx) => {
          // Dynamic Scroll-Driven Fade & Focus Scale (Bulletproof for Web, iOS & Android)
          const centerOffset = idx * SNAP_INTERVAL;
          const distanceFromCenter = Math.abs(scrollXOffset - centerOffset);
          const normDist = Math.min(distanceFromCenter / (SNAP_INTERVAL * 2), 1);
          
          // Smooth 1.0 -> 0.65 Opacity & 1.0 -> 0.94 Scale
          const swipeOpacity = 1 - normDist * 0.35;
          const swipeScale = 1 - normDist * 0.06;

          const isSelected = selectedId === item.id;

          return (
            <View
              key={item.id}
              style={styles.itemWrapper}
            >
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => onSelectItem && onSelectItem(item)}
                onPressOut={() => handleItemPressOut(idx, item)}
                onLongPress={() => handleLongPress(item)}
                style={styles.touchableCard}
              >
                {/* Avatar Ring */}
                <View
                  style={[
                    styles.avatarRing,
                    isSelected && styles.selectedAvatarRing,
                    { backgroundColor: item.bg },
                  ]}
                >
                  {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.productImg} resizeMode="cover" />
                  ) : (
                    <Ionicons name="grid-outline" size={22} color="#FFFFFF" />
                  )}
                </View>

                {/* Title */}
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.name}
                </Text>

                {/* Pulsing Green Delivery Indicator */}
                {item.time ? (
                  <View style={styles.timeRow}>
                    <Animated.View
                      style={[
                        styles.greenPulseDot,
                        { transform: [{ scale: pulseAnim }] },
                      ]}
                    />
                    <Text style={styles.timeText}>{item.time}</Text>
                  </View>
                ) : (
                  <Text style={[styles.timeText, { color: '#94A3B8' }]}>Explore</Text>
                )}
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#061E14', // Deep Obsidian Emerald
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 12,
    overflow: 'hidden',
    position: 'relative',
    elevation: 6,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
    marginBottom: 16,
  },
  containerDark: {
    backgroundColor: '#04140D',
    borderColor: 'rgba(34, 197, 94, 0.25)',
  },
  shineLine: {
    position: 'absolute',
    top: -20,
    left: 0,
    width: 45,
    height: 140,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    zIndex: 10,
    pointerEvents: 'none',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  badge: {
    backgroundColor: '#451A03',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#78350F',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FB923C',
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  previewTooltip: {
    position: 'absolute',
    top: 6,
    alignSelf: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#38BDF8',
    zIndex: 30,
  },
  previewText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#38BDF8',
  },
  scrollContent: {
    gap: ITEM_GAP,
    paddingRight: 6,
  },
  itemWrapper: {
    width: ITEM_WIDTH,
    alignItems: 'center',
  },
  touchableCard: {
    alignItems: 'center',
    width: '100%',
  },
  avatarRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  selectedAvatarRing: {
    borderColor: '#22C55E',
    borderWidth: 2,
    shadowColor: '#22C55E',
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  productImg: {
    width: '100%',
    height: '100%',
  },
  itemName: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 5,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  greenPulseDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#22C55E',
  },
  timeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#22C55E',
  },
});
