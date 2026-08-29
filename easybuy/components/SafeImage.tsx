import React, { useState } from 'react';
import { Image, ImageProps, View, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SafeImageProps extends ImageProps {
  fallbackIcon?: keyof typeof Ionicons.glyphMap;
  containerStyle?: object;
}

export function SafeImage({ style, containerStyle, fallbackIcon = 'image-outline', ...props }: SafeImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <View style={[styles.container, containerStyle, style as any]}>
      {!hasError ? (
        <Image
          {...props}
          style={[StyleSheet.absoluteFill, style as any]}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          onError={() => {
            setHasError(true);
            setIsLoading(false);
          }}
        />
      ) : (
        <View style={styles.fallbackContainer}>
          <Ionicons name={fallbackIcon} size={32} color="#94A3B8" />
        </View>
      )}
      
      {isLoading && !hasError && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#0F172A" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
  },
  fallbackContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(241, 245, 249, 0.5)',
  },
});
