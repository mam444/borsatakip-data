import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { Text } from './Text';
import { formatPercent, changeColorKey } from '../utils/format';

type Props = {
  changePercent: number | null | undefined;
  size?: 'sm' | 'md';
};

export function PriceChangeBadge({ changePercent, size = 'md' }: Props) {
  const { colors, radius, spacing } = useTheme();
  const key = changeColorKey(changePercent);
  const bg = key === 'positive' ? colors.positiveSoft : key === 'negative' ? colors.negativeSoft : colors.accentSoft;
  const fg = key === 'positive' ? colors.positive : key === 'negative' ? colors.negative : colors.neutral;
  const icon = key === 'positive' ? 'caret-up' : key === 'negative' ? 'caret-down' : 'remove';

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: bg,
        borderRadius: radius.pill,
        paddingHorizontal: size === 'sm' ? spacing.xs : spacing.sm,
        paddingVertical: size === 'sm' ? 2 : 4,
        gap: 2,
        alignSelf: 'flex-start',
      }}
    >
      <Ionicons name={icon as any} size={size === 'sm' ? 10 : 12} color={fg} />
      <Text variant={size === 'sm' ? 'label' : 'caption'} weight="semibold" style={{ color: fg }}>
        {formatPercent(changePercent)}
      </Text>
    </View>
  );
}
