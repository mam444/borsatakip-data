import React, { useMemo } from 'react';
import { View } from 'react-native';
import { SvgUri } from 'react-native-svg';
import { Text } from './Text';
import { useTheme } from '../theme/ThemeProvider';
import { getLogoUrl } from '../constants/logos';

const PALETTE = ['#7C6CFF', '#22D3C7', '#F5B94D', '#FF5C72', '#1FD990', '#6C8CFF', '#C88AFF', '#5FD1E0', '#FF8A5C', '#4FA8FF'];

// Matches the "squircle" proportions TradingView's own logos are drawn for —
// every logo (see src/constants/logos.ts) is a full-bleed square tile with its
// own background baked in, so the frame just needs to clip the corners, not
// pad or circle-crop the art.
const SQUIRCLE_RATIO = 0.28;

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

type Props = {
  symbol: string;
  size?: number;
};

function InitialsAvatar({ symbol, size }: Props) {
  const clean = symbol.replace('.IS', '').replace(/[^A-Za-z]/g, '');
  const initials = useMemo(() => clean.slice(0, 2).toUpperCase() || '?', [clean]);
  const color = useMemo(() => PALETTE[hashString(symbol) % PALETTE.length], [symbol]);

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size! * SQUIRCLE_RATIO,
        backgroundColor: color + '26',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text variant="label" weight="extrabold" style={{ color, fontSize: size! * 0.34 }}>
        {initials}
      </Text>
    </View>
  );
}

// Most TradingView logo SVGs ship with no `viewBox` — only a fixed
// width/height (56 for "--big" global logos, 18 for the compact BIST ones).
// react-native-svg's SvgUri overrides that width/height with whatever we pass
// in, but without a viewBox there's no coordinate system to rescale against:
// the art gets cropped (target smaller than native) or drawn at native scale
// in a corner (target larger than native) instead of scaling to fill. Forcing
// the real native viewBox here is what makes the logo actually fill the frame.
function nativeViewBox(logoUrl: string): string {
  const native = logoUrl.endsWith('--big.svg') ? 56 : 18;
  return `0 0 ${native} ${native}`;
}

// Tries a real company logo (TradingView's public logo CDN, curated in
// src/constants/logos.ts) and falls back to a deterministic colored-initials
// avatar — for symbols with no verified logo, or if the SVG fails to load.
// Rendered edge-to-edge (not shrunk/circle-cropped) since every curated logo
// is a full-bleed square tile designed to fill its frame on its own.
export function SymbolAvatar({ symbol, size = 36 }: Props) {
  const { colors } = useTheme();
  const logoUrl = getLogoUrl(symbol);
  const fallback = <InitialsAvatar symbol={symbol} size={size} />;

  if (!logoUrl) return fallback;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * SQUIRCLE_RATIO,
        backgroundColor: colors.bgCard,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <SvgUri uri={logoUrl} width={size} height={size} viewBox={nativeViewBox(logoUrl)} fallback={fallback} />
    </View>
  );
}
