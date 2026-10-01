import { create } from 'zustand';
import { translations, Language, Translations } from './translations';
export * from './translations';

interface I18nState {
  language: Language;
  t: Translations;
  setLanguage: (lang: Language) => void;
}

const getInitialLanguage = (): Language => {
  return 'en';
};

const initialLang = getInitialLanguage();
if (typeof document !== 'undefined') {
  document.documentElement.lang = initialLang;
}

export const useI18n = create<I18nState>((set) => ({
  language: initialLang,
  t: translations[initialLang],
  setLanguage: (lang: Language) => {
    localStorage.setItem('rakshak_language', lang);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
    set({
      language: lang,
      t: translations[lang],
    });
  },
}));
