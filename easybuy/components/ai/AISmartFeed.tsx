import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import {
  getTimeAwareKeywords,
  getCurrentTimeSlot,
  TimeSlot,
} from '../../services/groqAI';

interface AISmartFeedProps {
  stateName?: string;
  isDarkMode?: boolean;
  onKeywordPress?: (keyword: string) => void;
}

const TIME_SLOT_CONFIG: Record<
  TimeSlot,
  { emoji: string; label: string; color: string; bg: string; bgDark: string }
> = {
  morning:   { emoji: '🌅', label: 'Good Morning Picks',     color: '#D97706', bg: '#FFFBEB', bgDark: '#451A03' },
  afternoon: { emoji: '☀️', label: 'Afternoon Essentials',    color: '#0284C7', bg: '#E0F2FE', bgDark: '#082F49' },
  evening:   { emoji: '🌆', label: 'Evening Trending Picks',  color: '#7C3AED', bg: '#F3E8FF', bgDark: '#2E1065' },
  night:     { emoji: '🌙', label: 'Night Mode Picks',        color: '#4F46E5', bg: '#EEF2FF', bgDark: '#1E1B4B' },
  latenight: { emoji: '🦉', label: 'Night Owl Picks',         color: '#BE185D', bg: '#FCE7F3', bgDark: '#4A044E' },
};

export const AISmartFeed: React.FC<AISmartFeedProps> = ({
  stateName,
  isDarkMode = false,
  onKeywordPress,
}) => {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(false);
  const slot                    = getCurrentTimeSlot();
  const config                  = TIME_SLOT_CONFIG[slot];

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(false);
      try {
        const kw = await getTimeAwareKeywords(stateName);
        if (!cancelled) {
          setKeywords(kw);
          // Animate in
          Animated.parallel([
            Animated.timing(fadeAnim,  { toValue: 1, duration: 420, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 380, useNativeDriver: true }),
          ]).start();
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [stateName]);

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? config.bgDark : config.bg },
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={styles.emoji}>{config.emoji}</Text>
          <View>
            <Text style={[styles.label, { color: config.color }]}>AI Smart Feed</Text>
            <Text style={[styles.sublabel, isDarkMode && { color: '#94A3B8' }]}>
              {config.label}
            </Text>
          </View>
        </View>

        {/* Powered by label */}
        <View style={[styles.aiBadge, { borderColor: config.color }]}>
          <Ionicons name="sparkles" size={9} color={config.color} />
          <Text style={[styles.aiBadgeTxt, { color: config.color }]}>AI</Text>
        </View>
      </View>

      {/* Keywords Strip */}
      {loading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={config.color} />
          <Text style={[styles.loadingTxt, { color: config.color }]}>
            AI is personalising your feed…
          </Text>
        </View>
      ) : error ? (
        <Text style={[styles.errorTxt, isDarkMode && { color: '#94A3B8' }]}>
          Unable to load AI suggestions right now.
        </Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {keywords.map((kw, i) => (
            <TouchableOpacity
              key={`${kw}_${i}`}
              style={[
                styles.chip,
                { backgroundColor: config.color + '18', borderColor: config.color + '55' },
              ]}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                onKeywordPress?.(kw);
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="search-outline" size={11} color={config.color} />
              <Text style={[styles.chipTxt, { color: config.color }]}>{kw}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 0,
    marginBottom: 16,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.18)',
    elevation: 3,
    shadowColor: '#8E44AD',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emoji: {
    fontSize: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '900',
  },
  sublabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  aiBadgeTxt: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  chipsRow: {
    gap: 8,
    paddingRight: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipTxt: {
    fontSize: 11.5,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  loadingTxt: {
    fontSize: 11,
    fontWeight: '600',
  },
  errorTxt: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
});
