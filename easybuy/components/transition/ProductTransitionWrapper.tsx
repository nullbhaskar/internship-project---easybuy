import React, { useRef } from 'react';
import { View, TouchableOpacity, TouchableOpacityProps, Image } from 'react-native';
import { useProductTransition, TransitionOrigin } from '../../context/ProductTransitionContext';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

interface ProductTransitionWrapperProps extends TouchableOpacityProps {
  productId: string;
  imageUrl: string;
  children: React.ReactNode;
}

export const ProductTransitionWrapper: React.FC<ProductTransitionWrapperProps> = ({
  productId,
  imageUrl,
  children,
  onPress,
  style,
  ...props
}) => {
  const containerRef = useRef<View>(null);
  const { setOrigin, overlayRef } = useProductTransition();

  const handlePress = (event: any) => {
    // 1. Tactile compression press feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

    if (containerRef.current) {
      containerRef.current.measureInWindow((x, y, width, height) => {
        // Fallback checks
        if (width === 0 || height === 0) {
          // If measurement failed, fall back to standard push navigation
          if (onPress) {
            onPress(event);
          } else {
            router.push(`/product/${productId}` as any);
          }
          return;
        }

        const origin: TransitionOrigin = {
          x,
          y,
          width,
          height,
          imageUrl,
          productId,
        };

        // 2. Set origin in context so PDP knows where we started
        setOrigin(origin);

        // 3. Trigger overlay forward transition
        overlayRef.current?.animateForward(origin, () => {
          // Animation finished callback
        });

        // 4. Perform direct navigation
        if (onPress) {
          onPress(event);
        } else {
          router.push(`/product/${productId}` as any);
        }
      });
    } else {
      if (onPress) {
        onPress(event);
      } else {
        router.push(`/product/${productId}` as any);
      }
    }
  };

  return (
    <View ref={containerRef} collapsable={false}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.9} style={style} {...props}>
        {children}
      </TouchableOpacity>
    </View>
  );
};
