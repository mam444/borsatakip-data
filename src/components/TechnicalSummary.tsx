import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { useT } from '../i18n/I18nContext';
import { Text } from './Text';
import { Card } from './Card';
import type { Quote } from '../services/marketData';
import { formatPercent } from '../utils/format';

export function TechnicalSummary({ quote }: { quote?: Quote }) {
  const { colors, spacing, radius } = useTheme();
  const t = useT();
  const result = useMemo(() => {
    const price = quote?.regularMarketPrice;
    const signals = [
      price !== undefined && quote?.fiftyDayAverage !== undefined ? price >= quote.fiftyDayAverage : undefined,
      price !== undefined && quote?.twoHundredDayAverage !== undefined ? price >= quote.twoHundredDayAverage : undefined,
      quote?.regularMarketChangePercent !== undefined ? quote.regularMarketChangePercent >= 0 : undefined,
    ].filter((value): value is boolean => value !== undefined);
    const positive = signals.filter(Boolean).length;
    const score = signals.length ? Math.round((positive / signals.length) * 100) : 50;
    const outlook = score >= 67 ? 'bullish' : score <= 33 ? 'bearish' : 'neutral';
    return { score, outlook };
  }, [quote]);

  const tone = result.outlook === 'bullish' ? colors.positive : result.outlook === 'bearish' ? colors.negative : colors.gold;
  const outlookLabel = result.outlook === 'bullish' ? t.stock.bullish : result.outlook === 'bearish' ? t.stock.bearish : t.stock.neutralOutlook;

  return (
    <Card elevated>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <Text variant="body" weight="extrabold">{t.stock.technicalOutlook}</Text>
          <Text variant="label" color="tertiary">{t.stock.technicalSubtitle}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 7, borderRadius: radius.pill, backgroundColor: tone + '18' }}>
          <Ionicons name={result.outlook === 'bullish' ? 'trending-up' : result.outlook === 'bearish' ? 'trending-down' : 'remove'} size={15} color={tone} />
          <Text variant="label" weight="extrabold" style={{ color: tone }}>{outlookLabel}</Text>
        </View>
      </View>
      <View style={{ height: 8, borderRadius: 4, backgroundColor: colors.bgCardAlt, marginTop: spacing.md, overflow: 'hidden' }}>
        <View style={{ width: `${result.score}%`, height: 8, borderRadius: 4, backgroundColor: tone }} />
      </View>
      <View style={{ flexDirection: 'row', gap: spacing.xs, marginTop: spacing.md }}>
        <Signal label={t.stock.dayMomentum} active={(quote?.regularMarketChangePercent ?? 0) >= 0} value={formatPercent(quote?.regularMarketChangePercent)} />
        <Signal label={t.stock.above50} active={(quote?.regularMarketPrice ?? 0) >= (quote?.fiftyDayAverage ?? Infinity)} value={quote?.fiftyDayAverage ? '50G' : '—'} />
        <Signal label={t.stock.above200} active={(quote?.regularMarketPrice ?? 0) >= (quote?.twoHundredDayAverage ?? Infinity)} value={quote?.twoHundredDayAverage ? '200G' : '—'} />
      </View>
    </Card>
  );
}

function Signal({ label, active, value }: { label: string; active: boolean; value: string }) {
  const { colors, radius } = useTheme();
  const tone = value === '—' ? colors.textTertiary : active ? colors.positive : colors.negative;
  return (
    <View style={{ flex: 1, padding: 9, borderRadius: radius.md, backgroundColor: colors.bgCardAlt }}>
      <Text style={{ color: tone, fontSize: 11 }} weight="extrabold" numberOfLines={1}>{value}</Text>
      <Text color="tertiary" style={{ fontSize: 9, marginTop: 2 }} numberOfLines={1}>{label}</Text>
    </View>
  );
}
