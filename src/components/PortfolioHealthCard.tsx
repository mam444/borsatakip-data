import React, { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { useT } from '../i18n/I18nContext';
import { Text } from './Text';
import { Card } from './Card';
import type { HoldingWithMarket } from '../utils/portfolioMath';

export function PortfolioHealthCard({ holdings, totalValue }: { holdings: HoldingWithMarket[]; totalValue: number }) {
  const { colors, spacing } = useTheme();
  const t = useT();
  const metrics = useMemo(() => {
    if (!holdings.length || totalValue <= 0) return { score: 0, maxWeight: 0, winners: 0, diversified: false };
    const weights = holdings.map((holding) => (holding.marketValueBase ?? 0) / totalValue);
    const maxWeight = Math.max(...weights, 0);
    const winners = holdings.filter((holding) => (holding.unrealizedPL ?? 0) > 0).length;
    const countScore = Math.min(35, holdings.length * 7);
    const concentrationScore = Math.max(0, 45 * (1 - maxWeight));
    const winnerScore = 20 * (winners / holdings.length);
    return {
      score: Math.round(Math.min(100, countScore + concentrationScore + winnerScore)),
      maxWeight: maxWeight * 100,
      winners,
      diversified: holdings.length >= 5 && maxWeight < 0.35,
    };
  }, [holdings, totalValue]);

  const circumference = 2 * Math.PI * 42;
  const tone = metrics.score >= 70 ? colors.positive : metrics.score >= 45 ? colors.gold : colors.negative;

  return (
    <Card elevated style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg }}>
      <View style={{ width: 104, height: 104, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={104} height={104} viewBox="0 0 104 104" style={{ position: 'absolute' }}>
          <Circle cx={52} cy={52} r={42} fill="none" stroke={colors.bgCardAlt} strokeWidth={9} />
          <Circle
            cx={52}
            cy={52}
            r={42}
            fill="none"
            stroke={tone}
            strokeWidth={9}
            strokeLinecap="round"
            strokeDasharray={`${circumference * (metrics.score / 100)} ${circumference}`}
            transform="rotate(-90 52 52)"
          />
        </Svg>
        <Text variant="headline" weight="extrabold" style={{ color: tone }}>{metrics.score}</Text>
        <Text color="tertiary" style={{ fontSize: 9 }} weight="bold">/ 100</Text>
      </View>
      <View style={{ flex: 1, gap: 9 }}>
        <View>
          <Text variant="body" weight="extrabold">{t.portfolio.health}</Text>
          <Text variant="label" color="tertiary">{metrics.diversified ? t.portfolio.healthBalanced : t.portfolio.healthImprove}</Text>
        </View>
        <HealthRow icon="pie-chart-outline" label={t.portfolio.largestPosition} value={`%${metrics.maxWeight.toFixed(0)}`} tone={metrics.maxWeight < 35 ? colors.positive : colors.gold} />
        <HealthRow icon="trophy-outline" label={t.portfolio.profitablePositions} value={`${metrics.winners}/${holdings.length}`} tone={colors.accent} />
      </View>
    </Card>
  );
}

function HealthRow({ icon, label, value, tone }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; tone: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <Ionicons name={icon} size={14} color={tone} />
      <Text variant="label" color="secondary" style={{ flex: 1 }}>{label}</Text>
      <Text variant="label" weight="extrabold" style={{ color: tone }}>{value}</Text>
    </View>
  );
}
