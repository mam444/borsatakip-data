import React, { useMemo } from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useT } from '../i18n/I18nContext';
import { Text } from './Text';
import { Card } from './Card';
import { Skeleton } from './Skeleton';
import { useChart } from '../hooks/useChart';
import { formatPrice } from '../utils/format';

function Row({ label, value, color }: { label: string; value: string; color: string }) {
  const { spacing } = useTheme();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, paddingHorizontal: spacing.xs }}>
      <Text variant="caption" color="secondary">
        {label}
      </Text>
      <Text variant="caption" weight="bold" style={{ color }}>
        {value}
      </Text>
    </View>
  );
}

export function PivotPoints({ symbol }: { symbol: string }) {
  const { colors } = useTheme();
  const t = useT();
  const { data: chart, isLoading } = useChart(symbol, '1M');

  const levels = useMemo(() => {
    const points = chart?.points ?? [];
    if (points.length < 1) return null;
    const prev = points.length >= 2 ? points[points.length - 2] : points[points.length - 1];
    if (prev.high === undefined || prev.low === undefined || prev.close === undefined) return null;

    const { high: H, low: L, close: C } = prev;
    const P = (H + L + C) / 3;
    const R1 = 2 * P - L;
    const S1 = 2 * P - H;
    const R2 = P + (H - L);
    const S2 = P - (H - L);
    return { P, R1, R2, S1, S2 };
  }, [chart]);

  if (isLoading) return <Skeleton height={160} radius={18} />;
  if (!levels) return null;

  return (
    <Card padded={false}>
      <View style={{ paddingTop: 4, paddingBottom: 4 }}>
        <Row label={t.pivot.resistance + ' 2'} value={formatPrice(levels.R2)} color={colors.negative} />
        <Row label={t.pivot.resistance + ' 1'} value={formatPrice(levels.R1)} color={colors.negative} />
        <Row label={t.pivot.pivotPoint} value={formatPrice(levels.P)} color={colors.textPrimary} />
        <Row label={t.pivot.support + ' 1'} value={formatPrice(levels.S1)} color={colors.positive} />
        <Row label={t.pivot.support + ' 2'} value={formatPrice(levels.S2)} color={colors.positive} />
      </View>
    </Card>
  );
}
