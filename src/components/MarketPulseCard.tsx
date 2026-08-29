import React, { useMemo } from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { Text } from './Text';
import type { Quote } from '../services/marketData';
import { formatPercent } from '../utils/format';

type Props = {
  quotes?: Quote[];
  title: string;
  subtitle?: string;
  averageLabel?: string;
  advancingLabel?: string;
  decliningLabel?: string;
};

export function MarketPulseCard({
  quotes,
  title,
  subtitle,
  averageLabel = 'ortalama hareket',
  advancingLabel = 'yükselen',
  decliningLabel = 'düşen',
}: Props) {
  const { colors, radius, spacing } = useTheme();
  const pulse = useMemo(() => {
    const valid = (quotes ?? []).filter((q) => Number.isFinite(q.regularMarketChangePercent));
    const advancing = valid.filter((q) => (q.regularMarketChangePercent ?? 0) > 0).length;
    const declining = valid.filter((q) => (q.regularMarketChangePercent ?? 0) < 0).length;
    const average = valid.length
      ? valid.reduce((sum, q) => sum + (q.regularMarketChangePercent ?? 0), 0) / valid.length
      : 0;
    return { advancing, declining, total: valid.length, average };
  }, [quotes]);

  const positive = pulse.average >= 0;
  const advanceWidth = pulse.total ? `${Math.max(8, (pulse.advancing / pulse.total) * 100)}%` : '50%';

  return (
    <LinearGradient
      colors={[colors.bgCardAlt, colors.bgCard]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.md,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          position: 'absolute',
          width: 130,
          height: 130,
          borderRadius: 65,
          right: -50,
          top: -70,
          backgroundColor: (positive ? colors.positive : colors.negative) + '12',
        }}
      />
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flex: 1 }}>
          <Text variant="label" color="tertiary" weight="bold" style={{ letterSpacing: 0.7, textTransform: 'uppercase' }}>
            {title}
          </Text>
          {!!subtitle && (
            <Text variant="caption" color="secondary" style={{ marginTop: 2 }}>
              {subtitle}
            </Text>
          )}
        </View>
        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: positive ? colors.positiveSoft : colors.negativeSoft,
          }}
        >
          <Ionicons name={positive ? 'trending-up' : 'trending-down'} size={21} color={positive ? colors.positive : colors.negative} />
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginTop: spacing.md, gap: 6 }}>
        <Text variant="headline" weight="extrabold" style={{ color: positive ? colors.positive : colors.negative }}>
          {formatPercent(pulse.average)}
        </Text>
        <Text variant="label" color="tertiary" style={{ marginBottom: 3 }}>
          {averageLabel}
        </Text>
      </View>

      <View style={{ height: 7, borderRadius: 99, overflow: 'hidden', backgroundColor: colors.negativeSoft, marginTop: spacing.sm }}>
        <View style={{ height: '100%', width: advanceWidth as any, borderRadius: 99, backgroundColor: colors.positive }} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 7 }}>
        <Text variant="label" weight="semibold" color="positive">
          {pulse.advancing} {advancingLabel}
        </Text>
        <Text variant="label" weight="semibold" color="negative">
          {pulse.declining} {decliningLabel}
        </Text>
      </View>
    </LinearGradient>
  );
}
