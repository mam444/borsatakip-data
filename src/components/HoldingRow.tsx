import React from 'react';
import { View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '../theme/ThemeProvider';
import { useT } from '../i18n/I18nContext';
import { Text } from './Text';
import { PriceChangeBadge } from './PriceChangeBadge';
import { SymbolAvatar } from './SymbolAvatar';
import { formatPrice, formatSignedPrice, changeColorKey } from '../utils/format';
import type { HoldingWithMarket } from '../utils/portfolioMath';

export function HoldingRow({ holding }: { holding: HoldingWithMarket }) {
  const { colors, spacing } = useTheme();
  const t = useT();
  const plKey = changeColorKey(holding.unrealizedPL);

  return (
    <Pressable
      onPress={() => router.push(`/stock/${encodeURIComponent(holding.symbol)}`)}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        backgroundColor: pressed ? colors.bgCardAlt : 'transparent',
        borderRadius: 14,
      })}
    >
      <SymbolAvatar symbol={holding.symbol} />
      <View style={{ flex: 1, marginLeft: spacing.sm }}>
        <Text variant="body" weight="semibold">
          {holding.symbol.replace('.IS', '')}
        </Text>
        <Text variant="label" color="tertiary">
          {t.portfolio.sharesAvg.replace('{qty}', String(holding.quantity)).replace('{price}', formatPrice(holding.avgCost))}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 4 }}>
        <Text variant="body" weight="semibold">
          {formatPrice(holding.marketValue)}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text variant="label" style={{ color: plKey === 'positive' ? colors.positive : plKey === 'negative' ? colors.negative : colors.textTertiary }}>
            {formatSignedPrice(holding.unrealizedPL)}
          </Text>
          <PriceChangeBadge changePercent={holding.unrealizedPLPercent} size="sm" />
        </View>
      </View>
    </Pressable>
  );
}
