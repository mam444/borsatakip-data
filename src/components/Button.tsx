import React from 'react';
import { Pressable, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeProvider';
import { Text } from './Text';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  icon?: React.ReactNode;
};

export function Button({ label, onPress, variant = 'primary', disabled, style, icon }: Props) {
  const { colors, radius, spacing } = useTheme();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress();
  };

  const content = (
    <>
      {icon}
      <Text
        variant="body"
        weight="semibold"
        color={variant === 'primary' ? 'inverse' : variant === 'danger' ? 'negative' : 'primary'}
      >
        {label}
      </Text>
    </>
  );

  const baseStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: 14,
    borderRadius: radius.md,
    opacity: disabled ? 0.5 : 1,
  };

  if (variant === 'primary') {
    return (
      <Pressable onPress={handlePress} disabled={disabled} style={style}>
        <LinearGradient
          colors={[colors.accentFrom, colors.accentTo]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={baseStyle}
        >
          {content}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={[
        baseStyle,
        {
          backgroundColor: variant === 'secondary' ? colors.bgCardAlt : 'transparent',
          borderWidth: variant === 'ghost' ? 1 : 0,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {content}
    </Pressable>
  );
}
