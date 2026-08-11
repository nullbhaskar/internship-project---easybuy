import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations, LanguageCode, TranslationKeys } from '../constants/translations';

const LANGUAGE_KEY = '@easybuy_language';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: keyof TranslationKeys) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key) => translations.en[key] || key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>('en');

  useEffect(() => {
    // Load stored language preference from AsyncStorage
    AsyncStorage.getItem(LANGUAGE_KEY)
      .then((storedLang) => {
        if (storedLang === 'en' || storedLang === 'hi' || storedLang === 'bn') {
          setLanguageState(storedLang as LanguageCode);
        }
      })
      .catch(() => {});
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    AsyncStorage.setItem(LANGUAGE_KEY, lang).catch(() => {});
  };

  const t = (key: keyof TranslationKeys): string => {
    const currentDict = translations[language] || translations.en;
    return currentDict[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
