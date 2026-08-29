import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  Easing,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { CSSOrbWebView } from './CSSOrbWebView';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { chatWithEasyBuyAI, AIChatMessage } from '../../services/groqAI';
import { voiceRecognition } from '../../services/voiceRecognition';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

const { width, height } = Dimensions.get('window');

interface GeminiVoiceModeProps {
  visible: boolean;
  onClose: () => void;
  stateName?: string;
}

export function GeminiVoiceMode({ visible, onClose, stateName }: GeminiVoiceModeProps) {
  const [history, setHistory] = useState<AIChatMessage[]>([]);
  const [status, setStatus] = useState<'IDLE' | 'LISTENING' | 'THINKING' | 'SPEAKING'>('IDLE');
  const [inputText, setInputText] = useState('');
  const [aiSpeechText, setAiSpeechText] = useState('');
  const [volume, setVolume] = useState(0);

  const { addToCart } = useCart();
  const { toggleWishlist } = useWishlist();
  const { user } = useAuth();
  
  // VOICE PICKER STATE
  const [showVoicePicker, setShowVoicePicker] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<Speech.Voice[]>([]);
  const [activeVoiceId, setActiveVoiceId] = useState<string>('');

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ring1Anim = useRef(new Animated.Value(1)).current;
  const ring2Anim = useRef(new Animated.Value(1)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Load voices on mount
    Speech.getAvailableVoicesAsync().then(voices => {
      // STRICT FILTER: Only show Google Hindi or any Hindi voice if Google Hindi is not found
      let hindiVoices = voices.filter(v => v.name.includes('Google') && (v.name.includes('हिन्दी') || v.name.includes('Hindi')));
      if (hindiVoices.length === 0) {
        hindiVoices = voices.filter(v => v.language.includes('hi'));
      }
      // If still no Hindi voice, fallback to a single default to prevent empty lists
      const finalVoices = hindiVoices.length > 0 ? hindiVoices : voices.slice(0, 1);
      
      setAvailableVoices(finalVoices);
      if (finalVoices.length > 0) setActiveVoiceId(finalVoices[0].identifier);
    });
  }, []);

  const speakText = async (textToSpeak: string, overrideVoice?: string) => {
    try {
      Speech.speak(textToSpeak, {
        language: 'en-IN',
        pitch: 0.9,
        rate: 0.85,
        voice: overrideVoice || activeVoiceId || undefined,
        onDone: () => setStatus('IDLE'),
        onError: () => setStatus('IDLE'),
      });
    } catch (e) {
      console.log(e);
    }
  };

  const testVoice = (voiceId: string) => {
    Speech.stop();
    setActiveVoiceId(voiceId);
    setStatus('SPEAKING');
    setAiSpeechText('Testing this voice profile.');
    Animated.timing(textOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    speakText('Testing this voice profile. Do you like how I sound?', voiceId);
  };

  useEffect(() => {
    let interval: any;
    if (status === 'LISTENING' || status === 'SPEAKING') {
      interval = setInterval(() => {
        setVolume(Math.random() * 0.5 + 0.1);
      }, 250);
    } else {
      setVolume(0);
    }
    return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
    if (visible && !showVoicePicker) {
      const hour = new Date().getHours();
      let greeting = 'Good evening';
      if (hour < 12) greeting = 'Good morning';
      else if (hour < 17) greeting = 'Good afternoon';
      
      const welcomeText = greeting + ' Bhaskar. I am your EasyBuy Assistant. How can I help you today?';
      
      setHistory([{ role: 'assistant', content: welcomeText }]);
      setAiSpeechText(welcomeText);
      setStatus('SPEAKING');
      Animated.timing(textOpacity, { toValue: 1, duration: 800, useNativeDriver: true }).start();
      speakText(welcomeText);
    }
  }, [visible]);

  useEffect(() => {
    if (visible && status !== 'IDLE') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: status === 'THINKING' ? 1.3 : (status === 'SPEAKING' ? 1.15 : 1.05), duration: status === 'THINKING' ? 300 : 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: status === 'THINKING' ? 300 : 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
        ])
      ).start();

      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(ring1Anim, { toValue: 1.8, duration: 1000, easing: Easing.out(Easing.ease), useNativeDriver: true }),
            Animated.timing(ring1Anim, { toValue: 1, duration: 0, useNativeDriver: true })
          ]),
          Animated.sequence([
            Animated.delay(500),
            Animated.timing(ring2Anim, { toValue: 1.8, duration: 1000, easing: Easing.out(Easing.ease), useNativeDriver: true }),
            Animated.timing(ring2Anim, { toValue: 1, duration: 0, useNativeDriver: true })
          ])
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation(); ring1Anim.stopAnimation(); ring2Anim.stopAnimation();
    }
  }, [visible, status]);

  const startListening = () => {
    if (status !== 'IDLE') return;
    Speech.stop();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(()=>{});
    setStatus('LISTENING');
    setInputText('');
    setAiSpeechText('');
    
    voiceRecognition.start({
      onStart: () => setStatus('LISTENING'),
      onResult: (transcript, isFinal) => {
        setInputText(transcript);
        if (isFinal) processInputText(transcript);
      },
      onError: (error) => {
        setStatus('IDLE');
        setAiSpeechText('Microphone error: ' + error);
        Animated.timing(textOpacity, { toValue: 1, duration: 500, useNativeDriver: true }).start();
      },
      onEnd: () => { if ((status as string) === 'LISTENING') setStatus('IDLE'); }
    });
  };

  const simulateSpeech = async () => {
    if (status !== 'IDLE') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(()=>{});
    Speech.stop();
    setStatus('LISTENING');
    setAiSpeechText('');
    
    const userQuery = "Hey EasyBuy, who developed you?";
    setInputText('');
    for (let i = 0; i <= userQuery.length; i++) {
      setInputText(userQuery.substring(0, i));
      await new Promise(r => setTimeout(r, 40));
    }
    await new Promise(r => setTimeout(r, 500));
    await processInputText(userQuery);
  };

  const handleSendText = async () => {
    if (!inputText.trim() || status !== 'IDLE') return;
    await processInputText(inputText.trim());
  };

  const processInputText = async (textToProcess: string) => {
    voiceRecognition.stop();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(()=>{});
    Speech.stop();
    setStatus('THINKING');
    textOpacity.setValue(0);
    
    const userMsg: AIChatMessage = { role: 'user', content: textToProcess };
    const newHistory = [...history, userMsg];
    setHistory(newHistory);
    setInputText('');
    
    let userOrdersContext = '';
    if (user) {
      try {
        const q = query(collection(db, 'orders'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'), limit(3));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const orders = snap.docs.map(d => d.data());
          userOrdersContext = 'USER RECENT ORDERS:\n' + orders.map((o: any, i) => 
            `${i+1}. Order ID: ${o.id || 'N/A'}, Total: ₹${o.totalAmount}, Status: ${o.status || 'Processing'}`
          ).join('\n');
        }
      } catch (err) {
        console.log('Error fetching orders for AI context', err);
      }
    }
    
    try {
      const res = await chatWithEasyBuyAI(newHistory, stateName, true, userOrdersContext);
      setHistory([...newHistory, { role: 'assistant', content: res.replyText }]);
      setAiSpeechText(res.replyText);
      setStatus('SPEAKING');
      Animated.timing(textOpacity, { toValue: 1, duration: 800, useNativeDriver: true }).start();
      speakText(res.replyText);

      // Handle Auto Actions
      if (res.action === 'ADD_TO_WISHLIST' && res.actionPayload) {
        toggleWishlist({
          id: res.actionPayload,
          title: 'Product (Saved via Voice)',
          price: '₹...',
        });
      }

    } catch (e) {
      setAiSpeechText('Connection lost.');
      Animated.timing(textOpacity, { toValue: 1, duration: 500, useNativeDriver: true }).start();
      setStatus('IDLE');
    }
  };

  const stopAndClose = () => {
    Speech.stop();
    voiceRecognition.stop();
    onClose();
  };

  if (!visible) return null;

  let activeColor = '#ffffff';
  if (status === 'LISTENING') activeColor = '#00e676';
  else if (status === 'THINKING') activeColor = '#00b0ff';
  else if (status === 'SPEAKING') activeColor = '#d500f9';

  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      
<BlurView intensity={90} tint="dark" style={styles.absoluteFill}>
  <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
    <View style={styles.modalWindow}>
      
      {/* Header */}
      
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity style={styles.iconBtnDark} onPress={onClose}>
            <Ionicons name="chevron-down" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>EasyBuy AI</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconBtnDark} onPress={() => setShowVoicePicker(!showVoicePicker)}>
            <Ionicons name="settings-outline" size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtnCyan} onPress={onClose}>
            <Ionicons name="person-outline" size={18} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Voice Picker Overlay */}
      {showVoicePicker ? (
        <View style={styles.voicePickerContainer}>
          <Text style={styles.voicePickerTitle}>Select an OS Voice</Text>
          <ScrollView style={styles.voiceList}>
            {availableVoices.map((v, i) => (
              <TouchableOpacity 
                key={i} 
                style={[styles.voiceItem, activeVoiceId === v.identifier && styles.voiceItemActive]}
                onPress={() => testVoice(v.identifier)}
              >
                <Text style={styles.voiceItemText}>{v.name || v.identifier}</Text>
              </TouchableOpacity>
            ))}
            {availableVoices.length === 0 && <Text style={{color:'white'}}>No voices found on this OS</Text>}
          </ScrollView>
        </View>
      ) : (
        <>
          {/* Orb Container */}
          <View style={styles.visualizerContainer}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => { if(status==='LISTENING'){voiceRecognition.stop();} else if(status==='IDLE'){startListening();} }}
              style={[styles.orbWrapper, { width: 300, height: 300, alignItems: 'center', justifyContent: 'center' }]}
            >
              <CSSOrbWebView status={status} inputTextLength={inputText.length} volume={volume} />
            </TouchableOpacity>
          </View>

          {/* Subtitle / AI Speech Text */}
          <View style={styles.subtitleContainer}>
            {aiSpeechText.length > 0 && (
              <Animated.Text style={[styles.cinematicText, { opacity: textOpacity }]}>
                {aiSpeechText}
              </Animated.Text>
            )}
          </View>

          {/* Bottom Input Area */}
          {status !== 'THINKING' && (
            <View style={styles.bottomArea}>
              <View style={styles.pillInputContainer}>
                <TextInput
                  style={styles.pillInput}
                  placeholder={status === 'LISTENING' ? 'Listening...' : status === 'SPEAKING' ? 'Speaking...' : 'Ask anything...'}
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={inputText}
                  onChangeText={setInputText}
                  onSubmitEditing={handleSendText}
                  returnKeyType="send"
                  selectionColor="#8aebff"
                />
              </View>
            </View>
          )}
        </>
      )}

    </View>
  </KeyboardAvoidingView>
