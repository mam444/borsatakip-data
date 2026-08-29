import React from 'react';
import { View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '../theme/ThemeProvider';
import { Text } from './Text';
import { Sparkline } from './Sparkline';
import { PriceChangeBadge } from './PriceChangeBadge';
import { FlashPrice } from './FlashPrice';
import { SymbolAvatar } from './SymbolAvatar';
import { formatPrice, changeColorKey } from '../utils/format';

type Props = {
  symbol: string;
  name?: string;
  price?: number;
  changePercent?: number;
  sparklineData?: number[];
  onPress?: () => void;
};

export function StockListRow({ symbol, name, price, changePercent, sparklineData, onPress }: Props) {
  const { colors, spacing, radius } = useTheme();
  const key = changeColorKey(changePercent);

  return (
    <Pressable
      onPress={onPress ?? (() => router.push(`/stock/${encodeURIComponent(symbol)}`))}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 13,
        paddingHorizontal: spacing.md,
        backgroundColor: pressed ? colors.bgCardAlt : 'transparent',
        borderRadius: radius.md,
        gap: spacing.sm,
      })}
    >
      <SymbolAvatar symbol={symbol} size={40} />

      <View style={{ flex: 1, minWidth: 0 }}>
        <Text variant="body" weight="bold" numberOfLines={1} style={{ letterSpacing: -0.2 }}>
          {symbol.replace('.IS', '')}
        </Text>
        {!!name && (
          <Text variant="caption" color="tertiary" numberOfLines={1}>
            {name}
          </Text>
        )}
      </View>

      {sparklineData && sparklineData.length > 1 && (
        <Sparkline data={sparklineData} positive={key === 'positive' ? true : key === 'negative' ? false : undefined} />
      )}

      <View style={{ alignItems: 'flex-end', minWidth: 84, gap: 4 }}>
        <FlashPrice value={price} formatted={formatPrice(price)} />
        <PriceChangeBadge changePercent={changePercent} size="sm" />
      </View>
    </Pressable>
  );
}
