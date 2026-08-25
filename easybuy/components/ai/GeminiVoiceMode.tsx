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
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { chatWithEasyBuyAI, AIChatMessage } from '../../services/groqAI';
import { voiceRecognition } from '../../services/voiceRecognition';

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
      setAvailableVoices(voices);
      const premiumVoice = voices.find(v => v.identifier.includes('premium') || v.identifier.includes('Google') || v.identifier.includes('en-GB') || v.identifier.includes('en-IN-x'));
      if (premiumVoice) setActiveVoiceId(premiumVoice.identifier);
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
    
    try {
      const res = await chatWithEasyBuyAI(newHistory, stateName, true);
      setHistory([...newHistory, { role: 'assistant', content: res.replyText }]);
      setAiSpeechText(res.replyText);
      setStatus('SPEAKING');
      Animated.timing(textOpacity, { toValue: 1, duration: 800, useNativeDriver: true }).start();
      speakText(res.replyText);
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
          
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={stopAndClose}>
              <Ionicons name="chevron-down" size={32} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Voice Assistant</Text>
            
            {/* Secret Voice Picker Button */}
            <TouchableOpacity style={styles.voicePickerBtn} onPress={() => setShowVoicePicker(!showVoicePicker)}>
              <Ionicons name="options" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

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
              <View style={styles.visualizerContainer}>
                <TouchableOpacity activeOpacity={1} onPress={startListening} onLongPress={simulateSpeech} style={styles.orbWrapper}>
                  {status !== 'IDLE' && (
                    <>
                      <Animated.View style={[styles.ring, { borderColor: activeColor, transform: [{ scale: ring1Anim }], opacity: ring1Anim.interpolate({ inputRange: [1, 1.8], outputRange: [0.6, 0] }) }]} />
                      <Animated.View style={[styles.ring, { borderColor: activeColor, transform: [{ scale: ring2Anim }], opacity: ring2Anim.interpolate({ inputRange: [1, 1.8], outputRange: [0.6, 0] }) }]} />
                    </>
                  )}
                  <Animated.View style={[styles.orb, { backgroundColor: activeColor, shadowColor: activeColor, transform: [{ scale: pulseAnim }] }]}>
                    <Ionicons name={status === 'LISTENING' ? "mic" : status === 'SPEAKING' ? "volume-high" : "hardware-chip"} size={42} color={status === 'IDLE' ? "#000" : "#fff"} />
                  </Animated.View>
                </TouchableOpacity>
              </View>

              <View style={styles.subtitleContainer}>
                <Animated.Text style={[styles.cinematicText, { opacity: textOpacity }]}>{aiSpeechText}</Animated.Text>
              </View>

              <View style={styles.bottomArea}>
                <Text style={styles.hintText}>
                  {status === 'IDLE' ? 'Tap the orb to speak, or hold for demo' : status === 'LISTENING' ? 'Listening...' : status === 'THINKING' ? 'Processing...' : 'Speaking...'}
                </Text>
                
                <View style={styles.glassInput}>
                  <TextInput
                    style={styles.input}
                    placeholder="Or type here..."
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    value={inputText}
                    onChangeText={setInputText}
                    onSubmitEditing={handleSendText}
                    returnKeyType="send"
                    editable={status === 'IDLE'}
                    selectionColor="#d500f9"
                  />
                  <TouchableOpacity style={[styles.sendBtn, status !== 'IDLE' && { opacity: 0.3 }]} onPress={handleSendText} disabled={status !== 'IDLE'}>
                    <Ionicons name="arrow-up" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}

        </KeyboardAvoidingView>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  absoluteFill: { flex: 1 },
  container: { flex: 1, justifyContent: 'space-between' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingTop: 60, paddingHorizontal: 20, width: '100%' },
  closeButton: { position: 'absolute', left: 20, top: 60, zIndex: 10 },
  headerTitle: { color: 'rgba(255,255,255,0.6)', fontFamily: 'Outfit_600SemiBold', fontSize: 14, letterSpacing: 2, textTransform: 'uppercase' },
  voicePickerBtn: { position: 'absolute', right: 20, top: 60, zIndex: 10 },
  voicePickerContainer: { flex: 1, padding: 20, marginTop: 20 },
  voicePickerTitle: { color: 'white', fontFamily: 'Outfit_600SemiBold', fontSize: 20, marginBottom: 15, textAlign: 'center' },
  voiceList: { flex: 1 },
  voiceItem: { padding: 15, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, marginBottom: 10 },
  voiceItemActive: { backgroundColor: '#d500f9' },
  voiceItemText: { color: 'white', fontFamily: 'Outfit_500Medium', fontSize: 14 },
  visualizerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  orbWrapper: { width: 200, height: 200, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', width: 120, height: 120, borderRadius: 60, borderWidth: 2 },
  orb: { width: 110, height: 110, borderRadius: 55, alignItems: 'center', justifyContent: 'center', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 30, elevation: 20 },
  subtitleContainer: { paddingHorizontal: 30, minHeight: 120, justifyContent: 'center', alignItems: 'center' },
  cinematicText: { fontFamily: 'Outfit_600SemiBold', fontSize: 26, color: '#FFFFFF', textAlign: 'center', lineHeight: 36, textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 10 },
  bottomArea: { paddingHorizontal: 20, paddingBottom: 40, alignItems: 'center' },
  hintText: { fontFamily: 'Outfit_500Medium', fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 15 },
  glassInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 40, paddingHorizontal: 20, paddingVertical: 12, width: '100%', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  input: { flex: 1, color: '#fff', fontFamily: 'Outfit_500Medium', fontSize: 16 },
  sendBtn: { backgroundColor: 'rgba(255,255,255,0.2)', width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginLeft: 10 }
});
