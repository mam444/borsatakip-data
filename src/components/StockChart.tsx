import React, { useMemo } from 'react';
import { View, Pressable, useWindowDimensions } from 'react-native';
import { LineChart, CandlestickChart } from 'react-native-wagmi-charts';
import { useTheme } from '../theme/ThemeProvider';
import { useT } from '../i18n/I18nContext';
import { Text } from './Text';
import { Skeleton } from './Skeleton';
import { CHART_RANGES, ChartRange } from '../constants/symbols';
import type { ChartPoint } from '../services/yahooFinance';

const CHART_HEIGHT = 220;

type Props = {
  points: ChartPoint[];
  range: ChartRange;
  onRangeChange: (r: ChartRange) => void;
  mode: 'line' | 'candle';
  onModeChange: (m: 'line' | 'candle') => void;
  isLoading?: boolean;
  positive?: boolean;
};

export function StockChart({ points, range, onRangeChange, mode, onModeChange, isLoading, positive }: Props) {
  const { colors, radius, spacing } = useTheme();
  const t = useT();
  const { width: windowWidth } = useWindowDimensions();
  const chartWidth = Math.min(windowWidth, 480) - spacing.md * 2;

  const lineData = useMemo(() => points.map((p) => ({ timestamp: p.timestamp, value: p.close })), [points]);
  const candleData = useMemo(
    () => points.map((p) => ({ timestamp: p.timestamp, open: p.open, high: p.high, low: p.low, close: p.close })),
    [points]
  );

  const lineColor = positive === false ? colors.negative : colors.positive;

  if (isLoading || points.length === 0) {
    return (
      <View style={{ gap: spacing.sm }}>
        <Skeleton height={CHART_HEIGHT} radius={16} />
        <RangeSelector range={range} onRangeChange={onRangeChange} />
      </View>
    );
  }

  return (
    <View style={{ gap: spacing.sm }}>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 6 }}>
        {(['line', 'candle'] as const).map((m) => (
          <Pressable
            key={m}
            onPress={() => onModeChange(m)}
            style={{
              paddingHorizontal: spacing.sm,
              paddingVertical: 4,
              borderRadius: radius.sm,
              backgroundColor: mode === m ? colors.bgCardAlt : 'transparent',
            }}
          >
            <Text variant="label" weight={mode === m ? 'bold' : 'medium'} color={mode === m ? 'primary' : 'tertiary'}>
              {m === 'line' ? t.common.lineChart : t.common.candleChart}
            </Text>
          </Pressable>
        ))}
      </View>

      {mode === 'line' ? (
        <LineChart.Provider data={lineData}>
          <LineChart height={CHART_HEIGHT} width={chartWidth}>
            <LineChart.Path color={lineColor} width={2}>
              <LineChart.Gradient color={lineColor} />
            </LineChart.Path>
            <LineChart.CursorCrosshair color={lineColor} />
          </LineChart>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <LineChart.PriceText style={{ color: colors.textPrimary, fontFamily: 'Manrope_700Bold', fontSize: 18 }} />
            <LineChart.DatetimeText style={{ color: colors.textTertiary, fontFamily: 'Manrope_500Medium', fontSize: 12 }} />
          </View>
        </LineChart.Provider>
      ) : (
        <CandlestickChart.Provider data={candleData}>
          <CandlestickChart height={CHART_HEIGHT} width={chartWidth}>
            <CandlestickChart.Candles positiveColor={colors.positive} negativeColor={colors.negative} />
            <CandlestickChart.Crosshair color={colors.accent} />
          </CandlestickChart>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <CandlestickChart.PriceText
              type="close"
              style={{ color: colors.textPrimary, fontFamily: 'Manrope_700Bold', fontSize: 18 }}
            />
            <CandlestickChart.DatetimeText style={{ color: colors.textTertiary, fontFamily: 'Manrope_500Medium', fontSize: 12 }} />
          </View>
        </CandlestickChart.Provider>
      )}

      <RangeSelector range={range} onRangeChange={onRangeChange} />
    </View>
  );
}

function RangeSelector({ range, onRangeChange }: { range: ChartRange; onRangeChange: (r: ChartRange) => void }) {
  const { colors, radius } = useTheme();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      {CHART_RANGES.map((r) => (
        <Pressable
          key={r}
          onPress={() => onRangeChange(r)}
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
  );
}
