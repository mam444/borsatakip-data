import React, { createContext, useContext, useMemo } from 'react';
import { tr } from './tr';
import { en } from './en';
import { useSettingsStore } from '../store/useSettingsStore';

const dictionaries = { tr, en };

const I18nContext = createContext(tr);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const language = useSettingsStore((s) => s.language);
  const value = useMemo(() => dictionaries[language], [language]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useT() {
  return useContext(I18nContext);
}
