import React, { useMemo } from 'react';
import { View, Pressable, useWindowDimensions } from 'react-native';
import { LineChart } from 'react-native-wagmi-charts';
import { useTheme } from '../theme/ThemeProvider';
import { Text } from './Text';
import { Skeleton } from './Skeleton';
import type { ChartRange } from '../constants/symbols';
import type { PortfolioHistoryPoint } from '../utils/portfolioHistory';

const CHART_HEIGHT = 160;

type Props = {
  points: PortfolioHistoryPoint[];
  range: ChartRange;
  ranges: ChartRange[];
  onRangeChange: (r: ChartRange) => void;
  isLoading?: boolean;
};

export function PortfolioChart({ points, range, ranges, onRangeChange, isLoading }: Props) {
  const { colors, radius, spacing } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const chartWidth = Math.min(windowWidth, 480) - spacing.md * 4;

  const lineData = useMemo(() => points.map((p) => ({ timestamp: p.timestamp, value: p.value })), [points]);
  const positive = points.length > 1 ? points[points.length - 1].value >= points[0].value : true;
  const lineColor = positive ? colors.positive : colors.negative;

  if (isLoading || points.length < 2) {
    return (
      <View style={{ gap: spacing.sm }}>
        <Skeleton height={CHART_HEIGHT} radius={16} />
        <RangeSelector range={range} ranges={ranges} onRangeChange={onRangeChange} />
      </View>
    );
  }

  return (
    <View style={{ gap: spacing.sm }}>
      <LineChart.Provider data={lineData}>
        <LineChart height={CHART_HEIGHT} width={chartWidth}>
          <LineChart.Path color={lineColor} width={2}>
            <LineChart.Gradient color={lineColor} />
          </LineChart.Path>
          <LineChart.CursorCrosshair color={lineColor} />
        </LineChart>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <LineChart.PriceText style={{ color: colors.textPrimary, fontFamily: 'Manrope_700Bold', fontSize: 15 }} />
          <LineChart.DatetimeText style={{ color: colors.textTertiary, fontFamily: 'Manrope_500Medium', fontSize: 12 }} />
        </View>
      </LineChart.Provider>
      <RangeSelector range={range} ranges={ranges} onRangeChange={onRangeChange} />
    </View>
  );
}

function RangeSelector({
  range,
  ranges,
  onRangeChange,
}: {
  range: ChartRange;
  ranges: ChartRange[];
  onRangeChange: (r: ChartRange) => void;
}) {
  const { colors, radius } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      {ranges.map((r) => (
        <Pressable
          key={r}
          onPress={() => onRangeChange(r)}
          style={{
            paddingVertical: 6,
            paddingHorizontal: 12,
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
