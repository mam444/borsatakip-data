import React, { useState } from 'react';
import { ImageBackground, Pressable, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeProvider';
import { Text } from './Text';

type Allocation = { label: string; percent: number; color: string };

type Props = {
  label: string;
  value: string;
  change: string;
  changePercent: number;
  onPress: () => void;
  allocations?: Allocation[];
  marketOpenLabel?: string;
};

const fallbackAllocation: Allocation[] = [
  { label: 'Hisse', percent: 68, color: '#67F1B2' },
  { label: 'Fon', percent: 22, color: '#69A8FF' },
  { label: 'Nakit', percent: 10, color: '#9AA8A3' },
];

export function PortfolioHero({
  label,
  value,
  change,
  changePercent,
  onPress,
  allocations = fallbackAllocation,
  marketOpenLabel = 'Piyasa açık',
}: Props) {
  const { radius, spacing } = useTheme();
  const [hidden, setHidden] = useState(false);
  const positive = changePercent >= 0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        borderRadius: radius.xl,
        shadowColor: '#071712',
        shadowOffset: { width: 0, height: 18 },
        shadowOpacity: 0.24,
        shadowRadius: 30,
        elevation: 9,
        opacity: pressed ? 0.97 : 1,
        transform: [{ scale: pressed ? 0.992 : 1 }],
      })}
    >
      <ImageBackground
        source={require('../../assets/market-hero-v2.png')}
        resizeMode="cover"
        imageStyle={{ borderRadius: radius.xl }}
        style={{ minHeight: 246, borderRadius: radius.xl, overflow: 'hidden' }}
      >
        <LinearGradient
          colors={['rgba(3,16,12,0.98)', 'rgba(4,20,15,0.79)', 'rgba(4,20,15,0.18)']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ flex: 1, minHeight: 246, padding: spacing.lg }}
        >
          <View style={{ position: 'absolute', right: -34, bottom: -74, width: 190, height: 190, borderRadius: 95, borderWidth: 1, borderColor: 'rgba(103,241,178,0.13)' }} />
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Text variant="caption" weight="medium" style={{ color: '#9BB0A8' }}>{label}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <Text variant="title" weight="extrabold" style={{ color: '#FFFFFF', fontSize: 30, letterSpacing: -1.2 }}>
                  {hidden ? '₺ ••••••' : value}
                </Text>
                <Pressable
                  hitSlop={10}
                  onPress={(event) => {
                    event.stopPropagation();
                    Haptics.selectionAsync().catch(() => {});
                    setHidden((v) => !v);
                  }}
                >
                  <Ionicons name={hidden ? 'eye-off-outline' : 'eye-outline'} size={18} color="#81978F" />
                </Pressable>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 99, borderWidth: 1, borderColor: 'rgba(103,241,178,0.17)', backgroundColor: 'rgba(103,241,178,0.10)' }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#67F1B2' }} />
              <Text style={{ color: '#AEE7CB', fontSize: 10 }} weight="bold">{marketOpenLabel}</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: spacing.sm }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8, backgroundColor: positive ? '#67F1B2' : '#FF7B87' }}>
              <Ionicons name={positive ? 'trending-up' : 'trending-down'} size={12} color="#061A12" />
              <Text variant="label" weight="extrabold" style={{ color: '#061A12' }}>
                {changePercent >= 0 ? '+' : ''}%{Math.abs(changePercent).toFixed(2)}
              </Text>
            </View>
            <Text variant="label" weight="semibold" style={{ color: '#9FB2AB' }}>{hidden ? '••••••' : change} bugün</Text>
          </View>

          <View style={{ marginTop: 'auto' }}>
            <View style={{ flexDirection: 'row', height: 6, gap: 4 }}>
              {allocations.map((item) => (
                <View key={item.label} style={{ flex: Math.max(item.percent, 1), borderRadius: 99, backgroundColor: item.color }} />
              ))}
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 10 }}>
              {allocations.map((item) => (
                <View key={item.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: item.color }} />
                  <Text style={{ color: '#899D96', fontSize: 10 }} weight="medium">
                    {item.label.replace('.IS', '')} %{Math.round(item.percent)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </Pressable>
  );
}
