import React from 'react';
import { ImageBackground, ImageSourcePropType, Pressable, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { Quote } from '../services/marketData';
import { formatPrice } from '../utils/format';
import { Text } from './Text';

type Props = {
  source: ImageSourcePropType;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  quote?: Quote;
  active?: boolean;
  onPress: () => void;
};

export function MarketVisualCard({ source, title, subtitle, icon, quote, active, onPress }: Props) {
  const { colors, radius, spacing } = useTheme();
  const positive = (quote?.regularMarketChangePercent ?? 0) >= 0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        width: 278,
        height: 178,
        borderRadius: radius.xl,
        overflow: 'hidden',
        borderWidth: active ? 2 : 1,
        borderColor: active ? colors.accent : 'rgba(255,255,255,0.12)',
        opacity: pressed ? 0.9 : 1,
        transform: [{ scale: pressed ? 0.985 : 1 }],
        shadowColor: '#04140E',
        shadowOffset: { width: 0, height: 14 },
        shadowOpacity: active ? 0.24 : 0.14,
        shadowRadius: 22,
        elevation: 5,
      })}
    >
      <ImageBackground source={source} resizeMode="cover" style={{ flex: 1 }}>
        <LinearGradient
          colors={['rgba(2,14,10,0.72)', 'rgba(2,14,10,0.34)', 'rgba(2,14,10,0.03)']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ flex: 1, padding: spacing.md, justifyContent: 'space-between' }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ width: 34, height: 34, borderRadius: 12, backgroundColor: 'rgba(103,241,178,0.16)', borderWidth: 1, borderColor: 'rgba(103,241,178,0.28)', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={icon} size={17} color="#8BFFCA" />
            </View>
            {active && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 999, backgroundColor: 'rgba(7,31,23,0.8)', paddingHorizontal: 8, paddingVertical: 5 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#67F1B2' }} />
                <Text weight="bold" style={{ color: '#CBFFE2', fontSize: 9, letterSpacing: 0.8 }}>AKTİF</Text>
              </View>
            )}
          </View>

          <View style={{ maxWidth: 174 }}>
            <Text variant="headline" weight="extrabold" style={{ color: '#FFFFFF', letterSpacing: -0.5 }} numberOfLines={1}>
              {title}
            </Text>
            <Text variant="label" style={{ color: '#A9C2B8', marginTop: 3 }} numberOfLines={1}>
              {subtitle}
            </Text>
            {quote?.regularMarketPrice !== undefined && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 }}>
                <Text variant="body" weight="extrabold" style={{ color: '#FFFFFF' }}>
                  {formatPrice(quote.regularMarketPrice)}
                </Text>
                <Text variant="label" weight="bold" style={{ color: positive ? '#7CF1B5' : '#FF9AA3' }}>
                  {(quote.regularMarketChangePercent ?? 0) > 0 ? '+' : ''}{quote.regularMarketChangePercent?.toFixed(2) ?? '0.00'}%
                </Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </ImageBackground>
    </Pressable>
  );
}
