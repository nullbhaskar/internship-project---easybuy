import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    image: require('../assets/images/onboarding_hero.png'),
    titlePrefix: 'Welcome to ',
    highlight: 'EasyBuy',
    description:
      'Shop smarter with thousands of quality products. Fast delivery. Secure payments. Great prices.',
  },
  {
    id: '2',
    image: require('../assets/images/onboarding_hero_2.png'),
    titlePrefix: 'Fast & Secure ',
    highlight: 'Delivery',
    description:
      'Get your orders delivered to your doorstep in record time with live order tracking & 100% safety.',
  },
  {
    id: '3',
    image: require('../assets/images/onboarding_hero_3.png'),
    titlePrefix: 'Secure ',
    highlight: 'Payments',
    description: 'Your payments are 100% secure with best-in-class protection.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();

  // Single Source of Truth for active slide step
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // Real-time 60 FPS Scroll position for 1:1 finger synchronization
  const scrollX = useRef(new Animated.Value(0)).current;

  // Animated value for CTA button press scale (97.5%)
  const btnScaleAnim = useRef(new Animated.Value(1)).current;

  const navigateToLogin = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    } catch (error) {
      console.warn('Failed to save onboarding persistence state:', error);
    }
    // Replaces stack entry so Android back button cannot return to onboarding
    router.replace('/login');
  };

  const handleSkip = () => {
    Haptics.selectionAsync().catch(() => {});
    navigateToLogin();
  };

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      Haptics.selectionAsync().catch(() => {});
      const nextIndex = activeIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    } else {
      navigateToLogin();
    }
  };

  const handlePrevious = () => {
    if (activeIndex > 0) {
      Haptics.selectionAsync().catch(() => {});
      const prevIndex = activeIndex - 1;
      flatListRef.current?.scrollToIndex({ index: prevIndex, animated: true });
    }
  };

  const handleDotPress = (index: number) => {
    if (index !== activeIndex) {
      Haptics.selectionAsync().catch(() => {});
      flatListRef.current?.scrollToIndex({ index, animated: true });
    }
  };

  // Button Press Effect
  const handleBtnPressIn = () => {
    Haptics.selectionAsync().catch(() => {});
    Animated.spring(btnScaleAnim, {
      toValue: 0.975,
      useNativeDriver: false,
    }).start();
  };

  const handleBtnPressOut = () => {
    Animated.spring(btnScaleAnim, {
      toValue: 1.0,
      friction: 5,
      tension: 120,
      useNativeDriver: false,
    }).start();
  };

  const isLastSlide = activeIndex === SLIDES.length - 1;
  const showPrevious = activeIndex > 0;

  const renderSlide = ({ item, index }: { item: (typeof SLIDES)[0]; index: number }) => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    // 1:1 Real-time scroll synchronized opacity & scale for 3D illustration
    const imageOpacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.3, 1, 0.3],
      extrapolate: 'clamp',
    });

    const imageScale = scrollX.interpolate({
      inputRange,
      outputRange: [0.85, 1, 0.85],
      extrapolate: 'clamp',
    });

    // 1:1 Real-time scroll synchronized opacity & vertical slide for typography
    const textOpacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.2, 1, 0.2],
      extrapolate: 'clamp',
    });

    const textTranslateY = scrollX.interpolate({
      inputRange,
      outputRange: [16, 0, -16],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.slide}>
        {/* 3D Illustration Container with 60 FPS Real-time Interpolation */}
        <Animated.View
          style={[
            styles.heroContainer,
            {
              opacity: imageOpacity,
              transform: [{ scale: imageScale }],
            },
          ]}
        >
          <View style={styles.heroBackdropCircle} />
          <Image source={item.image} style={styles.heroImage} resizeMode="contain" />
        </Animated.View>

        {/* EasyBuy Brand Logo Header - Only on Page 1 */}
        {index === 0 && (
          <View style={styles.brandRow}>
            <Image
              source={require('../assets/images/easybuy_logo.png')}
              style={styles.brandLogo}
              resizeMode="contain"
            />
            <Text style={styles.brandName}>
              Easy<Text style={styles.brandNameHighlight}>Buy</Text>
            </Text>
          </View>
        )}

        {/* Heading & Subtitle Container with 60 FPS Real-time Interpolation */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: textOpacity,
              transform: [{ translateY: textTranslateY }],
            },
          ]}
        >
          <Text style={styles.heading}>
            {item.titlePrefix}
            <Text style={styles.headingHighlight}>{item.highlight}</Text>
          </Text>

          <Text style={styles.description}>{item.description}</Text>
        </Animated.View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Decorative Background Shapes */}
      <View style={styles.topBgCircle} pointerEvents="none" />
      <View style={styles.rightBgShape} pointerEvents="none" />
      <View style={styles.bottomLeftBgCircle} pointerEvents="none" />

      {/* Background Grid Dot Accents */}
      <View style={styles.leftDotsPattern} pointerEvents="none">
        <View style={styles.dotRow}><View style={styles.gridDot}/><View style={styles.gridDot}/><View style={styles.gridDot}/></View>
        <View style={styles.dotRow}><View style={styles.gridDot}/><View style={styles.gridDot}/><View style={styles.gridDot}/></View>
        <View style={styles.dotRow}><View style={styles.gridDot}/><View style={styles.gridDot}/><View style={styles.gridDot}/></View>
      </View>

      <View style={styles.rightDotsPattern} pointerEvents="none">
        <View style={styles.dotRow}><View style={styles.gridDot}/><View style={styles.gridDot}/><View style={styles.gridDot}/></View>
        <View style={styles.dotRow}><View style={styles.gridDot}/><View style={styles.gridDot}/><View style={styles.gridDot}/></View>
        <View style={styles.dotRow}><View style={styles.gridDot}/><View style={styles.gridDot}/><View style={styles.gridDot}/></View>
      </View>

      {/* Top Header Section with Previous (Left) and Skip (Right) */}
      <View style={styles.header}>
        {showPrevious ? (
          <TouchableOpacity
            style={styles.navActionBtn}
            onPress={handlePrevious}
            activeOpacity={0.7}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Previous slide"
            accessibilityHint="Returns to the previous onboarding slide"
          >
            <Text style={styles.navActionText}>Previous</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.navPlaceholder} />
        )}

        <TouchableOpacity
          style={styles.navActionBtn}
          onPress={handleSkip}
          activeOpacity={0.7}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Skip onboarding"
          accessibilityHint="Navigates directly to the login screen"
        >
          <Text style={styles.navActionText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Swipable FlatList Carousel with 60 FPS scrollX Animated Event */}
      <Animated.FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          {
            useNativeDriver: false,
            listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
              const offsetX = event.nativeEvent.contentOffset.x;
              const index = Math.round(offsetX / width);
              if (index !== activeIndex && index >= 0 && index < SLIDES.length) {
                setActiveIndex(index);
              }
            },
          }
        )}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        contentContainerStyle={styles.flatListContent}
      />

      {/* Footer Navigation & Actions - Fixed Position Anchored at Bottom */}
      <View style={styles.footer}>
        {/* 1:1 Scroll Synchronized Dynamic Progress Dots */}
        <View style={styles.paginationContainer}>
          {SLIDES.map((_, index) => {
            const inputRange = [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ];

            const dotScaleX = scrollX.interpolate({
              inputRange,
              outputRange: [1, 3, 1],
              extrapolate: 'clamp',
            });

            const dotOpacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.45, 1, 0.45],
              extrapolate: 'clamp',
            });

            const dotColor = scrollX.interpolate({
              inputRange,
              outputRange: ['#CBD5E1', '#2D6B42', '#CBD5E1'],
              extrapolate: 'clamp',
            });

            return (
              <TouchableOpacity
                key={index}
                onPress={() => handleDotPress(index)}
                activeOpacity={0.8}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Go to onboarding slide ${index + 1}`}
                style={styles.dotTouchTarget}
              >
                <Animated.View
                  style={[
                    styles.dot,
                    {
                      transform: [{ scaleX: dotScaleX }],
                      opacity: dotOpacity,
                      backgroundColor: dotColor,
                    },
                  ]}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* CTA Action Button with Scale Press Animation & Centered Text */}
        <Animated.View style={{ width: '100%', transform: [{ scale: btnScaleAnim }] }}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleNext}
            onPressIn={handleBtnPressIn}
            onPressOut={handleBtnPressOut}
            activeOpacity={0.9}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={isLastSlide ? 'Get Started' : 'Next slide'}
            accessibilityHint={isLastSlide ? 'Completes onboarding and opens login' : 'Advances to the next slide'}
          >
            <Text style={styles.actionButtonText}>
              {isLastSlide ? 'Get Started  →' : 'Next  →'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFDFB',
  },
  // Background decorative shapes
  topBgCircle: {
    position: 'absolute',
    top: -80,
    left: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(45, 107, 66, 0.07)',
  },
  rightBgShape: {
    position: 'absolute',
    top: 100,
    right: -70,
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1.5,
    borderColor: 'rgba(45, 107, 66, 0.12)',
    backgroundColor: 'transparent',
  },
  bottomLeftBgCircle: {
    position: 'absolute',
    bottom: -60,
    left: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(45, 107, 66, 0.06)',
  },
  // Grid Dot Accents
  leftDotsPattern: {
    position: 'absolute',
    left: 20,
    top: '32%',
    gap: 6,
    opacity: 0.25,
  },
  rightDotsPattern: {
    position: 'absolute',
    right: 20,
    top: '46%',
    gap: 6,
    opacity: 0.25,
  },
  dotRow: {
    flexDirection: 'row',
    gap: 6,
  },
  gridDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#2D6B42',
  },
  // Top Header Navigation (Previous & Skip)
  header: {
    paddingHorizontal: 28,
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  navPlaceholder: {
    minHeight: 40,
    minWidth: 60,
  },
  navActionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    minHeight: 40,
    justifyContent: 'center',
  },
  navActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D6B42',
    textDecorationLine: 'underline',
  },
  flatListContent: {
    alignItems: 'center',
  },
  // Slide Content
  slide: {
    width: width,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  heroContainer: {
    width: width * 0.88,
    height: width * 0.80,
    maxHeight: 330,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  heroBackdropCircle: {
    position: 'absolute',
    width: width * 0.75,
    height: width * 0.75,
    borderRadius: (width * 0.75) / 2,
    backgroundColor: 'rgba(45, 107, 66, 0.05)',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    gap: 8,
  },
  brandLogo: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  brandName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1C2A20',
    letterSpacing: -0.3,
  },
  brandNameHighlight: {
    color: '#2D6B42',
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  heading: {
    fontSize: 30,
    fontWeight: '900',
    color: '#18181B',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.6,
  },
  headingHighlight: {
    color: '#2D6B42',
  },
  description: {
    fontSize: 15,
    lineHeight: 23,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 320,
  },
  // Footer - Fixed positioning anchored consistently at bottom
  footer: {
    paddingHorizontal: 28,
    paddingBottom: 36,
    alignItems: 'center',
    width: '100%',
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    gap: 8,
    height: 16,
  },
  dotTouchTarget: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  actionButton: {
    backgroundColor: '#2D6B42',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 56,
    borderRadius: 28,
    paddingHorizontal: 20,
    shadowColor: '#2D6B42',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
});
