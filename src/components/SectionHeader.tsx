import React from 'react';
import { View, Pressable } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Text } from './Text';
import { useT } from '../i18n/I18nContext';

type Props = {
  title: string;
  eyebrow?: string;
  onSeeAll?: () => void;
};

export function SectionHeader({ title, eyebrow, onSeeAll }: Props) {
  const { spacing } = useTheme();
  const t = useT();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.sm,
      }}
    >
      <View>
        {!!eyebrow && (
          <Text color="tertiary" weight="extrabold" style={{ fontSize: 10, letterSpacing: 1.25, marginBottom: 2 }}>
            {eyebrow.toUpperCase()}
          </Text>
        )}
        <Text variant="headline" weight="extrabold" style={{ letterSpacing: -0.55 }}>{title}</Text>
      </View>
      {onSeeAll && (
        <Pressable onPress={onSeeAll} hitSlop={8}>
          <Text variant="caption" weight="semibold" color="accent">
            {t.common.seeAll}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
