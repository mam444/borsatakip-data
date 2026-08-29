import React, { useEffect, useRef } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence, interpolateColor } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { Text } from './Text';

type Props = {
  value: number | null | undefined;
  formatted: string;
  variant?: 'display' | 'title' | 'headline' | 'body' | 'caption' | 'label';
  weight?: 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  color?: 'primary' | 'secondary' | 'tertiary' | 'positive' | 'negative' | 'accent' | 'inverse';
  style?: any;
};

// Flashes a brief green/red background wash when `value` changes direction —
// the classic trading-app "live tick" cue. Skips the flash on first mount so
// the price doesn't flash on every screen open.
export function FlashPrice({ value, formatted, variant = 'body', weight = 'semibold', color = 'primary', style }: Props) {
  const { colors } = useTheme();
  const flash = useSharedValue(0);
  const direction = useRef<'up' | 'down' | null>(null);
  const prevValue = useRef<number | null | undefined>(value);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevValue.current = value;
      return;
    }
    if (value !== undefined && value !== null && prevValue.current !== undefined && prevValue.current !== null && value !== prevValue.current) {
      direction.current = value > prevValue.current ? 'up' : 'down';
      flash.value = 0;
      flash.value = withSequence(withTiming(1, { duration: 120 }), withTiming(0, { duration: 700 }));
    }
    prevValue.current = value;
  }, [value]);

  const animatedStyle = useAnimatedStyle(() => {
    const target = direction.current === 'down' ? colors.negativeSoft : colors.positiveSoft;
    return {
      backgroundColor: interpolateColor(flash.value, [0, 1], ['transparent', target]),
      borderRadius: 6,
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <Text variant={variant} weight={weight} color={color} style={style}>
        {formatted}
      </Text>
    </Animated.View>
  );
}
