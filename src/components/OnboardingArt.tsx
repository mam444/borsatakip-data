import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '../theme/ThemeProvider';
import { Text } from './Text';

const W = 320;
const H = 200;

function Chip({ label, tone, style }: { label: string; tone: 'positive' | 'negative' | 'accent'; style: any }) {
  const { colors, radius } = useTheme();
  const fg = tone === 'positive' ? colors.positive : tone === 'negative' ? colors.negative : colors.accent;
  return (
    <View
      style={[
        {
          position: 'absolute',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          backgroundColor: colors.bgCard,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radius.sm,
          paddingHorizontal: 8,
          paddingVertical: 5,
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 3 },
          elevation: 3,
        },
        style,
      ]}
    >
      <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: fg }} />
      <Text variant="label" weight="bold" style={{ fontSize: 11 }}>
        {label}
      </Text>
    </View>
  );
}

// Step 1: rising price chart — glowing area line + floating ticker chips.
export function WelcomeArt() {
  const { colors, radius } = useTheme();
  const areaPath = `M0,178 L18,166 L54,172 L92,140 L130,150 L168,108 L206,118 L244,78 L282,86 L${W},48 L${W},${H} L0,${H} Z`;
  const linePath = `M0,178 L18,166 L54,172 L92,140 L130,150 L168,108 L206,118 L244,78 L282,86 L${W},48`;

  return (
    <View style={{ height: H, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.bgCard }}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="wArea" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.accentTo} stopOpacity={0.35} />
            <Stop offset="1" stopColor={colors.accentTo} stopOpacity={0} />
          </LinearGradient>
          <LinearGradient id="wLine" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={colors.accentFrom} />
            <Stop offset="1" stopColor={colors.accentTo} />
          </LinearGradient>
        </Defs>
        <Circle cx={W - 40} cy={30} r={90} fill={colors.accentFrom} opacity={0.12} />
        <Circle cx={30} cy={H - 10} r={70} fill={colors.accentTo} opacity={0.1} />
        <Path d={areaPath} fill="url(#wArea)" />
        <Path d={linePath} stroke="url(#wLine)" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <Circle cx={W} cy={48} r={6} fill={colors.accentTo} />
        <Circle cx={W} cy={48} r={11} fill={colors.accentTo} opacity={0.25} />
      </Svg>
      <Chip label="THYAO  ▲2.4%" tone="positive" style={{ top: 22, left: 16 }} />
      <Chip label="AAPL  ▼0.1%" tone="negative" style={{ top: 64, right: 18 }} />
      <Chip label="BIST100  ▲1.6%" tone="accent" style={{ bottom: 18, left: 28 }} />
    </View>
  );
}

// Step 2: portfolio allocation donut + a mini watchlist card.
export function PortfolioArt() {
  const { colors, radius } = useTheme();
  const r = 52;
  const strokeW = 20;
  const cx = 96;
  const cy = 100;
  const circumference = 2 * Math.PI * r;
  const segments: { pct: number; color: string }[] = [
    { pct: 0.4, color: colors.accent },
    { pct: 0.26, color: colors.accentTo },
    { pct: 0.2, color: colors.positive },
    { pct: 0.14, color: '#F5B94D' },
  ];
  let offset = 0;
  const arcs = segments.map((seg, i) => {
    const len = circumference * seg.pct;
    const dash = `${len} ${circumference - len}`;
    const dashOffset = -offset;
    offset += len;
    return (
      <Circle
        key={i}
        cx={cx}
        cy={cy}
        r={r}
        stroke={seg.color}
        strokeWidth={strokeW}
        fill="none"
        strokeDasharray={dash}
        strokeDashoffset={dashOffset}
        strokeLinecap="butt"
        transform={`rotate(-90 ${cx} ${cy})`}
      />
    );
  });

  const rowWidths = [72, 54, 62];
  const rowColors = [colors.accent, colors.positive, colors.accentTo];

  return (
    <View style={{ height: H, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.bgCard }}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <Circle cx={20} cy={20} r={70} fill={colors.accentTo} opacity={0.08} />
        {arcs}
        <Circle cx={cx} cy={cy} r={r - strokeW / 2 - 6} fill={colors.bgCardAlt} />
      </Svg>
      <View style={{ position: 'absolute', left: cx - 30, top: cy - 16, width: 60, alignItems: 'center' }}>
        <Text variant="label" weight="extrabold" color="accent" style={{ fontSize: 15 }}>
          %100
        </Text>
        <Text variant="label" color="tertiary" style={{ fontSize: 9 }}>
          Portföy
        </Text>
      </View>
      <View
        style={{
          position: 'absolute',
          right: 18,
          top: 26,
          width: 118,
          backgroundColor: colors.bgCardAlt,
          borderRadius: radius.md,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 10,
          gap: 8,
        }}
      >
        {rowWidths.map((w, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 16, height: 16, borderRadius: 5, backgroundColor: rowColors[i] + '33' }} />
            <View style={{ width: w, height: 6, borderRadius: 3, backgroundColor: colors.border }} />
          </View>
        ))}
      </View>
    </View>
  );
}

// Step 3: "all set" badge with a bell + celebratory sparks.
export function AlertsArt() {
  const { colors, radius } = useTheme();
  const cx = W / 2;
  const cy = 96;
  const bellPath =
    'M0,-30 C10,-30 17,-22 17,-11 L17,4 C17,9 19,13 23,16 L-23,16 C-19,13 -17,9 -17,4 L-17,-11 C-17,-22 -10,-30 0,-30 Z';

  return (
    <View style={{ height: H, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.bgCard }}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="aRing" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colors.accentFrom} />
            <Stop offset="1" stopColor={colors.accentTo} />
          </LinearGradient>
        </Defs>
        <Circle cx={cx} cy={cy} r={78} fill={colors.accentFrom} opacity={0.08} />
        <Circle cx={cx} cy={cy} r={58} fill="none" stroke={colors.accentTo} strokeWidth={1.5} opacity={0.3} />
        <Circle cx={cx} cy={cy} r={44} fill="url(#aRing)" opacity={0.16} />
        <Circle cx={cx} cy={cy} r={38} fill={colors.bgCardAlt} stroke="url(#aRing)" strokeWidth={2.5} />
        <Path d={bellPath} transform={`translate(${cx} ${cy})`} fill="url(#aRing)" />
        <Circle cx={cx + 14} cy={cy - 20} r={7} fill={colors.negative} />
        <Circle cx={cx - 90} cy={cy - 60} r={5} fill={colors.positive} opacity={0.7} />
        <Circle cx={cx + 96} cy={cy - 44} r={4} fill={colors.accentTo} opacity={0.8} />
        <Circle cx={cx + 84} cy={cy + 56} r={6} fill={'#F5B94D'} opacity={0.8} />
        <Circle cx={cx - 100} cy={cy + 40} r={4} fill={colors.accent} opacity={0.7} />
      </Svg>
    </View>
  );
}