</BlurView>

    </Modal>
  );
}



const styles = StyleSheet.create({
  absoluteFill: { flex: 1, padding: 8 },
  container: { flex: 1 },
  modalWindow: {
    flex: 1,
    backgroundColor: '#0D1117', // Match the exact dark space-gray of the mockup
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#7129E6', // Bright neon purple border
    overflow: 'hidden',
    justifyContent: 'space-between',
    shadowColor: '#7129E6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 24,
    paddingHorizontal: 24,
    width: '100%'
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.2,
    fontFamily: Platform.OS === 'web' ? 'sans-serif' : 'System',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtnDark: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  iconBtnCyan: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#38D8D3', // Brighter cyan to match
    alignItems: 'center',
    justifyContent: 'center',
  },
  voicePickerContainer: { flex: 1, padding: 20, marginTop: 20 },
  voicePickerTitle: { color: 'white', fontWeight: '600', fontSize: 20, marginBottom: 15, textAlign: 'center' },
  voiceList: { flex: 1 },
  voiceItem: { padding: 15, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 10, marginBottom: 10 },
  voiceItemActive: { backgroundColor: '#7129E6' },
  voiceItemText: { color: 'white', fontWeight: '500', fontSize: 14 },
  visualizerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  orbWrapper: { width: 300, height: 300, alignItems: 'center', justifyContent: 'center' },
  subtitleContainer: { paddingHorizontal: 40, minHeight: 80, justifyContent: 'center', alignItems: 'center', paddingBottom: 20 },
  cinematicText: { fontSize: 17, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 26, fontWeight: '400', letterSpacing: 0.2, fontFamily: Platform.OS === 'web' ? 'sans-serif' : 'System' },
  bottomArea: { paddingHorizontal: 24, paddingBottom: 32, alignItems: 'center', width: '100%' },
  pillInputContainer: {
    width: '100%',
    backgroundColor: '#161B22', // Darker, sleeker pill background
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 14, // Slightly thinner
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)', // Subtle inner stroke
  },
  pillInput: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '400',
    fontFamily: Platform.OS === 'web' ? 'sans-serif' : 'System',
    flex: 1,
  },
});


