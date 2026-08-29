import React from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { Text } from './Text';

type Props = {
  title: string;
  eyebrow?: string;
  subtitle?: string;
  actionIcon?: keyof typeof Ionicons.glyphMap;
  onAction?: () => void;
};

export function ModalHeader({ title, eyebrow, subtitle, actionIcon, onAction }: Props) {
  const { colors, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top + spacing.sm, paddingHorizontal: spacing.md, paddingBottom: spacing.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({ width: 40, height: 40, borderRadius: 13, backgroundColor: pressed ? colors.bgCardAlt : colors.bgCard, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' })}
        >
          <Ionicons name="close" size={21} color={colors.textPrimary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          {!!eyebrow && <Text color="tertiary" weight="extrabold" style={{ fontSize: 9, letterSpacing: 1.1 }}>{eyebrow.toUpperCase()}</Text>}
          <Text variant="headline" weight="extrabold" numberOfLines={1} style={{ letterSpacing: -0.55 }}>{title}</Text>
        </View>
        {!!actionIcon && !!onAction && (
          <Pressable onPress={onAction} style={{ width: 40, height: 40, borderRadius: radius.md, backgroundColor: '#081713', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name={actionIcon} size={20} color="#67F1B2" />
          </Pressable>
        )}
      </View>
      {!!subtitle && <Text variant="caption" color="secondary" style={{ marginTop: spacing.xs }}>{subtitle}</Text>}
    </View>
  );
}
