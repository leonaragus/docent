import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, TranslationSet, translations } from '../locales';

interface LanguageContextProps {
  lang: Language;
  setLang: (lang: Language) => void;
  t: TranslationSet;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('docent-language');
    return (saved === 'en' || saved === 'es') ? saved as Language : 'en';
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('docent-language', newLang);
  };

  const t = translations[lang];

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
