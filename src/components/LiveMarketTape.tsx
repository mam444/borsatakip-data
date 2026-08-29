import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Text } from './Text';
import { formatPercent, formatPrice } from '../utils/format';
import type { Quote } from '../services/marketData';

export function LiveMarketTape({ quotes, liveLabel = 'CANLI' }: { quotes?: Quote[]; liveLabel?: string }) {
  const { colors, radius, spacing } = useTheme();
  const [clock, setClock] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);

  return (
    <View
      style={{
        minHeight: 36,
        marginHorizontal: spacing.md,
        marginBottom: spacing.sm,
        paddingHorizontal: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        borderRadius: radius.sm,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.bgCard + 'E8',
        overflow: 'hidden',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.positive, shadowColor: colors.positive, shadowOpacity: 0.65, shadowRadius: 5 }} />
        <Text style={{ color: colors.positive, fontSize: 9, letterSpacing: 0.8 }} weight="extrabold">{liveLabel}</Text>
      </View>
      <View style={{ flex: 1, flexDirection: 'row', gap: 15, overflow: 'hidden' }}>
        {(quotes ?? []).slice(0, 2).map((quote) => (
          <View key={quote.symbol} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={{ fontSize: 9 }} weight="extrabold" numberOfLines={1}>{quote.symbol.replace('XU100.IS', 'BIST 100').replace('USDTRY=X', 'USD/TRY')}</Text>
            <Text color="tertiary" style={{ fontSize: 9 }}>{formatPrice(quote.regularMarketPrice)}</Text>
            <Text style={{ fontSize: 9, color: (quote.regularMarketChangePercent ?? 0) >= 0 ? colors.positive : colors.negative }} weight="bold">
              {formatPercent(quote.regularMarketChangePercent)}
            </Text>
          </View>
        ))}
      </View>
      <Text color="tertiary" style={{ fontSize: 9 }} weight="bold">
        {clock.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );
}
