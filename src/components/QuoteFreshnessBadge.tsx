import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Quote } from '../services/marketData';
import { useTheme } from '../theme/ThemeProvider';
import { Text } from './Text';

const STATUS_LABELS: Record<NonNullable<Quote['dataStatus']>, string> = {
  realtime: 'Gerçek zamanlı API',
  delayed: 'Gecikmeli veri',
  eod: 'Gün sonu verisi',
  unknown: 'Gecikme bilgisi yok',
};

export function QuoteFreshnessBadge({ quote }: { quote?: Quote }) {
  const { colors, radius } = useTheme();
  if (!quote) return null;
  const status = quote.dataStatus ?? 'unknown';
  const live = status === 'realtime';
  const time = quote.lastUpdated
    ? new Date(quote.lastUpdated > 10_000_000_000 ? quote.lastUpdated : quote.lastUpdated * 1000).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    : undefined;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', marginTop: 12, paddingHorizontal: 9, paddingVertical: 6, borderRadius: radius.sm, backgroundColor: live ? colors.positiveSoft : colors.bgCardAlt, borderWidth: 1, borderColor: live ? colors.positive + '3D' : colors.border }}>
      <Ionicons name={live ? 'radio' : 'time-outline'} size={12} color={live ? colors.positive : colors.textTertiary} />
      <Text variant="label" weight="bold" style={{ color: live ? colors.positive : colors.textTertiary }}>
        {STATUS_LABELS[status]}
      </Text>
      <Text variant="label" color="tertiary">· {quote.dataSource ?? 'Veri sağlayıcı'}{time ? ` · ${time}` : ''}</Text>
    </View>
  );
}
