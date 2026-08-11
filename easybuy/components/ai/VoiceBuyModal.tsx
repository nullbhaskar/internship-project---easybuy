import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Easing,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { parseVoiceToCart, ParsedCartItem } from '../../services/groqAI';

const { width } = Dimensions.get('window');

interface VoiceBuyModalProps {
  visible: boolean;
  onClose: () => void;
  onAddToCart?: (items: ParsedCartItem[]) => void;
  isDarkMode?: boolean;
}

// Waveform pulse animation bar
const PulseBar: React.FC<{ delay: number; isActive: boolean; color: string }> = ({
  delay,
  isActive,
  color,
}) => {
  const anim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (isActive) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1, duration: 320, useNativeDriver: false }),
          Animated.timing(anim, { toValue: 0.25, duration: 320, useNativeDriver: false }),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      Animated.timing(anim, { toValue: 0.3, duration: 200, useNativeDriver: false }).start();
    }
  }, [isActive]);

  return (
    <Animated.View
      style={[
        styles.bar,
        {
          backgroundColor: color,
          scaleY: anim,
          opacity: anim,
          height: anim.interpolate({ inputRange: [0.25, 1], outputRange: [8, 36] }),
        },
      ]}
    />
  );
};

const WAVE_DELAYS = [0, 80, 160, 240, 320, 240, 160, 80, 0];

