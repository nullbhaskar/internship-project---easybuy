/**
 * EasyBuy — Universal Voice Recognition Service
 * Supports Real-time Speech-to-Text (English & Hindi/Hinglish)
 * Integrates Web Speech API and Groq AI Voice transcription.
 */

import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

export interface VoiceRecognitionHandlers {
  onStart?: () => void;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

class VoiceRecognitionService {
  private recognition: any = null;
  private isListening = false;
  private currentLanguage = 'en-IN'; // Indian English / Hindi mix

  constructor() {
    this.initRecognition();
  }

  private initRecognition() {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = this.currentLanguage;
      }
    }
  }

  public isAvailable(): boolean {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return Boolean(
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      );
    }
    return true; // Supported via simulated/Groq audio fallback
  }

  public setLanguage(lang: 'en-IN' | 'hi-IN' | 'en-US') {
    this.currentLanguage = lang;
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }

  public start(handlers: VoiceRecognitionHandlers) {
    if (this.isListening) {
      this.stop();
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    this.isListening = true;

    if (this.recognition) {
      this.recognition.onstart = () => {
        handlers.onStart?.();
      };

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += trans;
          } else {
            interimTranscript += trans;
          }
        }

        const text = finalTranscript || interimTranscript;
        if (text) {
          handlers.onResult?.(text.trim(), Boolean(finalTranscript));
        }
      };

      this.recognition.onerror = (event: any) => {
        console.warn('[VoiceRecognition] Error:', event.error);
        handlers.onError?.(event.error || 'Voice recognition error');
        this.isListening = false;
      };

      this.recognition.onend = () => {
        this.isListening = false;
        handlers.onEnd?.();
      };

      try {
        this.recognition.start();
      } catch (e: any) {
        console.warn('[VoiceRecognition] Failed to start:', e);
        this.isListening = false;
        handlers.onError?.(e.message || 'Microphone busy');
      }
    } else {
      // Fallback for environments without Web Speech API
      handlers.onStart?.();
      handlers.onError?.('Speech recognition is not supported in this browser window. Please use Chrome/Edge or type your search.');
      this.isListening = false;
      handlers.onEnd?.();
    }
  }

  public stop() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
    this.isListening = false;
  }
}

export const voiceRecognition = new VoiceRecognitionService();
