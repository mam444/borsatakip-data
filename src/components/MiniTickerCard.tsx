import React from 'react';
import { View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../theme/ThemeProvider';
import { Text } from './Text';
import { PriceChangeBadge } from './PriceChangeBadge';
import { formatPrice } from '../utils/format';
import { Skeleton } from './Skeleton';

type Props = {
  symbol?: string;
  label: string;
  icon?: string;
  price?: number;
  changePercent?: number;
  loading?: boolean;
};

export function MiniTickerCard({ symbol, label, icon, price, changePercent, loading }: Props) {
  const { colors, radius, spacing } = useTheme();
  const positive = (changePercent ?? 0) >= 0;
  return (
    <Pressable
      disabled={!symbol}
      onPress={() => symbol && router.push(`/stock/${encodeURIComponent(symbol)}`)}
      style={({ pressed }) => ({
        backgroundColor: colors.bgCard,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        paddingVertical: 14,
        paddingHorizontal: 14,
        minWidth: 154,
        minHeight: 154,
        gap: 7,
        opacity: pressed ? 0.86 : 1,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ width: 30, height: 30, borderRadius: 10, backgroundColor: positive ? colors.positiveSoft : colors.negativeSoft, alignItems: 'center', justifyContent: 'center' }}>
          {icon ? <Text style={{ fontSize: 14 }}>{icon}</Text> : <Ionicons name="stats-chart" size={14} color={positive ? colors.positive : colors.negative} />}
        </View>
        {!loading && <PriceChangeBadge changePercent={changePercent} size="sm" />}
      </View>
      {loading ? (
        <>
          <Skeleton width={70} height={16} />
          <Skeleton width={50} height={14} />
        </>
      ) : (
        <>
          <Text color="tertiary" weight="medium" numberOfLines={1} style={{ fontSize: 11 }}>{label}</Text>
          <Text variant="body" weight="extrabold" style={{ letterSpacing: -0.35 }}>
            {formatPrice(price)}
          </Text>
          <Svg width="100%" height={42} viewBox="0 0 130 42" preserveAspectRatio="none" style={{ marginTop: 2 }}>
            <Path
              d={positive ? 'M2 35 C14 32 18 37 29 27 S47 31 56 20 S72 24 81 15 S98 21 108 10 S120 13 128 3' : 'M2 8 C14 11 20 7 31 15 S47 13 59 22 S75 17 84 27 S99 20 109 32 S121 27 128 36'}
              fill="none"
              stroke={positive ? colors.positive : colors.negative}
              strokeWidth={2}
            />
          </Svg>
        </>
      )}
    </Pressable>
  );
}
