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
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import {
  chatWithEasyBuyAI,
  AIChatMessage,
  AIChatResponse,
} from '../../services/groqAI';
import { voiceRecognition } from '../../services/voiceRecognition';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAddress } from '../../context/AddressContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

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

const SUGGESTED_ACTIONS = [
  { text: 'Birthday gift for a friend', icon: 'gift-outline' },
  { text: 'Office supply restock', icon: 'cube-outline' },
  { text: 'Local dinner recommendations', icon: 'restaurant-outline' },
];

export const AIAssistantChatModal: React.FC<AIAssistantChatModalProps> = ({
  visible,
  onClose,
  isDarkMode = false,
}) => {
  const { addToCart } = useCart();
  const { toggleWishlist } = useWishlist();
  const { selectedStateName } = useAddress();
  const { user } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome_1',
      sender: 'assistant',
      text: 'Good morning. I am your EasyBuy AI Assistant. How can I assist you with your purchases or errands today?',
      timestamp: '',
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
    const userQuery = (textToSend || inputText).trim();
    if (!userQuery || isTyping) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setInputText('');

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: userQuery,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      // Build conversation history (Ensure the AI actually sees the bundles it previously generated)
      const history: AIChatMessage[] = [...messages, userMsg].map((m) => {
        let content = m.text;
        if (m.bundle && m.bundle.items && m.bundle.items.length > 0) {
          const itemsText = m.bundle.items.map((it, idx) => `${idx + 1}. ${it.name} (ID: ${it.id})`).join(', ');
          content += `\n[I showed the user these items: ${itemsText}]`;
        }
        return {
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: content,
        };
      });

      let userOrdersContext = 'USER RECENT ORDERS: [User is not logged in. Ask them to log in to track orders]';
      if (user) {
        try {
          const q = query(
            collection(db, 'orders'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc'),
            limit(3)
          );
          const snap = await getDocs(q);
          if (!snap.empty) {
            const orders = snap.docs.map(d => d.data());
            userOrdersContext = 'USER RECENT ORDERS:\n' + orders.map((o: any, i) => 
              `${i+1}. Order ID: ${o.id || 'N/A'}, Total: ₹${o.totalAmount}, Status: ${o.status || 'Processing'}, Items: ${o.items?.map((it:any)=>it.title).join(', ')}`
            ).join('\n');
          } else {
            userOrdersContext = 'USER RECENT ORDERS: [No recent orders found for this user]';
          }
        } catch (err) {
          console.log('Error fetching orders for AI context', err);
          userOrdersContext = 'USER RECENT ORDERS: [Error fetching orders]';
        }
      }

      const res = await chatWithEasyBuyAI(history, selectedStateName, false, userOrdersContext);

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'assistant',
        text: res.replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        bundle: res.bundle,
      };

      setMessages((prev) => [...prev, aiMsg]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      
      // Handle Auto Actions
      if (res.action === 'ADD_TO_WISHLIST' && res.actionPayload && res.bundle) {
        const itemToAdd = res.bundle.items.find(i => i.id === res.actionPayload) || res.bundle.items[0];
        if (itemToAdd) {
          toggleWishlist({
            id: itemToAdd.id,
            title: itemToAdd.name,
            price: `₹${itemToAdd.price}`,
            image: itemToAdd.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500',
          });
          setCartToast(`💖 Saved ${itemToAdd.name} to Wishlist!`);
          setTimeout(() => setCartToast(null), 4000);
        }
      }

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

  const handleAddSingleItemToCart = (it: any) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    addToCart({
      id: it.id || `chat_ing_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      title: it.name,
      price: `₹${it.price || 149}`,
      image: it.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500',
      quantity: 1,
      unit: it.quantity,
    });

    setCartToast(`✨ Added ${it.name} to Cart!`);
    setTimeout(() => setCartToast(null), 3000);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={StyleSheet.absoluteFill}>
          <BlurView intensity={30} tint={isDarkMode ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        </View>
      </TouchableWithoutFeedback>
      
      <KeyboardAvoidingView
        style={styles.modalBackdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        pointerEvents="box-none"
      >
        <View style={[styles.chatContainer, isDarkMode && styles.chatContainerDark]}>
          {/* ── HEADER ── */}
          <View style={[styles.header, isDarkMode && styles.headerDark]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.headerTitle, isDarkMode && { color: '#F8FAFC' }]}>
                EasyBuy AI
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                <View style={styles.headerDot} />
                <Text style={[styles.headerSub, isDarkMode && { color: '#94A3B8' }]}>
                  ACTIVE
                </Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.headerProfileIcon} activeOpacity={0.7}>
              <Ionicons name="close" size={18} color="#FFF" />
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
                    <Ionicons name="hardware-chip" size={14} color="#FFFFFF" />
                  </View>
                )}

                <View style={{ maxWidth: '82%' }}>
                  {msg.sender === 'user' ? (
                    <LinearGradient
                      colors={['#10B981', '#059669']} // Premium Emerald gradient
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[styles.messageBubble, styles.userBubble]}
                    >
                      <Text style={[styles.messageText, styles.userText]}>
                        {msg.text}
                      </Text>
                    </LinearGradient>
                  ) : (
                    <View
                      style={[
                        styles.messageBubble,
                        isDarkMode ? styles.aiBubbleDark : styles.aiBubble,
                      ]}
                    >
                      <Text
                        style={[
                          styles.messageText,
                          isDarkMode ? styles.aiTextDark : styles.aiText,
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
                              <TouchableOpacity 
                                style={{ backgroundColor: '#10B981', padding: 6, borderRadius: 20, marginLeft: 10 }}
                                onPress={() => handleAddSingleItemToCart(it)}
                                activeOpacity={0.7}
                              >
                                <Ionicons name="add" size={16} color="#FFF" />
                              </TouchableOpacity>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}
                  </View>
                  )}

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
                  <Ionicons name="hardware-chip" size={14} color="#FFFFFF" />
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

          {/* ── SUGGESTED ACTIONS ── */}
          {messages.length === 1 && !isTyping && (
            <View style={styles.starterChipsWrap}>
              <Text style={styles.suggestedTitle}>SUGGESTED ACTIONS</Text>
              <View style={styles.suggestedList}>
                {SUGGESTED_ACTIONS.map((action, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.starterChip, isDarkMode && styles.starterChipDark]}
                    onPress={() => sendMessage(action.text)}
                    activeOpacity={0.75}
                  >
                    <Ionicons name={action.icon as any} size={16} color="#10B981" />
                    <Text style={[styles.starterChipTxt, isDarkMode && { color: '#CBD5E1' }]}>
                      {action.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* ── INPUT BAR ── */}
          <View style={styles.bottomSection}>
            <View style={[styles.inputBox, isDarkMode && styles.inputBoxDark]}>
              <TouchableOpacity onPress={toggleVoiceInput} activeOpacity={0.8} style={{ padding: 6 }}>
                <Ionicons
                  name={isListening ? 'stop' : 'mic-outline'}
                  size={20}
                  color={isListening ? '#EF4444' : '#64748B'}
                />
              </TouchableOpacity>

              <TextInput
                style={[styles.textInput, isDarkMode && styles.textInputDark]}
                placeholder={isListening ? 'Listening...' : 'Type your request here...'}
                placeholderTextColor="#94A3B8"
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={() => sendMessage()}
                returnKeyType="send"
              />

              <TouchableOpacity
                style={{ padding: 6, opacity: inputText.trim().length === 0 ? 0.4 : 1 }}
                onPress={() => sendMessage()}
                disabled={inputText.trim().length === 0 || isTyping}
                activeOpacity={0.8}
              >
                <Ionicons name="send-outline" size={18} color="#0F172A" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.footerText}>Powered by EasyBuy AI</Text>
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
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerDark: {
    borderBottomColor: '#1E293B',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  headerSub: {
    fontSize: 10,
    fontWeight: '600',
    color: '#10B981',
    letterSpacing: 0.5,
  },
  headerProfileIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  userBubble: {
    backgroundColor: '#10B981',
  },
  aiBubble: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  aiBubbleDark: {
    backgroundColor: '#1E293B',
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
    fontWeight: '700',
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
    fontWeight: '700',
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
    fontWeight: '700',
    color: '#FFFFFF',
  },
  starterChipsWrap: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  suggestedTitle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  suggestedList: {
    alignItems: 'flex-start',
    gap: 10,
  },
  starterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  starterChipDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  starterChipTxt: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '500',
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    backgroundColor: '#FFFFFF',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  inputBoxDark: {
    backgroundColor: '#1E293B',
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    paddingHorizontal: 8,
  },
  textInputDark: {
    color: '#F8FAFC',
  },
  footerText: {
    textAlign: 'center',
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 12,
  },
});



