import React, { useMemo, useState } from 'react';
import { View, ScrollView, TextInput, Pressable, useWindowDimensions } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';
import { useTheme } from '../src/theme/ThemeProvider';
import { useT } from '../src/i18n/I18nContext';
import { Text } from '../src/components/Text';
import { Card } from '../src/components/Card';
import { Skeleton } from '../src/components/Skeleton';
import { useChart } from '../src/hooks/useChart';
import { CHART_RANGES, ChartRange } from '../src/constants/symbols';
import { ModalHeader } from '../src/components/ModalHeader';
import { VisualHeaderBanner } from '../src/components/VisualHeaderBanner';

const CHART_HEIGHT = 220;

function toPctSeries(points: { close: number }[]): number[] {
  if (points.length === 0) return [];
  const base = points[0].close;
  if (!base) return [];
  return points.map((p) => (p.close / base - 1) * 100);
}

export default function CompareScreen() {
  const { colors, spacing, radius } = useTheme();
  const t = useT();
  const { width: windowWidth } = useWindowDimensions();

  const [symbolA, setSymbolA] = useState('THYAO.IS');
  const [symbolB, setSymbolB] = useState('AAPL');
  const [range, setRange] = useState<ChartRange>('1M');

  const a = symbolA.trim().toUpperCase();
  const b = symbolB.trim().toUpperCase();

  const { data: chartA, isLoading: loadingA } = useChart(a || undefined, range);
  const { data: chartB, isLoading: loadingB } = useChart(b || undefined, range);

  const seriesA = useMemo(() => toPctSeries(chartA?.points ?? []), [chartA]);
  const seriesB = useMemo(() => toPctSeries(chartB?.points ?? []), [chartB]);

  const chartWidth = Math.min(windowWidth, 480) - spacing.md * 4;

  const { pointsA, pointsB, minV, maxV } = useMemo(() => {
    const all = [...seriesA, ...seriesB];
    if (all.length === 0) return { pointsA: '', pointsB: '', minV: 0, maxV: 0 };
    const minV = Math.min(...all, 0);
    const maxV = Math.max(...all, 0);
    const span = maxV - minV || 1;
    const toStr = (series: number[]) =>
      series
        .map((v, i) => {
          const x = series.length > 1 ? (i / (series.length - 1)) * chartWidth : 0;
          const y = CHART_HEIGHT - ((v - minV) / span) * CHART_HEIGHT;
          return `${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(' ');
    return { pointsA: toStr(seriesA), pointsB: toStr(seriesB), minV, maxV };
  }, [seriesA, seriesB, chartWidth]);

  const lastA = seriesA[seriesA.length - 1];
  const lastB = seriesB[seriesB.length - 1];
  const isLoading = loadingA || loadingB;
  const hasData = seriesA.length > 1 && seriesB.length > 1;

  const colorA = colors.accent;
  const colorB = colors.gold;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ModalHeader title={t.compare.title} eyebrow="Göreceli Performans" subtitle="İki varlığın seçili dönemdeki yüzdesel getirisini karşılaştır." />
      <VisualHeaderBanner source={require('../assets/market-world-v1.png')} eyebrow="Piyasa Analizi" title="Hangi varlık daha güçlü?" icon="git-compare-outline" />

      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <View style={{ flex: 1 }}>
            <Text variant="label" weight="semibold" color="tertiary" style={{ marginBottom: 6 }}>
              {t.compare.symbolA}
            </Text>
            <TextInput
              value={symbolA}
              onChangeText={setSymbolA}
              placeholder={t.compare.placeholder}
              placeholderTextColor={colors.textTertiary}
              autoCapitalize="characters"
              autoCorrect={false}
              style={{
                backgroundColor: colors.bgCard,
                borderWidth: 1,
                borderColor: colorA,
                borderRadius: radius.md,
                paddingHorizontal: spacing.sm,
                paddingVertical: 12,
                color: colors.textPrimary,
              }}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="label" weight="semibold" color="tertiary" style={{ marginBottom: 6 }}>
              {t.compare.symbolB}
            </Text>
            <TextInput
              value={symbolB}
              onChangeText={setSymbolB}
              placeholder={t.compare.placeholder}
              placeholderTextColor={colors.textTertiary}
              autoCapitalize="characters"
              autoCorrect={false}
              style={{
                backgroundColor: colors.bgCard,
                borderWidth: 1,
                borderColor: colorB,
                borderRadius: radius.md,
                paddingHorizontal: spacing.sm,
                paddingVertical: 12,
                color: colors.textPrimary,
              }}
            />
          </View>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md }}>
          {CHART_RANGES.map((r) => (
            <Pressable
              key={r}
              onPress={() => setRange(r)}
              style={{
                paddingVertical: 6,
                paddingHorizontal: 10,
                borderRadius: radius.sm,
                backgroundColor: range === r ? colors.accentSoft : 'transparent',
              }}
            >
              <Text variant="label" weight={range === r ? 'bold' : 'medium'} style={{ color: range === r ? colors.accent : colors.textTertiary }}>
                {r}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colorA }} />
            <Text variant="caption" weight="bold">
              {a || '—'}
            </Text>
            {lastA !== undefined && (
              <Text variant="caption" weight="bold" style={{ color: lastA >= 0 ? colors.positive : colors.negative }}>
                {lastA >= 0 ? '+' : ''}
                {lastA.toFixed(2)}%
              </Text>
            )}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colorB }} />
            <Text variant="caption" weight="bold">
              {b || '—'}
            </Text>
            {lastB !== undefined && (
              <Text variant="caption" weight="bold" style={{ color: lastB >= 0 ? colors.positive : colors.negative }}>
                {lastB >= 0 ? '+' : ''}
                {lastB.toFixed(2)}%
              </Text>
            )}
          </View>
        </View>

        <Card style={{ marginTop: spacing.sm, padding: spacing.sm }}>
          {isLoading ? (
            <Skeleton height={CHART_HEIGHT} radius={12} />
          ) : !hasData ? (
            <View style={{ height: CHART_HEIGHT, alignItems: 'center', justifyContent: 'center' }}>
              <Text variant="caption" color="tertiary">
                {t.compare.noData}
              </Text>
            </View>
          ) : (
            <Svg width={chartWidth} height={CHART_HEIGHT}>
              <Polyline points={pointsB} fill="none" stroke={colorB} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
              <Polyline points={pointsA} fill="none" stroke={colorA} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
            </Svg>
          )}
        </Card>

        <Text variant="label" color="tertiary" style={{ textAlign: 'center', marginTop: spacing.sm }}>
          {t.compare.changeSince}
        </Text>
      </ScrollView>
    </View>
  );
}
