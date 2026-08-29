import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { Text } from './Text';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
};

export function EmptyState({ icon, title, subtitle }: Props) {
  const { colors, spacing, radius } = useTheme();
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxl, gap: spacing.xs }}>
      <View
        style={{
          width: 82,
          height: 82,
          borderRadius: radius.xl,
          backgroundColor: colors.accentSoft,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: spacing.xs,
          borderWidth: 1,
          borderColor: colors.accent + '22',
          overflow: 'hidden',
        }}
      >
        <View style={{ position: 'absolute', width: 52, height: 52, borderRadius: 26, right: -17, top: -18, backgroundColor: colors.accent + '12' }} />
        <View style={{ width: 44, height: 44, borderRadius: 15, backgroundColor: colors.bgCard, alignItems: 'center', justifyContent: 'center', shadowColor: colors.accent, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 10 }}>
          <Ionicons name={icon} size={22} color={colors.accent} />
        </View>
      </View>
      <Text variant="body" weight="extrabold" color="secondary">
        {title}
      </Text>
      {subtitle && (
        <Text variant="caption" color="tertiary" style={{ textAlign: 'center', paddingHorizontal: spacing.xl }}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}
