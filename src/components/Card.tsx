import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

type CardProps = ViewProps & {
  padded?: boolean;
  elevated?: boolean;
};

export function Card({ style, padded = true, elevated = false, ...rest }: CardProps) {
  const { colors, radius, spacing, isDark } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: elevated ? colors.bgCardAlt : colors.bgCard,
          borderRadius: radius.lg,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          padding: padded ? spacing.md : 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: elevated ? (isDark ? 0.28 : 0.11) : isDark ? 0 : 0.045,
          shadowRadius: elevated ? 18 : 12,
          elevation: elevated ? 4 : 1,
        },
        style,
      ]}
      {...rest}
    />
  );
}
