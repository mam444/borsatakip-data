import React from 'react';
import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { Text } from './Text';

type Action = {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  tint?: 'default' | 'gold';
};

type Props = {
  title: string;
  subtitle?: string;
  actions?: Action[];
  brand?: boolean;
};

export function ScreenHeader({ title, subtitle, actions, brand = false }: Props) {
  const { colors, spacing, radius } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.sm,
      }}
    >
      {brand && (
        <View style={{ width: 43, height: 43, borderRadius: 14, backgroundColor: '#081713', alignItems: 'center', justifyContent: 'center', marginRight: 11, shadowColor: '#081713', shadowOffset: { width: 0, height: 7 }, shadowOpacity: 0.18, shadowRadius: 14 }}>
          <Ionicons name="trending-up" size={23} color="#67F1B2" />
        </View>
      )}
      <View style={{ flex: 1, minWidth: 0 }}>
        {subtitle && (
          <Text color="tertiary" weight="extrabold" style={{ fontSize: 10, letterSpacing: 1.2 }}>
            {subtitle}
          </Text>
        )}
        <Text variant="title" weight="extrabold" numberOfLines={1} style={{ letterSpacing: -0.8 }}>
          {title}
        </Text>
      </View>
      {actions && (
        <View style={{ flexDirection: 'row', gap: spacing.xs }}>
          {actions.map((a, i) => (
            <Pressable
              key={i}
              onPress={a.onPress}
              style={{
                width: 40,
                height: 40,
                borderRadius: radius.md,
                backgroundColor: a.tint === 'gold' ? colors.gold + '22' : colors.bgCard,
                borderWidth: 1,
                borderColor: a.tint === 'gold' ? colors.gold : colors.border,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name={a.icon} size={19} color={a.tint === 'gold' ? colors.gold : colors.textPrimary} />
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}
