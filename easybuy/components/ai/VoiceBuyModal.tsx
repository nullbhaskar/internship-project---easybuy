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
  parseVoiceToCart,
  ParsedCartItem,
  generateRecipeOccasionBundle,
  RecipeOccasionBundle,
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

  const [phase, setPhase] = useState<'idle' | 'listening' | 'processing' | 'result' | 'recipe' | 'error'>(
    'idle'
  );
  const [transcript, setTranscript] = useState('');
  const [parsedItems, setParsedItems] = useState<ParsedCartItem[]>([]);
  const [recipeBundle, setRecipeBundle] = useState<RecipeOccasionBundle | null>(null);
  const [selectedIngredients, setSelectedIngredients] = useState<Record<string, boolean>>({});
  const [errorMsg, setErrorMsg] = useState('');
  const [showCookingSteps, setShowCookingSteps] = useState(false);

  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      voiceRecognition.stop();
      setPhase('idle');
      setTranscript('');
      setParsedItems([]);
      setRecipeBundle(null);
      setSelectedIngredients({});
      setShowCookingSteps(false);
    }
  }, [visible]);

  const startListening = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setPhase('listening');
    setTranscript('');
    setParsedItems([]);
    setRecipeBundle(null);
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
        console.log('[VoiceBuyModal] Error:', err);
        // Fallback: If microphone ended without speech, allow manual or retry
        if (!transcript) {
          setErrorMsg('Could not detect speech. Please tap the mic and speak clearly.');
          setPhase('error');
        }
      },
      onEnd: () => {
        // If transcript exists, process it
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
      // 1. Check if user asked for a Recipe / Meal / Dish / Occasion
      const bundle = await generateRecipeOccasionBundle(text, selectedStateName);

      if (bundle && bundle.ingredients && bundle.ingredients.length > 0) {
        setRecipeBundle(bundle);
        const selMap: Record<string, boolean> = {};
        bundle.ingredients.forEach((ing) => {
          selMap[ing.id] = true;
        });
        setSelectedIngredients(selMap);
        setPhase('recipe');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        return;
      }

      // 2. Standard Multi-Item Shopping Cart Parser
      const items = await parseVoiceToCart(text);
      if (items.length === 0) {
        setErrorMsg(`Could not recognize items from "${text}". Try asking for a recipe or grocery items!`);
        setPhase('error');
      } else {
        setParsedItems(items);
        setPhase('result');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
    } catch (e: any) {
      setErrorMsg('AI service temporarily busy. Please try again.');
      setPhase('error');
    }
  };

  const toggleIngredient = (id: string) => {
    Haptics.selectionAsync().catch(() => {});
    setSelectedIngredients((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleAddRecipeKitToCart = () => {
    if (!recipeBundle) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    const activeIngredients = recipeBundle.ingredients.filter((ing) => selectedIngredients[ing.id]);

    activeIngredients.forEach((ing) => {
      addToCart({
        id: ing.id,
        title: ing.name,
        price: `₹${ing.price}`,
        image: ing.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500',
        quantity: 1,
        unit: ing.quantity,
      });
    });

    onAddToCart?.(activeIngredients);
    onClose();
  };

  const handleAddAllShoppingItems = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

    parsedItems.forEach((item, idx) => {
      addToCart({
        id: `voice_item_${Date.now()}_${idx}`,
        title: item.name,
        price: '₹149',
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500',
        quantity: item.quantity || 1,
      });
    });

    onAddToCart?.(parsedItems);
    onClose();
  };

  const CATEGORY_COLORS: Record<string, string> = {
    grocery: '#16A34A',
    beauty: '#DB2777',
    fashion: '#7C3AED',
    tech: '#2563EB',
    ethnic_wear: '#EA580C',
    kids: '#D97706',
  };

  const accentColor = isDarkMode ? '#10B981' : '#10B981';

  // Dynamic Recipe Price
  const recipeSelectedCount = recipeBundle?.ingredients.filter((i) => selectedIngredients[i.id]).length || 0;
  const recipeSelectedTotal =
    recipeBundle?.ingredients
      .filter((i) => selectedIngredients[i.id])
      .reduce((sum, item) => sum + (item.price || 40), 0) || 0;

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
                Voice Recipe & Cart AI 🎙️⚡
              </Text>
              <Text style={[styles.subtitle, isDarkMode && { color: '#94A3B8' }]}>
                Speak any recipe or shopping list in Hindi / English
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
                Try speaking:
              </Text>
              <TouchableOpacity onPress={() => processVoice('Chai aur pakora banana hai 4 logo ke liye')} activeOpacity={0.7}>
                <Text style={[styles.hint, isDarkMode && { color: '#CBD5E1' }]}>
                  🫖 &quot;Chai aur pakora banana hai 4 logo ke liye&quot;
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => processVoice('Pav bhaji dinner kit for family')} activeOpacity={0.7}>
                <Text style={[styles.hint, isDarkMode && { color: '#CBD5E1' }]}>
                  🍛 &quot;Pav bhaji dinner kit for family&quot;
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => processVoice('2 liter milk, brown bread aur sattu add karo')} activeOpacity={0.7}>
                <Text style={[styles.hint, isDarkMode && { color: '#CBD5E1' }]}>
                  🛒 &quot;2 liter milk, brown bread aur sattu add karo&quot;
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
              <Ionicons name="sparkles" size={20} color="#10B981" />
              <Text style={[styles.processingTxt, { color: '#10B981' }]}>
                AI is assembling your ingredient kit & cart…
              </Text>
            </View>
          )}

          {/* ─── RECIPE & OCCASION KIT RESULT ─── */}
          {phase === 'recipe' && recipeBundle && (
            <View style={styles.resultSection}>
              {/* Recipe Header Card */}
              <View style={[styles.recipeCardHeader, isDarkMode && styles.recipeCardHeaderDark]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Text style={{ fontSize: 32 }}>{recipeBundle.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.recipeTitle, isDarkMode && { color: '#F8FAFC' }]}>
                      {recipeBundle.recipeName}
                    </Text>
                    <Text style={[styles.recipeSubtitle, isDarkMode && { color: '#94A3B8' }]} numberOfLines={2}>
                      {recipeBundle.tagline}
                    </Text>
                  </View>
                </View>

                {/* Recipe Meta Badges */}
                <View style={styles.recipeMetaRow}>
                  <View style={styles.recipeBadge}>
                    <Ionicons name="people-outline" size={13} color="#10B981" />
                    <Text style={styles.recipeBadgeTxt}>{recipeBundle.servings}</Text>
                  </View>
                  <View style={styles.recipeBadge}>
                    <Ionicons name="time-outline" size={13} color="#10B981" />
                    <Text style={styles.recipeBadgeTxt}>{recipeBundle.prepTime}</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.recipeBadge, { backgroundColor: showCookingSteps ? '#10B981' : 'rgba(16, 185, 129, 0.15)' }]}
                    onPress={() => setShowCookingSteps(!showCookingSteps)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="restaurant-outline" size={13} color={showCookingSteps ? '#FFFFFF' : '#10B981'} />
                    <Text style={[styles.recipeBadgeTxt, showCookingSteps && { color: '#FFFFFF' }]}>
                      {showCookingSteps ? 'Hide Recipe' : 'View Steps'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Optional Cooking Steps */}
                {showCookingSteps && recipeBundle.steps && (
                  <View style={styles.stepsBox}>
                    {recipeBundle.steps.map((st, sidx) => (
                      <Text key={sidx} style={styles.stepTxt}>
                        {st}
                      </Text>
                    ))}
                  </View>
                )}
              </View>

              {/* Ingredients List */}
              <Text style={[styles.ingredientsHeader, isDarkMode && { color: '#94A3B8' }]}>
                SELECT INGREDIENTS TO ORDER ({recipeSelectedCount}/{recipeBundle.ingredients.length})
              </Text>

              <ScrollView style={styles.itemList} showsVerticalScrollIndicator={false}>
                {recipeBundle.ingredients.map((ing) => {
                  const isChecked = selectedIngredients[ing.id];
                  return (
                    <TouchableOpacity
                      key={ing.id}
                      style={[
                        styles.ingredientRow,
                        isDarkMode && styles.itemRowDark,
                        isChecked && styles.ingredientRowSelected,
                      ]}
                      onPress={() => toggleIngredient(ing.id)}
                      activeOpacity={0.8}
                    >
                      <TouchableOpacity onPress={() => toggleIngredient(ing.id)}>
                        <Ionicons
                          name={isChecked ? 'checkbox' : 'square-outline'}
                          size={22}
                          color={isChecked ? '#10B981' : '#8A8FA8'}
                        />
                      </TouchableOpacity>

                      {ing.image && (
                        <Image source={{ uri: ing.image }} style={styles.ingThumbnail} resizeMode="cover" />
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
                          {ing.name}
                        </Text>
                        <Text style={styles.ingQtyTxt}>{ing.quantity}</Text>
                      </View>

                      <Text style={[styles.ingPriceTxt, isDarkMode && { color: '#F8FAFC' }]}>
                        ₹{ing.price}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Add All Ingredients Button */}
              <TouchableOpacity
                style={[
                  styles.addAllBtn,
                  { backgroundColor: '#10B981' },
                  recipeSelectedCount === 0 && { opacity: 0.5 },
                ]}
                onPress={handleAddRecipeKitToCart}
                disabled={recipeSelectedCount === 0}
                activeOpacity={0.88}
              >
                <Ionicons name="flash" size={18} color="#FFFFFF" />
                <Text style={styles.addAllBtnTxt}>
                  ⚡ Add {recipeSelectedCount} Items to Cart • ₹{recipeSelectedTotal}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.retryLink} onPress={startListening}>
                <Text style={[styles.retryLinkTxt, { color: '#10B981' }]}>
                  🎙️ Try Another Recipe / Dish
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ─── STANDARD MULTI-ITEM SHOPPING CART RESULT ─── */}
          {phase === 'result' && parsedItems.length > 0 && (
            <View style={styles.resultSection}>
              <Text style={[styles.resultTitle, isDarkMode && { color: '#F8FAFC' }]}>
                ✅ Identified {parsedItems.length} item{parsedItems.length > 1 ? 's' : ''}
              </Text>

              <ScrollView style={styles.itemList} showsVerticalScrollIndicator={false}>
                {parsedItems.map((item, i) => {
                  const catColor = CATEGORY_COLORS[item.category] ?? '#10B981';
                  return (
                    <View key={i} style={[styles.itemRow, isDarkMode && styles.itemRowDark]}>
                      <View style={[styles.itemQtyBadge, { backgroundColor: catColor }]}>
                        <Text style={styles.itemQtyTxt}>{item.quantity}×</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.itemName, isDarkMode && { color: '#F8FAFC' }]} numberOfLines={1}>
                          {item.name}
                        </Text>
                        <Text style={[styles.itemCat, { color: catColor }]}>
                          {item.category.replace('_', ' ')}
                        </Text>
                      </View>
                      <Ionicons name="checkmark-circle" size={20} color={catColor} />
                    </View>
                  );
                })}
              </ScrollView>

              <TouchableOpacity
                style={[styles.addAllBtn, { backgroundColor: '#10B981' }]}
                onPress={handleAddAllShoppingItems}
                activeOpacity={0.88}
              >
                <Ionicons name="cart" size={18} color="#FFFFFF" />
                <Text style={styles.addAllBtnTxt}>Add All to Cart</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.retryLink} onPress={startListening}>
                <Text style={[styles.retryLinkTxt, { color: '#10B981' }]}>
                  🎙️ Speak Again
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
            {phase === 'idle' ? 'Tap mic to start speaking recipe or items' : ''}
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
    maxHeight: '88%',
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
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
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
    marginBottom: 18,
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
    fontSize: 13,
    color: '#334155',
    marginVertical: 4,
  },
  transcriptBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 12,
    marginVertical: 12,
    alignItems: 'center',
  },
  transcriptBoxDark: {
    backgroundColor: '#1E293B',
  },
  transcriptTxt: {
    fontSize: 15,
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
    height: 48,
    marginVertical: 14,
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
    marginVertical: 20,
  },
  processingTxt: {
    fontSize: 14,
    fontWeight: '700',
  },
  resultSection: {
    marginTop: 4,
    maxHeight: 380,
  },
  recipeCardHeader: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  recipeCardHeaderDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  recipeSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  recipeMetaRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  recipeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  recipeBadgeTxt: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
  },
  stepsBox: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 4,
  },
  stepTxt: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
  },
  ingredientsHeader: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#64748B',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 6,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },
  itemList: {
    maxHeight: 180,
  },
  ingredientRow: {
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
  ingredientRowSelected: {
    borderColor: 'rgba(16, 185, 129, 0.4)',
    backgroundColor: 'rgba(16, 185, 129, 0.04)',
  },
  ingThumbnail: {
    width: 38,
    height: 38,
    borderRadius: 8,
  },
  ingQtyTxt: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  ingPriceTxt: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  itemRowDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  itemQtyBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemQtyTxt: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  itemCat: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
    marginTop: 2,
  },
  addAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 18,
    marginTop: 12,
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
    marginVertical: 18,
  },
  micBtn: {
    width: 74,
    height: 74,
    borderRadius: 37,
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
