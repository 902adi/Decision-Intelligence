import { create } from 'zustand';
import { translations, Language, Translations } from './translations';
export * from './translations';

interface I18nState {
  language: Language;
  t: Translations;
  setLanguage: (lang: Language) => void;
}

const getInitialLanguage = (): Language => {
  if (typeof window === 'undefined') return 'en';
  const saved = localStorage.getItem('rakshak_language') as Language;
  if (saved && (saved === 'en' || saved === 'hi' || saved === 'mr')) {
    return saved;
  }
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('hi')) return 'hi';
  if (browserLang.startsWith('mr')) return 'mr';
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
