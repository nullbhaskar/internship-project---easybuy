import Constants from 'expo-constants';

// GROQ API Key - read from app.config.js extra or fall back to build-time constant
export const GROQ_API_KEY: string =
  (Constants.expoConfig?.extra?.GROQ_API_KEY as string) ||
  process.env.EXPO_PUBLIC_GROQ_API_KEY ||
  '';

export const IS_DEV: boolean = __DEV__ ?? false;
