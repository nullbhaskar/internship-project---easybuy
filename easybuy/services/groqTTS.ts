/**
 * EasyBuy — Groq Neural TTS Service
 *
 * Uses Groq PlayAI model to generate human-quality speech.
 * Plays audio via expo-av (works in Expo Go + APK).
 * Falls back to expo-speech if network is slow or TTS quota hit.
 */

import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';

function getBaseApiUrl(): string {
  if (Platform.OS === 'web') return '';
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:8081`;
  }
  return process.env.EXPO_PUBLIC_API_URL || '';
}

// Currently loaded sound — we keep a reference to unload it before playing new audio
let currentSound: Audio.Sound | null = null;

export interface GroqTTSOptions {
  voice?: string;
  onStart?: () => void;
  onDone?: () => void;
  onError?: (err: string) => void;
}

/**
 * Speak text using Groq's PlayAI neural TTS.
 * Falls back to expo-speech (device TTS) if Groq TTS is unavailable.
 */
export async function groqSpeak(text: string, options: GroqTTSOptions = {}): Promise<void> {
  const { voice, onStart, onDone, onError } = options;

  // Stop any currently playing audio
  await groqSpeechStop();

  try {
    onStart?.();

    const baseUrl = getBaseApiUrl();
    const res = await fetch(`${baseUrl}/api/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice }),
    });

    if (!res.ok) {
      throw new Error(`TTS API error: ${res.status}`);
    }

    const { audioBase64, mimeType } = await res.json();

    if (!audioBase64) {
      throw new Error('No audio data in response');
    }

    // Write base64 audio to a temp file so expo-av can play it
    // @ts-ignore - FileSystem API varies between expo versions
    const cacheDir = (FileSystem as any).cacheDirectory || '';
    const tempUri = `${cacheDir}easybuy_tts_${Date.now()}.mp3`;
    await FileSystem.writeAsStringAsync(tempUri, audioBase64, {
      // @ts-ignore
      encoding: (FileSystem as any).EncodingType?.Base64 ?? 'base64',
    });

    // Configure audio session for playback
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    // Load and play
    const { sound } = await Audio.Sound.createAsync(
      { uri: tempUri },
      { shouldPlay: true, volume: 1.0 }
    );
    currentSound = sound;

    // Wait for playback to finish
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync().catch(() => {});
        currentSound = null;
        // Clean up temp file
        FileSystem.deleteAsync(tempUri, { idempotent: true }).catch(() => {});
        onDone?.();
      }
    });

  } catch (e: any) {
    console.warn('[GroqTTS] Neural TTS failed, falling back to expo-speech:', e?.message);

    // Graceful fallback to device TTS — still works, just less human
    try {
      Speech.speak(text, {
        language: 'en-IN',
        pitch: 1.05,
        rate: 0.9,
        onDone: () => onDone?.(),
        onError: () => {
          onError?.(e?.message || 'TTS failed');
          onDone?.();
        },
      });
    } catch (fallbackErr) {
      onError?.('Speech playback failed');
      onDone?.();
    }
  }
}

/**
 * Stop any currently playing Groq TTS audio.
 */
export async function groqSpeechStop(): Promise<void> {
  // Stop expo-speech fallback
  Speech.stop();

  // Stop expo-av sound
  if (currentSound) {
    try {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
    } catch (e) {}
    currentSound = null;
  }
}
