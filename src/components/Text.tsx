import React from 'react';
import { Text as RNText, TextProps } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

type Variant = 'display' | 'title' | 'headline' | 'body' | 'caption' | 'label';
type Weight = 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold';
type ColorKey = 'primary' | 'secondary' | 'tertiary' | 'positive' | 'negative' | 'accent' | 'inverse';

type Props = TextProps & {
  variant?: Variant;
  weight?: Weight;
  color?: ColorKey;
};

const VARIANT_SIZE: Record<Variant, keyof ReturnType<typeof useTheme>['fontSize']> = {
  display: 'display',
  title: 'xxl',
  headline: 'lg',
  body: 'base',
  caption: 'sm',
  label: 'xs',
};

export function Text({ variant = 'body', weight = 'regular', color = 'primary', style, ...rest }: Props) {
  const theme = useTheme();
  const sizeKey = VARIANT_SIZE[variant];
  const colorMap: Record<ColorKey, string> = {
    primary: theme.colors.textPrimary,
    secondary: theme.colors.textSecondary,
    tertiary: theme.colors.textTertiary,
    positive: theme.colors.positive,
    negative: theme.colors.negative,
    accent: theme.colors.accent,
    inverse: theme.colors.textInverse,
  };

  return (
    <RNText
      style={[
        {
          fontFamily: theme.font[weight],
          fontSize: theme.fontSize[sizeKey],
          lineHeight: theme.lineHeight[sizeKey],
          color: colorMap[color],
        },
        style,
      ]}
      {...rest}
    />
  );
}
