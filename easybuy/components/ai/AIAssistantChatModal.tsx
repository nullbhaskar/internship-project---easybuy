import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  Image,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import {
  chatWithEasyBuyAI,
  AIChatMessage,
  AIChatResponse,
} from '../../services/groqAI';
import { voiceRecognition } from '../../services/voiceRecognition';
import { useCart } from '../../context/CartContext';
import { useAddress } from '../../context/AddressContext';

const { width } = Dimensions.get('window');

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  bundle?: AIChatResponse['bundle'];
}

interface AIAssistantChatModalProps {
  visible: boolean;
  onClose: () => void;
  isDarkMode?: boolean;
}

const STARTER_PROMPTS = [
  '🎁 Birthday gift for a friend',
  '🫖 Chai aur pakora recipe kit',
  '👗 College fest casual outfit',
  '💪 High protein gym diet',
  '⚡ 10-minute midnight snacks',
  '💬 Tell me a shopping joke',
];

export const AIAssistantChatModal: React.FC<AIAssistantChatModalProps> = ({
  visible,
  onClose,
  isDarkMode = false,
}) => {
  const { addToCart } = useCart();
  const { selectedStateName } = useAddress();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome_1',
      sender: 'assistant',
      text: 'Namaste! Main hoon aapka EasyBuy AI Assistant 🧠. Aap mujhse shopping, recipes, gift recommendations, college outfits, ya kisi bhi cheez ke baare mein baat kar sakte hain. Aaj main aapki kya madad karoon?',
      timestamp: 'Just now',
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [cartToast, setCartToast] = useState<string | null>(null);

  const scrollViewRef = useRef<ScrollView>(null);
  const voiceBreatheAnim = useRef(new Animated.Value(1)).current;

  // Auto-scroll on new message
  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isTyping, visible]);

  // Voice Pulse animation
  useEffect(() => {
    if (isListening) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(voiceBreatheAnim, { toValue: 1.18, duration: 400, useNativeDriver: false }),
          Animated.timing(voiceBreatheAnim, { toValue: 1.0, duration: 400, useNativeDriver: false }),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      voiceBreatheAnim.setValue(1);
    }
  }, [isListening]);

  const sendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isTyping) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setInputText('');

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      // Build conversation history
      const history: AIChatMessage[] = [...messages, userMsg].map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

      const res = await chatWithEasyBuyAI(history, selectedStateName);

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'assistant',
        text: res.replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        bundle: res.bundle,
      };

      setMessages((prev) => [...prev, aiMsg]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch (e) {
      console.log('[AIAssistantChat] Error:', e);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai_err_${Date.now()}`,
          sender: 'assistant',
          text: 'Oops, thoda network issue hua! Lekin main yahan hoon, aap dobara pooch sakte hain.',
          timestamp: 'Just now',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      voiceRecognition.stop();
      setIsListening(false);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setIsListening(true);

    voiceRecognition.start({
      onStart: () => {
        setIsListening(true);
      },
      onResult: (liveText, isFinal) => {
        setInputText(liveText);
        if (isFinal) {
          setIsListening(false);
          sendMessage(liveText);
        }
      },
      onError: () => {
        setIsListening(false);
      },
      onEnd: () => {
        setIsListening(false);
      },
    });
  };

  const handleAddBundleToCart = (bundle: NonNullable<ChatMessage['bundle']>) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    bundle.items.forEach((it) => {
      addToCart({
        id: it.id || `chat_ing_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        title: it.name,
        price: `₹${it.price || 149}`,
        image: it.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500',
        quantity: 1,
        unit: it.quantity,
      });
    });

    setCartToast(`✨ Added all ${bundle.items.length} items from ${bundle.title} to Cart!`);
    setTimeout(() => setCartToast(null), 3000);
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalBackdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.chatContainer, isDarkMode && styles.chatContainerDark]}>
          {/* ── HEADER ── */}
          <View style={[styles.header, isDarkMode && styles.headerDark]}>
            <View style={styles.headerAvatarWrap}>
              <View style={styles.headerAvatar}>
                <Ionicons name="sparkles" size={18} color="#FFFFFF" />
              </View>
              <View style={styles.onlineDot} />
            </View>

            <View style={{ flex: 1, marginLeft: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[styles.headerTitle, isDarkMode && { color: '#F8FAFC' }]}>
                  EasyBuy AI Concierge
                </Text>
                <View style={styles.aiPill}>
                  <Text style={styles.aiPillTxt}>Groq AI</Text>
                </View>
              </View>
              <Text style={[styles.headerSub, isDarkMode && { color: '#94A3B8' }]}>
                {selectedStateName ? `Active in ${selectedStateName}` : 'Always Online • Ask anything'}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => {
                setMessages([
                  {
                    id: 'welcome_reset',
                    sender: 'assistant',
                    text: 'Chat reset ho gaya! Main aapki kya madad karoon?',
                    timestamp: 'Just now',
                  },
                ]);
              }}
              style={styles.headerIconBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="refresh-outline" size={18} color={isDarkMode ? '#94A3B8' : '#64748B'} />
            </TouchableOpacity>

            <TouchableOpacity onPress={onClose} style={styles.headerIconBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={20} color={isDarkMode ? '#F8FAFC' : '#0F172A'} />
            </TouchableOpacity>
          </View>

          {/* ── TOAST NOTIFICATION ── */}
          {cartToast && (
            <View style={styles.cartToast}>
              <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
              <Text style={styles.cartToastTxt}>{cartToast}</Text>
            </View>
          )}

          {/* ── CHAT MESSAGES SCROLLVIEW ── */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesScroll}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {messages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.messageWrapper,
                  msg.sender === 'user' ? styles.userMsgWrap : styles.aiMsgWrap,
                ]}
              >
                {msg.sender === 'assistant' && (
                  <View style={styles.aiSmallAvatar}>
                    <Ionicons name="sparkles" size={12} color="#FFFFFF" />
                  </View>
                )}

                <View style={{ maxWidth: '82%' }}>
                  <View
                    style={[
                      styles.messageBubble,
                      msg.sender === 'user'
                        ? styles.userBubble
                        : isDarkMode
                        ? styles.aiBubbleDark
                        : styles.aiBubble,
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        msg.sender === 'user'
                          ? styles.userText
                          : isDarkMode
                          ? styles.aiTextDark
                          : styles.aiText,
                      ]}
                    >
                      {msg.text}
                    </Text>

                    {/* ── ATTACHED PRODUCT / RECIPE BUNDLE CARD ── */}
                    {msg.bundle && msg.bundle.items && msg.bundle.items.length > 0 && (
                      <View style={styles.embeddedBundleCard}>
                        <View style={styles.bundleCardHeader}>
                          <Text style={{ fontSize: 24 }}>{msg.bundle.emoji}</Text>
                          <View style={{ flex: 1, marginLeft: 8 }}>
                            <Text style={styles.bundleCardTitle}>{msg.bundle.title}</Text>
                            {msg.bundle.tagline && (
                              <Text style={styles.bundleCardTagline}>{msg.bundle.tagline}</Text>
                            )}
                          </View>
                        </View>

                        {/* Items preview list */}
                        <View style={styles.bundleItemsList}>
                          {msg.bundle.items.map((it) => (
                            <View key={it.id} style={styles.bundleItemRow}>
                              {it.image && (
                                <Image
                                  source={{ uri: it.image }}
                                  style={styles.bundleItemThumb}
                                  resizeMode="cover"
                                />
                              )}
                              <View style={{ flex: 1, marginLeft: 8 }}>
                                <Text style={styles.bundleItemName} numberOfLines={1}>
                                  {it.name}
                                </Text>
                                <Text style={styles.bundleItemReason}>
                                  {it.reason || it.quantity || it.category}
                                </Text>
                              </View>
                              <Text style={styles.bundleItemPrice}>₹{it.price}</Text>
                            </View>
                          ))}
                        </View>

                        {/* 1-Tap Add Bundle Button */}
                        <TouchableOpacity
                          style={styles.addBundleBtn}
                          onPress={() => handleAddBundleToCart(msg.bundle!)}
                          activeOpacity={0.88}
                        >
                          <Ionicons name="flash" size={15} color="#FFFFFF" />
                          <Text style={styles.addBundleBtnTxt}>
                            ⚡ Add All {msg.bundle.items.length} Items to Cart • ₹
                            {msg.bundle.totalPrice || 299}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>

                  <Text
                    style={[
                      styles.timestamp,
                      msg.sender === 'user' ? { textAlign: 'right' } : { textAlign: 'left' },
                    ]}
                  >
                    {msg.timestamp}
                  </Text>
                </View>
              </View>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <View style={[styles.messageWrapper, styles.aiMsgWrap]}>
                <View style={styles.aiSmallAvatar}>
                  <Ionicons name="sparkles" size={12} color="#FFFFFF" />
                </View>
                <View style={[styles.messageBubble, isDarkMode ? styles.aiBubbleDark : styles.aiBubble, { paddingVertical: 10, paddingHorizontal: 16 }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <ActivityIndicator size="small" color="#10B981" />
                    <Text style={{ fontSize: 12, color: '#10B981', fontWeight: '600' }}>
                      EasyBuy AI is thinking…
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          {/* ── STARTER SUGGESTION CHIPS ── */}
          <View style={styles.starterChipsWrap}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
              {STARTER_PROMPTS.map((prompt, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.starterChip, isDarkMode && styles.starterChipDark]}
                  onPress={() => sendMessage(prompt)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.starterChipTxt, isDarkMode && { color: '#CBD5E1' }]}>
                    {prompt}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* ── INPUT BAR ── */}
          <View style={[styles.inputBar, isDarkMode && styles.inputBarDark]}>
            <TouchableOpacity
              style={[
                styles.voiceMicBtn,
                isListening && { backgroundColor: '#EF4444' },
              ]}
              onPress={toggleVoiceInput}
              activeOpacity={0.8}
            >
              <Animated.View style={{ transform: [{ scale: voiceBreatheAnim }] }}>
                <Ionicons
                  name={isListening ? 'stop' : 'mic'}
                  size={20}
                  color="#FFFFFF"
                />
              </Animated.View>
            </TouchableOpacity>

            <TextInput
              style={[styles.textInput, isDarkMode && styles.textInputDark]}
              placeholder={isListening ? 'Listening… speak now 🎙️' : 'Ask anything in Hindi or English…'}
              placeholderTextColor={isListening ? '#10B981' : isDarkMode ? '#64748B' : '#94A3B8'}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={() => sendMessage()}
              returnKeyType="send"
            />

            <TouchableOpacity
              style={[
                styles.sendBtn,
                inputText.trim().length === 0 && { opacity: 0.4 },
              ]}
              onPress={() => sendMessage()}
              disabled={inputText.trim().length === 0 || isTyping}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-up" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  chatContainer: {
    height: '92%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  chatContainerDark: {
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerDark: {
    borderBottomColor: '#1E293B',
  },
  headerAvatarWrap: {
    position: 'relative',
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  aiPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  aiPillTxt: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10B981',
  },
  headerIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  cartToast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    gap: 8,
  },
  cartToastTxt: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  messagesScroll: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 14,
  },
  messageWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  userMsgWrap: {
    justifyContent: 'flex-end',
  },
  aiMsgWrap: {
    justifyContent: 'flex-start',
  },
  aiSmallAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  messageBubble: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: '#10B981',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#F8FAFC',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  aiBubbleDark: {
    backgroundColor: '#1E293B',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  aiText: {
    color: '#0F172A',
  },
  aiTextDark: {
    color: '#F8FAFC',
  },
  timestamp: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 4,
  },
  embeddedBundleCard: {
    marginTop: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  bundleCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bundleCardTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  bundleCardTagline: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  bundleItemsList: {
    gap: 6,
    marginVertical: 8,
  },
  bundleItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    padding: 6,
    borderRadius: 8,
  },
  bundleItemThumb: {
    width: 28,
    height: 28,
    borderRadius: 6,
  },
  bundleItemName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  bundleItemReason: {
    fontSize: 10,
    color: '#64748B',
  },
  bundleItemPrice: {
    fontSize: 12,
    fontWeight: '800',
    color: '#10B981',
    marginLeft: 6,
  },
  addBundleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 9,
    borderRadius: 10,
    marginTop: 6,
    gap: 6,
  },
  addBundleBtnTxt: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  starterChipsWrap: {
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  starterChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  starterChipDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  starterChipTxt: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 8,
  },
  inputBarDark: {
    backgroundColor: '#0F172A',
    borderTopColor: '#1E293B',
  },
  voiceMicBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 9,
    fontSize: 14,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  textInputDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    color: '#F8FAFC',
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
