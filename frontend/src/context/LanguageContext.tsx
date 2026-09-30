import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language } from '../types/common';
import { translations, TranslationKey } from '../i18n/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, params?: (string | number)[] | Record<string, string | number>) => string;
}

const STORAGE_KEY = 'farm_action_loop_language';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'en' || saved === 'mr') {
        return saved;
      }
    } catch {
      // Ignore storage access errors
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Ignore storage errors
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: TranslationKey, params?: (string | number)[] | Record<string, string | number>): string => {
    const langDict = translations[language] as Record<string, string>;
    const enDict = translations.en as Record<string, string>;
    let str: string = (langDict && key in langDict) ? String(langDict[key]) : String(enDict[key] || key);
    if (params) {
      if (Array.isArray(params)) {
        params.forEach((val, idx) => {
          str = str.replace(new RegExp(`\\{${idx}\\}`, 'g'), String(val));
        });
      } else {
        Object.entries(params).forEach(([k, val]) => {
          str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(val));
        });
      }
    }
    return str;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
