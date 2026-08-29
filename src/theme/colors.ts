// Calm, data-first surfaces inspired by professional trading terminals. The
// contrast is deliberately softer than pure black/white so dense market data
// remains comfortable to scan for long sessions.

export type ThemeColors = typeof darkColors;

export const darkColors = {
  mode: 'dark' as const,

  bg: '#07120F',
  bgElevated: '#0B1A15',
  bgCard: '#10241E',
  bgCardAlt: '#17342A',
  border: '#24483B',
  borderSubtle: '#183329',

  textPrimary: '#F3FAF6',
  textSecondary: '#A9BFB6',
  textTertiary: '#6F8E82',
  textInverse: '#071712',

  accentFrom: '#149A67',
  accentTo: '#67F1B2',
  accent: '#67F1B2',
  accentSoft: 'rgba(103,241,178,0.14)',

  positive: '#67F1B2',
  positiveSoft: 'rgba(103,241,178,0.14)',
  negative: '#FF7B87',
  negativeSoft: 'rgba(255,123,135,0.14)',
  neutral: '#A9BFB6',

  gold: '#F5B94D',
  chartGrid: '#24483B80',
  overlay: 'rgba(6,8,13,0.72)',
  shimmer: '#18382E',
};

// VIP-only accent customization (see Settings). Each preset is a [from, to]
// gradient pair; "soft" is derived at apply-time so it stays consistent with
// the dark/light base palette.
export const ACCENT_PRESETS: Record<string, { from: string; to: string }> = {
  violet: { from: '#149A67', to: '#67F1B2' },
  blue: { from: '#3B82F6', to: '#06B6D4' },
  gold: { from: '#F5B94D', to: '#F97316' },
  rose: { from: '#FB7185', to: '#EC4899' },
  emerald: { from: '#0F8A5B', to: '#67F1B2' },
};

export const lightColors: ThemeColors = {
  mode: 'light' as any,

  bg: '#F3F6F4',
  bgElevated: '#FFFFFF',
  bgCard: '#FFFFFF',
  bgCardAlt: '#F7FAF8',
  border: '#E2EAE6',
  borderSubtle: '#EBF0ED',

  textPrimary: '#0E1916',
  textSecondary: '#52635D',
  textTertiary: '#81908A',
  textInverse: '#FFFFFF',

  accentFrom: '#0F8A5B',
  accentTo: '#67F1B2',
  accent: '#159B68',
  accentSoft: 'rgba(21,155,104,0.10)',

  positive: '#159B68',
  positiveSoft: 'rgba(21,155,104,0.11)',
  negative: '#E85D6A',
  negativeSoft: 'rgba(232,93,106,0.10)',
  neutral: '#72807B',

  gold: '#C88A1F',
  chartGrid: '#DFE9E480',
  overlay: 'rgba(6,20,15,0.45)',
  shimmer: '#E9EFEC',
};
