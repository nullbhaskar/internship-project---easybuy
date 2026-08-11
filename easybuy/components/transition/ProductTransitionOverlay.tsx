/**
 * ProductTransitionOverlay
 *
 * A portal-level component mounted ABOVE the Expo Router Stack in _layout.tsx.
 * It renders the product image floating over all screens and drives the
 * cinematic card → PDP animation.
 *
 * Forward:  card image bounds → PDP hero image bounds  (spring, ~380ms)
 * Backward: PDP hero bounds  → card image bounds       (spring, ~320ms)
 *
 * The overlay is pointer-events:none so it never captures touches.
 * The PDP coordinates via the imperative ref (ProductTransitionOverlayRef).
 */
import React, {
  forwardRef,
  useImperativeHandle,
  useState,
} from 'react';
import { StyleSheet, Image, Dimensions } from 'react-native';
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import type { TransitionOrigin, ProductTransitionOverlayRef } from '../../context/ProductTransitionContext';

const { width: SW, height: SH } = Dimensions.get('window');

// ── Immersive full-screen PDP hero bounds (width: SW, height: 400, border radius: 0) ──
export const PDP_HERO_X = 0;
export const PDP_HERO_Y = 0;
export const PDP_HERO_W = SW;
export const PDP_HERO_H = 400;
export const PDP_HERO_RADIUS = 0;

const FORWARD_SPRING = {
  damping: 30,
  stiffness: 260,
  mass: 0.85,
  overshootClamping: false,
};

const BACK_SPRING = {
  damping: 28,
  stiffness: 240,
  mass: 0.8,
  overshootClamping: false,
};

export const ProductTransitionOverlay = forwardRef<ProductTransitionOverlayRef>(
  (_, ref) => {
    const [imageUrl, setImageUrl] = useState('');

    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const scaleX = useSharedValue(1);
    const scaleY = useSharedValue(1);
    const opacity = useSharedValue(0);
    const radius = useSharedValue(12);

    useImperativeHandle(ref, () => ({
      animateForward(origin, onSettled) {
        // Calculate starting scales and positions relative to PDP hero target
        const startScaleX = origin.width / PDP_HERO_W;
        const startScaleY = origin.height / PDP_HERO_H;
        const startTranslateX = origin.x + origin.width / 2 - (PDP_HERO_X + PDP_HERO_W / 2);
        const startTranslateY = origin.y + origin.height / 2 - (PDP_HERO_Y + PDP_HERO_H / 2);

        // Snap to starting positions immediately
        translateX.value = startTranslateX;
        translateY.value = startTranslateY;
        scaleX.value = startScaleX;
        scaleY.value = startScaleY;
        radius.value = origin.borderRadius ?? 12;

        // Make visible
        setImageUrl(origin.imageUrl);
        opacity.value = withTiming(1, { duration: 0 });

        // Animate to target PDP hero bounds (scale 1.0, translate 0.0)
        translateX.value = withSpring(0, FORWARD_SPRING);
        translateY.value = withSpring(0, FORWARD_SPRING);
        scaleX.value = withSpring(1, FORWARD_SPRING);
        scaleY.value = withSpring(1, FORWARD_SPRING, () => {
          runOnJS(onSettled)();
        });
        radius.value = withTiming(PDP_HERO_RADIUS, {
          duration: 340,
          easing: Easing.out(Easing.cubic),
        });
      },

      animateBack(origin, onDone) {
        // Calculate target scales and positions relative to PDP hero target
        const targetScaleX = origin.width / PDP_HERO_W;
        const targetScaleY = origin.height / PDP_HERO_H;
        const targetTranslateX = origin.x + origin.width / 2 - (PDP_HERO_X + PDP_HERO_W / 2);
        const targetTranslateY = origin.y + origin.height / 2 - (PDP_HERO_Y + PDP_HERO_H / 2);

        // Make sure we start at PDP hero bounds (scale 1.0, translate 0.0)
        translateX.value = 0;
        translateY.value = 0;
        scaleX.value = 1;
        scaleY.value = 1;
        radius.value = PDP_HERO_RADIUS;
        opacity.value = 1;

        // Animate down to card bounds
        translateX.value = withSpring(targetTranslateX, BACK_SPRING);
        translateY.value = withSpring(targetTranslateY, BACK_SPRING);
        scaleX.value = withSpring(targetScaleX, BACK_SPRING);
        scaleY.value = withSpring(targetScaleY, BACK_SPRING, () => {
          runOnJS(onDone)();
        });
        radius.value = withTiming(origin.borderRadius ?? 12, {
          duration: 280,
          easing: Easing.out(Easing.cubic),
        });
        opacity.value = withTiming(0, {
          duration: 280,
          easing: Easing.out(Easing.cubic),
        });
      },

      hide() {
        opacity.value = withTiming(0, { duration: 120 });
      },
    }));

    const animStyle = useAnimatedStyle(() => ({
      position: 'absolute',
      left: PDP_HERO_X,
      top: PDP_HERO_Y,
      width: PDP_HERO_W,
      height: PDP_HERO_H,
      opacity: opacity.value,
      borderRadius: radius.value,
      overflow: 'hidden',
      zIndex: 9998,
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scaleX: scaleX.value },
        { scaleY: scaleY.value },
      ],
    }));

    return (
      <Reanimated.View style={animStyle} pointerEvents="none">
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
        ) : null}
      </Reanimated.View>
    );
  }
);

ProductTransitionOverlay.displayName = 'ProductTransitionOverlay';

const styles = StyleSheet.create({});
