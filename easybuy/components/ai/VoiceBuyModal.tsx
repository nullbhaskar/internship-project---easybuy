import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import {
  processUniversalAIShopping,
  UniversalAIShoppingResult,
  UniversalAIItem,
} from '../../services/groqAI';
import { voiceRecognition } from '../../services/voiceRecognition';
import { useCart } from '../../context/CartContext';
import { useAddress } from '../../context/AddressContext';

const { width } = Dimensions.get('window');

interface VoiceBuyModalProps {
  visible: boolean;
  onClose: () => void;
  onAddToCart?: (items: any[]) => void;
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
  const { addToCart } = useCart();
  const { selectedStateName } = useAddress();

  const [phase, setPhase] = useState<'idle' | 'listening' | 'processing' | 'ai_result' | 'error'>(
    'idle'
  );
  const [transcript, setTranscript] = useState('');
  const [aiResult, setAiResult] = useState<UniversalAIShoppingResult | null>(null);
  const [selectedItemsMap, setSelectedItemsMap] = useState<Record<string, boolean>>({});
  const [errorMsg, setErrorMsg] = useState('');
  const [showSteps, setShowSteps] = useState(false);

  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    if (!visible) {
      voiceRecognition.stop();
      setPhase('idle');
      setTranscript('');
      setAiResult(null);
      setSelectedItemsMap({});
      setShowSteps(false);
    }
  }, [visible]);

  const startListening = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setPhase('listening');
    setTranscript('');
    setAiResult(null);
    setErrorMsg('');

    // Start Live Speech Recognition
    voiceRecognition.start({
      onStart: () => {
        setPhase('listening');
      },
      onResult: (liveText, isFinal) => {
        setTranscript(liveText);
        if (isFinal) {
          processVoice(liveText);
        }
      },
      onError: (err) => {
        console.log('[VoiceBuyModal] Mic event:', err);
        if (!transcript) {
          setErrorMsg('Could not detect speech. Please tap the mic and speak clearly.');
          setPhase('error');
        }
      },
      onEnd: () => {
        if (transcript.length > 2 && phase === 'listening') {
          processVoice(transcript);
        }
      },
    });
  };

  const stopListening = () => {
    voiceRecognition.stop();
    if (transcript.length > 2) {
      processVoice(transcript);
    } else {
      setPhase('idle');
    }
  };

  const processVoice = async (text: string) => {
    voiceRecognition.stop();
    setPhase('processing');

    try {
      // Universal ChatGPT-Style AI Shopping Engine (Handles Birthday Gifts, Outfits, Recipes, Skincare, Groceries)
      const res = await processUniversalAIShopping(text, selectedStateName);

      if (res) {
        setAiResult(res);
        const selMap: Record<string, boolean> = {};
        res.items.forEach((it) => {
          selMap[it.id] = true;
        });
        setSelectedItemsMap(selMap);
        setPhase('ai_result');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      } else {
        setErrorMsg(`AI could not find items for "${text}". Try asking for gifts, recipes, or outfits!`);
        setPhase('error');
      }
    } catch (e: any) {
      console.log('Voice processing error:', e);
      setErrorMsg('AI is momentarily busy. Please tap the mic and try again!');
      setPhase('error');
    }
  };

  const toggleItem = (id: string) => {
    Haptics.selectionAsync().catch(() => {});
    setSelectedItemsMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleAddSelectedToCart = () => {
    if (!aiResult) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    const activeItems = aiResult.items.filter((it) => selectedItemsMap[it.id]);

    activeItems.forEach((it) => {
      addToCart({
        id: it.id || `voice_ai_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        title: it.name,
        price: `₹${it.price || 149}`,
        image: it.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500',
        quantity: 1,
        unit: it.quantity,
      });
    });

    onAddToCart?.(activeItems);
    onClose();
  };

  const accentColor = '#10B981';

  // Dynamic selected price
  const selectedCount = aiResult?.items.filter((i) => selectedItemsMap[i.id]).length || 0;
  const selectedTotal =
    aiResult?.items
      .filter((i) => selectedItemsMap[i.id])
      .reduce((sum, it) => sum + (it.price || 149), 0) || 0;

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
                EasyBuy AI Concierge 🎙️
              </Text>
              <Text style={[styles.subtitle, isDarkMode && { color: '#94A3B8' }]}>
                Ask for gifts, recipes, outfits, diets, or groceries in any language!
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

          {/* Starter Suggestions */}
          {phase === 'idle' && (
            <View style={[styles.hintBox, isDarkMode && styles.hintBoxDark]}>
              <Text style={[styles.hintTitle, isDarkMode && { color: '#94A3B8' }]}>
                Try speaking anything:
              </Text>
              <TouchableOpacity
                onPress={() => processVoice('Mujhe birthday party mein jana hai uske liye gift chahie')}
                activeOpacity={0.7}
              >
                <Text style={[styles.hint, isDarkMode && { color: '#CBD5E1' }]}>
                  🎁 &quot;Mujhe birthday party mein jana hai uske liye gift chahie&quot;
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => processVoice('Chai aur pakora banana hai 4 logo ke liye')}
                activeOpacity={0.7}
              >
                <Text style={[styles.hint, isDarkMode && { color: '#CBD5E1' }]}>
                  🫖 &quot;Chai aur pakora banana hai 4 logo ke liye&quot;
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => processVoice('College fest ke liye casual stylish outfit')}
                activeOpacity={0.7}
              >
                <Text style={[styles.hint, isDarkMode && { color: '#CBD5E1' }]}>
                  👕 &quot;College fest ke liye casual stylish outfit&quot;
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => processVoice('Gym workout diet high protein')}
                activeOpacity={0.7}
              >
                <Text style={[styles.hint, isDarkMode && { color: '#CBD5E1' }]}>
                  💪 &quot;Gym workout diet high protein essentials&quot;
                </Text>
              </TouchableOpacity>
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
              <Ionicons name="sparkles" size={22} color="#10B981" />
              <Text style={[styles.processingTxt, { color: '#10B981' }]}>
                EasyBuy AI is curating recommendations & cart…
              </Text>
            </View>
          )}

          {/* ─── AI CONCIERGE ANSWER & BUNDLE ─── */}
          {phase === 'ai_result' && aiResult && (
            <View style={styles.resultSection}>
              {/* AI Friendly Chat Bubble */}
              <View style={[styles.chatBubble, isDarkMode && styles.chatBubbleDark]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <Ionicons name="sparkles" size={14} color="#10B981" />
                  <Text style={{ fontSize: 11, fontWeight: '800', color: '#10B981', letterSpacing: 0.5 }}>
                    EASYBUY AI CONCIERGE
                  </Text>
                </View>
                <Text style={[styles.chatBubbleTxt, isDarkMode && { color: '#F8FAFC' }]}>
                  {aiResult.chatReply}
                </Text>
              </View>

              {/* Bundle Header */}
              {aiResult.items.length > 0 ? (
                <View style={[styles.bundleHeaderCard, isDarkMode && styles.bundleHeaderCardDark]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Text style={{ fontSize: 30 }}>{aiResult.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.bundleTitle, isDarkMode && { color: '#F8FAFC' }]}>
                        {aiResult.title}
                      </Text>
                      <Text style={[styles.bundleSubtitle, isDarkMode && { color: '#94A3B8' }]} numberOfLines={2}>
                        {aiResult.tagline}
                      </Text>
                    </View>
                  </View>

                  {/* Optional Guide / Steps */}
                  {aiResult.steps && aiResult.steps.length > 0 && (
                    <View style={{ marginTop: 8 }}>
                      <TouchableOpacity
                        style={styles.stepsToggle}
                        onPress={() => setShowSteps(!showSteps)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="bulb-outline" size={13} color="#10B981" />
                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#10B981' }}>
                          {showSteps ? 'Hide Guide' : 'View Quick Guide'}
                        </Text>
                      </TouchableOpacity>
                      {showSteps && (
                        <View style={styles.stepsBox}>
                          {aiResult.steps.map((st, sidx) => (
                            <Text key={sidx} style={styles.stepTxt}>
                              {st}
                            </Text>
                          ))}
                        </View>
                      )}
                    </View>
                  )}
                </View>
              ) : (
                <View style={[styles.bundleHeaderCard, isDarkMode && styles.bundleHeaderCardDark, { alignItems: 'center', paddingVertical: 20 }]}>
                  <Ionicons name="search-outline" size={40} color="#94A3B8" />
                  <Text style={[styles.bundleTitle, { marginTop: 10, textAlign: 'center' }, isDarkMode && { color: '#F8FAFC' }]}>
                    Item Not Available on EasyBuy
                  </Text>
                  <Text style={[styles.bundleSubtitle, { textAlign: 'center', marginTop: 4 }, isDarkMode && { color: '#94A3B8' }]}>
                    Try asking for generic items (e.g. bat, tea, grocery, hoodies, sneakers) instead of specific luxury or premium brands.
                  </Text>
                </View>
              )}

              {/* Items List */}
              {aiResult.items.length > 0 && (
                <>
                  <Text style={[styles.itemsListLabel, isDarkMode && { color: '#94A3B8' }]}>
                    RECOMMENDED ITEMS ({selectedCount}/{aiResult.items.length})
                  </Text>

                  <ScrollView style={styles.itemList} showsVerticalScrollIndicator={false}>
                    {aiResult.items.map((it) => {
                      const isChecked = selectedItemsMap[it.id];
                      return (
                        <TouchableOpacity
                          key={it.id}
                          style={[
                            styles.itemCardRow,
                            isDarkMode && styles.itemRowDark,
                            isChecked && styles.itemCardRowSelected,
                          ]}
                          onPress={() => toggleItem(it.id)}
                          activeOpacity={0.8}
                        >
                          <TouchableOpacity onPress={() => toggleItem(it.id)}>
                            <Ionicons
                              name={isChecked ? 'checkbox' : 'square-outline'}
                              size={22}
                              color={isChecked ? '#10B981' : '#8A8FA8'}
                            />
                          </TouchableOpacity>

                          {it.image && (
                            <Image source={{ uri: it.image }} style={styles.itemThumbnail} resizeMode="cover" />
                          )}

                          <View style={{ flex: 1 }}>
                            <Text
                              style={[
                                styles.itemName,
                                isDarkMode && { color: '#F8FAFC' },
                                !isChecked && { color: '#94A3B8', textDecorationLine: 'line-through' },
                              ]}
                              numberOfLines={1}
                            >
                              {it.name}
                            </Text>
                            <Text style={styles.itemReasonTxt} numberOfLines={1}>
                              {it.reason || it.quantity || it.category}
                            </Text>
                          </View>

                          <Text style={[styles.itemPriceTxt, isDarkMode && { color: '#F8FAFC' }]}>
                            ₹{it.price}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </>
              )}

              {/* 1-Tap Add All Button */}
              {aiResult.items.length > 0 ? (
                <TouchableOpacity
                  style={[
                    styles.addAllBtn,
                    { backgroundColor: '#10B981' },
                    selectedCount === 0 && { opacity: 0.5 },
                  ]}
                  onPress={handleAddSelectedToCart}
                  disabled={selectedCount === 0}
                  activeOpacity={0.88}
                >
                  <Ionicons name="flash" size={18} color="#FFFFFF" />
                  <Text style={styles.addAllBtnTxt}>
                    ⚡ Add {selectedCount} Items to Cart • ₹{selectedTotal}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.addAllBtn, { backgroundColor: '#475569' }]}
                  onPress={startListening}
                  activeOpacity={0.88}
                >
                  <Ionicons name="mic-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.addAllBtnTxt}>
                    🎙️ Try Speaking Another Query
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.retryLink} onPress={startListening}>
                <Text style={[styles.retryLinkTxt, { color: '#10B981' }]}>
                  🎙️ Ask AI Something Else
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Error */}
          {phase === 'error' && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={32} color="#EF4444" />
              <Text style={styles.errorTxt}>{errorMsg}</Text>
              <TouchableOpacity
                style={styles.retryBtn}
                onPress={startListening}
                activeOpacity={0.85}
              >
                <Text style={styles.retryBtnTxt}>🎙️ Tap to Try Again</Text>
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
                  shadowColor: '#10B981',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.35,
                  shadowRadius: 12,
                  elevation: 12,
                },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.micBtn,
                  { backgroundColor: phase === 'listening' ? '#EF4444' : '#10B981' },
                ]}
                onPress={phase === 'listening' ? stopListening : startListening}
                activeOpacity={0.9}
              >
                <Ionicons
                  name={phase === 'listening' ? 'stop' : 'mic'}
                  size={36}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </Animated.View>
          )}

          <Text style={[styles.footer, isDarkMode && { color: '#475569' }]}>
            {phase === 'idle' ? 'Tap mic & speak gifts, recipes, outfits, or groceries' : ''}
            {phase === 'listening' ? 'Listening… speak now or tap stop' : ''}
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 36,
    maxHeight: '90%',
  },
  sheetDark: {
    backgroundColor: '#0F172A',
    borderTopColor: '#1E293B',
    borderTopWidth: 1,
  },
  handleBar: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnDark: {
    backgroundColor: '#1E293B',
  },
  hintBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  hintBoxDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  hintTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: '#64748B',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  hint: {
    fontSize: 12.5,
    color: '#334155',
    marginVertical: 4,
  },
  transcriptBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 12,
    marginVertical: 10,
    alignItems: 'center',
  },
  transcriptBoxDark: {
    backgroundColor: '#1E293B',
  },
  transcriptTxt: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#0F172A',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  waveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 44,
    marginVertical: 10,
  },
  bar: {
    width: 5,
    borderRadius: 3,
  },
  processingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 18,
  },
  processingTxt: {
    fontSize: 14,
    fontWeight: '700',
  },
  resultSection: {
    marginTop: 2,
    maxHeight: 420,
  },
  chatBubble: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  chatBubbleDark: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  chatBubbleTxt: {
    fontSize: 13,
    color: '#0F172A',
    lineHeight: 18,
    fontWeight: '500',
  },
  bundleHeaderCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bundleHeaderCardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  bundleTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  bundleSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  stepsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  stepsBox: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 4,
  },
  stepTxt: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
  },
  itemsListLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#64748B',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 4,
  },
  itemList: {
    maxHeight: 180,
  },
  itemCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 10,
    marginBottom: 8,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  itemCardRowSelected: {
    borderColor: 'rgba(16, 185, 129, 0.4)',
    backgroundColor: 'rgba(16, 185, 129, 0.04)',
  },
  itemThumbnail: {
    width: 38,
    height: 38,
    borderRadius: 8,
  },
  itemName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  itemReasonTxt: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  itemPriceTxt: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  itemRowDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  addAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 18,
    marginTop: 10,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addAllBtnTxt: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  retryLink: {
    alignItems: 'center',
    marginTop: 10,
  },
  retryLinkTxt: {
    fontSize: 13,
    fontWeight: '700',
  },
  errorBox: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  errorTxt: {
    fontSize: 13,
    color: '#EF4444',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  retryBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
    marginTop: 4,
  },
  retryBtnTxt: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  micWrapper: {
    alignSelf: 'center',
    marginVertical: 16,
  },
  micBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
  },
});
