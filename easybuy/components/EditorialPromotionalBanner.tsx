import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  Easing,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = SCREEN_WIDTH - 32;
const BANNER_GAP = 12;
const SNAP_INTERVAL = BANNER_WIDTH + BANNER_GAP;

export interface EditorialBannerData {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  ctaText: string;
  bgLight: string;
  bgDark: string;
  textColorLight: string;
  textColorDark: string;
  image: string;
  collectionId: string;
  stateCode?: string;
  featuredProduct?: {
    id: string;
    title: string;
    price: string;
    originalPrice?: string;
    discount?: string;
    image?: string;
  };
}

interface EditorialPromotionalBannerProps {
  banners: EditorialBannerData[];
  isDarkMode?: boolean;
  onPressBanner?: (banner: EditorialBannerData) => void;
  onPressCTA?: (banner: EditorialBannerData) => void;
}

export const EditorialPromotionalBanner: React.FC<EditorialPromotionalBannerProps> = ({
  banners,
  isDarkMode = false,
  onPressBanner,
  onPressCTA,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const scrollViewRef = useRef<any>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  // 1. Entrance Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const imageScaleAnim = useRef(new Animated.Value(0.94)).current;
  const textTranslateY = useRef(new Animated.Value(10)).current;

  // 2. CTA Press Animations
  const ctaScaleAnims = useRef(banners.map(() => new Animated.Value(1))).current;
  const ctaArrowXAnims = useRef(banners.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // ─── Coordinated Entrance Sequence (500–700ms) ───
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 550,
        useNativeDriver: true,
      }),
      Animated.spring(imageScaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 140,
        useNativeDriver: true,
      }),
      Animated.timing(textTranslateY, {
        toValue: 0,
        duration: 450,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // ─── Auto-Rotation Timer (6 Seconds) ───
  useEffect(() => {
    if (banners.length <= 1 || isUserInteracting) return;

    const timer = setInterval(() => {
      const nextIndex = (activeIndex + 1) % banners.length;
      setActiveIndex(nextIndex);
      scrollViewRef.current?.scrollTo({
        x: nextIndex * SNAP_INTERVAL,
        animated: true,
      });
    }, 6000);

    return () => clearInterval(timer);
  }, [activeIndex, banners.length, isUserInteracting]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = event.nativeEvent.contentOffset.x;
    const index = Math.round(x / SNAP_INTERVAL);
    if (index !== activeIndex && index >= 0 && index < banners.length) {
      setActiveIndex(index);
    }
  };

  const handleCtaPressIn = (idx: number) => {
    Animated.parallel([
      Animated.timing(ctaScaleAnims[idx], {
        toValue: 0.96,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(ctaArrowXAnims[idx], {
        toValue: 4,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleCtaPressOut = (idx: number) => {
    Animated.parallel([
      Animated.spring(ctaScaleAnims[idx], {
        toValue: 1,
        friction: 4,
        tension: 180,
        useNativeDriver: true,
      }),
      Animated.timing(ctaArrowXAnims[idx], {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  if (!banners || banners.length === 0) return null;

  return (
    <Animated.View style={[styles.outerContainer, { opacity: fadeAnim }]}>
      {/* ─── Horizontal Carousel ─── */}
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={SNAP_INTERVAL}
        snapToAlignment="start"
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true, listener: handleScroll }
        )}
        onTouchStart={() => setIsUserInteracting(true)}
        onTouchEnd={() => setIsUserInteracting(false)}
        contentContainerStyle={styles.scrollContent}
      >
        {banners.map((banner, idx) => {
          // Dynamic Parallax Interpolation
          const inputRange = [
            (idx - 1) * SNAP_INTERVAL,
            idx * SNAP_INTERVAL,
            (idx + 1) * SNAP_INTERVAL,
          ];

          // Banner Card Scale on Swipe
          const cardScale = scrollX.interpolate({
            inputRange,
            outputRange: [0.96, 1.0, 0.96],
            extrapolate: 'clamp',
          });

          // Product Image Parallax Shift
          const imageParallaxX = scrollX.interpolate({
            inputRange,
            outputRange: [24, 0, -24],
            extrapolate: 'clamp',
          });

          // Atmospheric Glow Pulsing Scale
          const glowScale = scrollX.interpolate({
            inputRange,
            outputRange: [0.88, 1.05, 0.88],
            extrapolate: 'clamp',
          });

          const isDarkCard = isDarkMode;
          const bg = isDarkCard ? banner.bgDark || '#1E293B' : banner.bgLight || '#FEFCE8';
          const primaryTextColor = isDarkCard ? '#F8FAFC' : '#0F172A';
          const accentTextColor = isDarkCard
            ? banner.textColorDark || '#FEF08A'
            : banner.textColorLight || '#854D0E';

          // Extract title parts for strong typography hierarchy
          const titleWords = banner.title.split(' ');
          const eyebrowKeyword = titleWords.length > 2 ? titleWords.slice(0, 2).join(' ').toUpperCase() : 'SPECIAL SELECTION';
          const mainTitleText = titleWords.length > 2 ? titleWords.slice(2).join(' ') : banner.title;

          return (
            <Animated.View
              key={banner.id || idx}
              style={[
                styles.bannerCardWrapper,
                {
                  marginRight: idx === banners.length - 1 ? 0 : BANNER_GAP,
                  transform: [{ scale: cardScale }],
                },
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.94}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  onPressBanner?.(banner);
                }}
                style={styles.bannerFullCoverCard}
              >
                {/* Edge-to-Edge Full-Bleed Cover Image */}
                <Animated.Image
                  source={{ uri: banner.image }}
                  style={[
                    styles.bannerFullCoverImg,
                    {
                      transform: [
                        { translateX: imageParallaxX },
                        { scale: 1.12 },
                      ],
                    },
                  ]}
                  resizeMode="cover"
                />

                {/* Dark Gradient Ambient Overlay */}
                <View style={styles.bannerFullCoverOverlay} />

                {/* ─── Overlaid Editorial Composition ─── */}
                <Animated.View
                  style={[
                    styles.bannerFullCoverContent,
                    { transform: [{ translateY: textTranslateY }] },
                  ]}
                >
                  {/* Contextual Micro Badge */}
                  <View style={styles.bannerEyebrowBadge}>
                    <Ionicons name="sparkles" size={10} color="#FDE047" />
                    <Text style={styles.bannerEyebrowBadgeText}>
                      {banner.tag || 'SPECIAL SELECTION'}
                    </Text>
                  </View>

                  {/* Headline */}
                  <View style={styles.headlineGroup}>
                    <Text style={styles.bannerHeadlineEyebrow}>
                      {eyebrowKeyword}
                    </Text>
                    <Text
                      style={styles.bannerMainHeadline}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {mainTitleText}
                    </Text>
                  </View>

                  {/* Subtitle */}
                  <Text
                    style={styles.bannerSubtitleText}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {banner.subtitle}
                  </Text>

                  {/* High Contrast CTA Button */}
                  <Animated.View style={{ transform: [{ scale: ctaScaleAnims[idx] }] }}>
                    <TouchableOpacity
                      activeOpacity={0.88}
                      onPressIn={() => handleCtaPressIn(idx)}
                      onPressOut={() => handleCtaPressOut(idx)}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
                        if (onPressCTA) {
                          onPressCTA(banner);
                        } else {
                          onPressBanner?.(banner);
                        }
                      }}
                      style={styles.bannerCtaBtn}
                    >
                      <Text style={styles.bannerCtaBtnText}>
                        {banner.ctaText && !banner.ctaText.includes('•')
                          ? banner.ctaText
                          : `Shop Collection`}
                      </Text>
                      <Animated.View style={{ transform: [{ translateX: ctaArrowXAnims[idx] }] }}>
                        <Ionicons name="arrow-forward" size={13} color="#FFFFFF" />
                      </Animated.View>
                    </TouchableOpacity>
                  </Animated.View>
                </Animated.View>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </Animated.ScrollView>

      {/* ─── Animated Expanding Active Indicator Pagination ─── */}
      {banners.length > 1 && (
        <View style={styles.paginationTrack}>
          {banners.map((_, i) => {
            const dotScaleX = scrollX.interpolate({
              inputRange: [
                (i - 1) * SNAP_INTERVAL,
                i * SNAP_INTERVAL,
                (i + 1) * SNAP_INTERVAL,
              ],
              outputRange: [7 / 22, 1, 7 / 22],
              extrapolate: 'clamp',
            });

            const dotOpacity = scrollX.interpolate({
              inputRange: [
                (i - 1) * SNAP_INTERVAL,
                i * SNAP_INTERVAL,
                (i + 1) * SNAP_INTERVAL,
              ],
              outputRange: [0.35, 1, 0.35],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={i}
                style={[
                  styles.paginationPill,
                  {
                    opacity: dotOpacity,
                    backgroundColor: isDarkMode ? '#C084FC' : '#15803D',
                    transform: [{ scaleX: dotScaleX }],
                  },
                ]}
              />
            );
          })}
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    marginVertical: 14,
    marginHorizontal: -16,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  bannerCardWrapper: {
    width: BANNER_WIDTH,
    marginRight: BANNER_GAP,
    borderRadius: 26,
    overflow: 'hidden',
  },
  bannerFullCoverCard: {
    width: '100%',
    height: 195,
    borderRadius: 26,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    elevation: 6,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
  },
  bannerFullCoverImg: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  bannerFullCoverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.48)',
  },
  bannerFullCoverContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    zIndex: 2,
  },
  bannerEyebrowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    marginBottom: 8,
  },
  bannerEyebrowBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FDE047',
    letterSpacing: 0.8,
  },
  bannerHeadlineEyebrow: {
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: 'rgba(255, 255, 255, 0.85)',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  bannerMainHeadline: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 22,
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  bannerSubtitleText: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 15,
    marginBottom: 12,
  },
  bannerCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8.5,
    borderRadius: 22,
    backgroundColor: '#15803D',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  bannerCtaBtnText: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  leftComposition: {
    flex: 1,
    paddingRight: 10,
    justifyContent: 'center',
    zIndex: 2,
  },
  eyebrowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 6,
  },
  eyebrowText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  headlineGroup: {
    marginBottom: 4,
  },
  headlineEyebrow: {
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 1.2,
    opacity: 0.9,
    textTransform: 'uppercase',
  },
  mainHeadline: {
    fontSize: 17,
    fontWeight: '900',
    lineHeight: 21,
    letterSpacing: -0.4,
  },
  subtitleText: {
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 14.5,
    marginBottom: 12,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8.5,
    borderRadius: 22,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2.5 },
    shadowOpacity: 0.16,
    shadowRadius: 5,
  },
  ctaBtnText: {
    fontSize: 11.5,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  rightVisualWrap: {
    width: 130,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 1,
  },
  glowBackdrop: {
    position: 'absolute',
    width: 125,
    height: 125,
    borderRadius: 62.5,
    zIndex: 1,
  },
  productImgContainer: {
    width: 120,
    height: 130,
    borderRadius: 22,
    overflow: 'hidden',
    position: 'relative',
    zIndex: 2,
    elevation: 7,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.24,
    shadowRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  regionalBadgePill: {
    position: 'absolute',
    bottom: 6,
    alignSelf: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 9,
  },
  regionalBadgeText: {
    fontSize: 7.5,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.7,
  },
  paginationTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
  },
  paginationPill: {
    width: 22,
    height: 6,
    borderRadius: 3,
  },
});
