/**
 * Custom hook for managing app theme (light/dark mode) state.
 *
 * Reads the saved preference from AsyncStorage on mount and
 * provides a toggle function. Designed to work alongside the
 * existing ThemeContext provider.
 *
 * Usage:
 *   const { isDark, toggleTheme } = useThemePreference();
 */

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = 'easybuy_theme_preference';

interface ThemePreference {
  isDark: boolean;
  toggleTheme: () => void;
}

export function useThemePreference(): ThemePreference {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then(saved => {
      if (saved === 'dark') setIsDark(true);
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark(prev => {
      const next = !prev;
      AsyncStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
      return next;
    });
  }, []);

  return { isDark, toggleTheme };
}
