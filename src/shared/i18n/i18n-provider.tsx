import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { PropsWithChildren } from 'react';
import { en } from '@/shared/i18n/en';
import { ru } from '@/shared/i18n/ru';

const LANGUAGE_STORAGE_KEY = 'ton-wallet:language:v1';

const dictionaries = {
  en,
  ru,
};

export type Language = keyof typeof dictionaries;
export type TranslationKey = keyof typeof en;

interface TranslateValues {
  [key: string]: number | string;
}

interface I18nContextValue {
  language: Language;
  setLanguage(nextLanguage: Language): void;
  t(key: TranslationKey, values?: TranslateValues): string;
}

const defaultLanguage: Language = 'en';

const I18nContext = createContext<I18nContextValue>({
  language: defaultLanguage,
  setLanguage: () => undefined,
  t: (key, values) => interpolate(en[key], values),
});

export function I18nProvider({
  children,
}: PropsWithChildren) {
  const [language, setLanguage] = useState<Language>(
    readInitialLanguage,
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(
      LANGUAGE_STORAGE_KEY,
      language,
    );
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      setLanguage,
      t: (key, values) =>
        interpolate(
          dictionaries[language][key] ?? en[key],
          values,
        ),
    }),
    [language],
  );

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

function readInitialLanguage(): Language {
  if (typeof window === 'undefined') {
    return defaultLanguage;
  }

  const storedLanguage = window.localStorage.getItem(
    LANGUAGE_STORAGE_KEY,
  );

  if (storedLanguage === 'en' || storedLanguage === 'ru') {
    return storedLanguage;
  }

  return window.navigator.language
    .toLowerCase()
    .startsWith('ru')
    ? 'ru'
    : defaultLanguage;
}

function interpolate(
  template: string,
  values?: TranslateValues,
) {
  if (!values) {
    return template;
  }

  return template.replace(
    /\{(\w+)\}/g,
    (_, key: string) =>
      String(values[key] ?? `{${key}}`),
  );
}
