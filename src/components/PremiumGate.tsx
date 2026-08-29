import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { Text } from './Text';
import { useT } from '../i18n/I18nContext';
import { usePremiumStore } from '../store/usePremiumStore';

type Props = {
  children: React.ReactNode;
  compact?: boolean;
};

// Wraps a VIP-only section: renders children normally for premium users,
// otherwise shows a blurred-looking locked placeholder that deep-links to the
// paywall. Purely a UI gate — no data is fetched/shown for locked content.
export function PremiumGate({ children, compact }: Props) {
  const { colors, radius, spacing } = useTheme();
  const t = useT();
  const isPremium = usePremiumStore((s) => s.isPremium);

  if (isPremium) return <>{children}</>;

  return (
    <Pressable
      onPress={() => router.push('/premium')}
      style={{
        borderRadius: radius.md,
        overflow: 'hidden',
      }}
    >
      <View style={{ opacity: 0.25 }} pointerEvents="none">
        {children}
      </View>
      <View
        style={{
          ...StyleSheet.absoluteFill,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.overlay,
          gap: 4,
          paddingVertical: compact ? spacing.xs : spacing.sm,
        }}
      >
        <Ionicons name="lock-closed" size={compact ? 14 : 18} color={colors.gold} />
        {!compact && (
          <Text variant="label" weight="bold" style={{ color: colors.gold }}>
            {t.premium.upgradeToUnlock}
          </Text>
        )}
      </View>
    </Pressable>
  );
}
