import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (val: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleDarkMode: () => {},
  setDarkMode: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkModeState] = useState<boolean>(false);

  useEffect(() => {
    AsyncStorage.getItem('easybuy_dark_mode').then((val) => {
      if (val !== null) {
        setIsDarkModeState(val === 'true');
      }
    }).catch(() => {});
  }, []);

  const setDarkMode = (val: boolean) => {
    setIsDarkModeState(val);
    AsyncStorage.setItem('easybuy_dark_mode', String(val)).catch(() => {});
  };

  const toggleDarkMode = () => {
    setIsDarkModeState((prev) => {
      const next = !prev;
      AsyncStorage.setItem('easybuy_dark_mode', String(next)).catch(() => {});
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useEasyBuyTheme = () => useContext(ThemeContext);
