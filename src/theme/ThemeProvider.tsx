import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { Appearance } from 'react-native';
import { darkColors, lightColors, ThemeColors, ACCENT_PRESETS } from './colors';
import { spacing, radius } from './spacing';
import { fontFamily, fontSize, lineHeight } from './typography';
import { useSettingsStore } from '../store/useSettingsStore';

type ThemeContextValue = {
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  font: typeof fontFamily;
  fontSize: typeof fontSize;
  lineHeight: typeof lineHeight;
  isDark: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themePref = useSettingsStore((s) => s.themePreference);
  const accentPreset = useSettingsStore((s) => s.accentPreset);
  const [systemScheme, setSystemScheme] = useState(Appearance.getColorScheme());

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => setSystemScheme(colorScheme));
    return () => sub.remove();
  }, []);

  const isDark = themePref === 'system' ? systemScheme !== 'light' : themePref === 'dark';

  const value = useMemo<ThemeContextValue>(() => {
    const base = isDark ? darkColors : lightColors;
    const accent = ACCENT_PRESETS[accentPreset] ?? ACCENT_PRESETS.violet;
    return {
      colors: {
        ...base,
        accentFrom: accent.from,
        accentTo: accent.to,
        accent: accent.from,
        accentSoft: accent.from + (isDark ? '24' : '18'),
      },
      spacing,
      radius,
      font: fontFamily,
      fontSize,
      lineHeight,
      isDark,
    };
  }, [isDark, accentPreset]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
