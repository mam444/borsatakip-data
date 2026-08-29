import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemePreference = 'system' | 'dark' | 'light';
export type Language = 'tr' | 'en';
export type DisplayCurrency = 'TRY' | 'USD';
export type AccentPreset = 'violet' | 'blue' | 'gold' | 'rose' | 'emerald';

type SettingsState = {
  themePreference: ThemePreference;
  language: Language;
  displayCurrency: DisplayCurrency;
  refreshIntervalMs: number;
  hasOnboarded: boolean;
  notificationsEnabled: boolean;
  hasHydrated: boolean;
  accentPreset: AccentPreset;
  setThemePreference: (v: ThemePreference) => void;
  setLanguage: (v: Language) => void;
  setDisplayCurrency: (v: DisplayCurrency) => void;
  setRefreshIntervalMs: (v: number) => void;
  setNotificationsEnabled: (v: boolean) => void;
  setAccentPreset: (v: AccentPreset) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  setHasHydrated: (v: boolean) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      themePreference: 'light',
      language: 'tr',
      displayCurrency: 'TRY',
      refreshIntervalMs: 15000,
      hasOnboarded: false,
      notificationsEnabled: true,
      hasHydrated: false,
      accentPreset: 'emerald',
      setThemePreference: (v) => set({ themePreference: v }),
      setLanguage: (v) => set({ language: v }),
      setDisplayCurrency: (v) => set({ displayCurrency: v }),
      setRefreshIntervalMs: (v) => set({ refreshIntervalMs: v }),
      setNotificationsEnabled: (v) => set({ notificationsEnabled: v }),
      setAccentPreset: (v) => set({ accentPreset: v }),
      completeOnboarding: () => set({ hasOnboarded: true }),
      resetOnboarding: () => set({ hasOnboarded: false }),
      setHasHydrated: (v) => set({ hasHydrated: v }),
    }),
    {
      name: 'borsatakip-settings',
      version: 2,
      migrate: (persisted) => ({
        ...(persisted as SettingsState),
        themePreference: 'light' as ThemePreference,
        accentPreset: 'emerald' as AccentPreset,
      }),
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ hasHydrated, setHasHydrated, ...rest }) => rest,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