export const VoiceBuyModal: React.FC<VoiceBuyModalProps> = ({
  visible,
  onClose,
  onAddToCart,
  isDarkMode = false,
}) => {
  const [phase, setPhase] = useState<'idle' | 'listening' | 'processing' | 'result' | 'error'>(
    'idle'
  );
  const [transcript, setTranscript] = useState('');
  const [parsedItems, setParsedItems] = useState<ParsedCartItem[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  // Simulated transcript building (since expo-speech-recognition is not installed,
  // we use a text input simulation with realistic demo transcripts)
  const [demoIndex, setDemoIndex] = useState(0);

  const DEMO_PHRASES = [
    '2 liter milk, ek packet bread aur bananas add karo',
    'mujhe makhana chahiye aur green tea bhi',
    'add instant noodles, dark chocolate, aur orange juice',
    'I need wireless earbuds and a power bank',
    'kurti saree browse karna hai festive ke liye',
  ];

  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const glowAnim  = useRef(new Animated.Value(0)).current;
  const micPulse  = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (!visible) {
      setPhase('idle');
      setTranscript('');
      setParsedItems([]);
    }
  }, [visible]);

  const startListening = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setPhase('listening');
    setTranscript('');
    setParsedItems([]);
    setErrorMsg('');

    // Pulse animation on mic
    micPulse.current = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.14, duration: 500, useNativeDriver: false }),
        Animated.timing(scaleAnim, { toValue: 0.96, duration: 500, useNativeDriver: false }),
      ])
    );
    micPulse.current.start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 800, useNativeDriver: false }),
        Animated.timing(glowAnim, { toValue: 0, duration: 800, useNativeDriver: false }),
      ])
    ).start();

    // Simulate listening for 3 seconds → use demo phrase
    const phrase = DEMO_PHRASES[demoIndex % DEMO_PHRASES.length];
    let charIndex = 0;

    const typeInterval = setInterval(() => {
      charIndex++;
      setTranscript(phrase.substring(0, charIndex));
      if (charIndex >= phrase.length) {
        clearInterval(typeInterval);
        micPulse.current?.stop();
        scaleAnim.setValue(1);
        processVoice(phrase);
      }
    }, 48);
  };

  const processVoice = async (text: string) => {
    setPhase('processing');
    setDemoIndex((prev) => prev + 1);

    try {
      const items = await parseVoiceToCart(text);
      if (items.length === 0) {
        setErrorMsg('Could not understand the shopping request. Please try again.');
        setPhase('error');
      } else {
        setParsedItems(items);
        setPhase('result');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
    } catch (e: any) {
      setErrorMsg('AI is temporarily unavailable. Try again.');
      setPhase('error');
    }
  };

  const handleAddAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onAddToCart?.(parsedItems);
    onClose();
  };

  const CATEGORY_COLORS: Record<string, string> = {
    grocery:    '#16A34A',
    beauty:     '#DB2777',
    fashion:    '#7C3AED',
    tech:       '#2563EB',
    ethnic_wear:'#EA580C',
    kids:       '#D97706',
  };

  const accentColor = isDarkMode ? '#A855F7' : '#1A9E5F';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, isDarkMode && styles.sheetDark]}>

          {/* Handle Bar */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.title, isDarkMode && { color: '#F8FAFC' }]}>
                VoiceBuy AI 🎙️
              </Text>
              <Text style={[styles.subtitle, isDarkMode && { color: '#94A3B8' }]}>
                Speak in Hindi, English, or Hinglish
              </Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, isDarkMode && styles.closeBtnDark]}
              activeOpacity={0.8}
            >
              <Ionicons name="close" size={18} color={isDarkMode ? '#F8FAFC' : '#0F172A'} />
            </TouchableOpacity>
          </View>

          {/* Example hints */}
          {phase === 'idle' && (
            <View style={[styles.hintBox, isDarkMode && styles.hintBoxDark]}>
              <Text style={[styles.hintTitle, isDarkMode && { color: '#94A3B8' }]}>
                Try saying:
              </Text>
              <Text style={[styles.hint, isDarkMode && { color: '#CBD5E1' }]}>
                🛒 &quot;2 liter milk aur ek packet bread&quot;
              </Text>
              <Text style={[styles.hint, isDarkMode && { color: '#CBD5E1' }]}>
                🎧 &quot;I need wireless earbuds under ₹1500&quot;
              </Text>
              <Text style={[styles.hint, isDarkMode && { color: '#CBD5E1' }]}>
                🌶️ &quot;Makhana, sattu, aur green tea&quot;
              </Text>
            </View>
          )}

          {/* Live Transcript */}
          {(phase === 'listening' || phase === 'processing') && transcript.length > 0 && (
            <View style={[styles.transcriptBox, isDarkMode && styles.transcriptBoxDark]}>
              <Text style={[styles.transcriptTxt, isDarkMode && { color: '#F8FAFC' }]}>
                &quot;{transcript}&quot;
              </Text>
            </View>
          )}

          {/* Waveform (listening) */}
          {phase === 'listening' && (
            <View style={styles.waveRow}>
              {WAVE_DELAYS.map((d, i) => (
                <PulseBar
                  key={i}
                  delay={d}
                  isActive={phase === 'listening'}
                  color={accentColor}
                />
              ))}
            </View>
          )}

          {/* Processing */}
          {phase === 'processing' && (
            <View style={styles.processingRow}>
              <Ionicons name="sparkles" size={18} color={accentColor} />
              <Text style={[styles.processingTxt, { color: accentColor }]}>
                AI is parsing your request…
              </Text>
            </View>
          )}

          {/* Result */}
          {phase === 'result' && parsedItems.length > 0 && (
            <View style={styles.resultSection}>
              <Text style={[styles.resultTitle, isDarkMode && { color: '#F8FAFC' }]}>
                ✅ Found {parsedItems.length} item{parsedItems.length > 1 ? 's' : ''}
              </Text>

              <ScrollView
                style={styles.itemList}
                showsVerticalScrollIndicator={false}
              >
                {parsedItems.map((item, i) => {
                  const catColor = CATEGORY_COLORS[item.category] ?? '#1A9E5F';
                  return (
                    <View
                      key={i}
                      style={[styles.itemRow, isDarkMode && styles.itemRowDark]}
                    >
                      <View style={[styles.itemQtyBadge, { backgroundColor: catColor }]}>
                        <Text style={styles.itemQtyTxt}>{item.quantity}×</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[styles.itemName, isDarkMode && { color: '#F8FAFC' }]}
                          numberOfLines={1}
                        >
                          {item.name}
                        </Text>
                        <Text style={[styles.itemCat, { color: catColor }]}>
                          {item.category.replace('_', ' ')}
                        </Text>
                      </View>
                      <Ionicons name="checkmark-circle" size={18} color={catColor} />
                    </View>
                  );
                })}
              </ScrollView>

              <TouchableOpacity
                style={[styles.addAllBtn, { backgroundColor: accentColor }]}
                onPress={handleAddAll}
                activeOpacity={0.88}
              >
                <Ionicons name="cart" size={18} color="#FFFFFF" />
                <Text style={styles.addAllBtnTxt}>Add All to Cart</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.retryLink} onPress={startListening}>
                <Text style={[styles.retryLinkTxt, { color: accentColor }]}>
                  🎙️ Speak Again
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Error */}
          {phase === 'error' && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={28} color="#EF4444" />
              <Text style={styles.errorTxt}>{errorMsg}</Text>
              <TouchableOpacity
                style={styles.retryBtn}
                onPress={() => setPhase('idle')}
                activeOpacity={0.85}
              >
                <Text style={styles.retryBtnTxt}>Try Again</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Big Mic Button (idle or listening) */}
          {(phase === 'idle' || phase === 'listening') && (
            <Animated.View
              style={[
                styles.micWrapper,
                {
                  transform: [{ scale: scaleAnim }],
                  shadowOpacity: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.1, 0.5],
                  }),
                  shadowColor: accentColor,
                  shadowRadius: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [6, 24],
                  }),
                  shadowOffset: { width: 0, height: 0 },
                  elevation: 12,
                },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.micBtn,
                  { backgroundColor: phase === 'listening' ? '#EF4444' : accentColor },
                ]}
                onPress={phase === 'listening' ? () => setPhase('idle') : startListening}
                activeOpacity={0.9}
              >
                <Ionicons
                  name={phase === 'listening' ? 'stop' : 'mic'}
                  size={34}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </Animated.View>
          )}

          <Text style={[styles.footer, isDarkMode && { color: '#475569' }]}>
            {phase === 'idle' ? 'Tap mic to start speaking' : ''}
            {phase === 'listening' ? 'Listening… tap to stop' : ''}
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
    paddingBottom: 40,
    alignItems: 'center',
    minHeight: 400,
  },
  sheetDark: {
    backgroundColor: '#1E293B',
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    marginBottom: 18,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnDark: {
    backgroundColor: '#334155',
  },

  // Hints
  hintBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 5,
  },
  hintBoxDark: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
  },
  hintTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 4,
  },
  hint: {
    fontSize: 12.5,
    color: '#0F172A',
    fontWeight: '600',
  },

  // Transcript
  transcriptBox: {
    width: '100%',
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  transcriptBoxDark: {
    backgroundColor: '#052E16',
    borderColor: '#166534',
  },
  transcriptTxt: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 20,
    fontStyle: 'italic',
  },

  // Waveform
  waveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 44,
    marginBottom: 18,
  },
  bar: {
    width: 5,
    borderRadius: 4,
  },

  // Processing
  processingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  processingTxt: {
    fontSize: 13,
    fontWeight: '700',
  },

  // Result
  resultSection: {
    width: '100%',
    marginBottom: 14,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 10,
  },
  itemList: {
    maxHeight: 180,
    marginBottom: 14,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  itemRowDark: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
  },
  itemQtyBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemQtyTxt: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  itemName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  itemCat: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'capitalize',
    marginTop: 1,
  },
  addAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    width: '100%',
    marginBottom: 8,
  },
  addAllBtnTxt: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  retryLink: {
    alignSelf: 'center',
    paddingVertical: 6,
  },
  retryLinkTxt: {
    fontSize: 13,
    fontWeight: '700',
  },

  // Error
  errorBox: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    width: '100%',
  },
  errorTxt: {
    fontSize: 13,
    color: '#EF4444',
    fontWeight: '600',
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryBtnTxt: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },

  // Mic
  micWrapper: {
    marginTop: 10,
    marginBottom: 14,
  },
  micBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    textAlign: 'center',
  },
});
