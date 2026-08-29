import React from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../theme/ThemeProvider';
import { useT } from '../i18n/I18nContext';
import { Text } from './Text';

type Slice = { label: string; value: number; color: string };

type Props = {
  data: Slice[];
  size?: number;
  strokeWidth?: number;
};

export function AllocationDonut({ data, size = 140, strokeWidth = 18 }: Props) {
  const { colors } = useTheme();
  const t = useT();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = data.reduce((s, d) => s + d.value, 0) || 1;

  let offset = 0;
  const segments = data.map((d) => {
    const fraction = d.value / total;
    const dash = fraction * circumference;
    const seg = { ...d, dash, offset };
    offset += dash;
    return seg;
  });

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {segments.map((s, i) => (
          <Circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={s.color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${s.dash} ${circumference - s.dash}`}
            strokeDashoffset={-s.offset}
            strokeLinecap="butt"
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        ))}
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center' }}>
        <Text variant="label" color="tertiary">
          {data.length}
        </Text>
        <Text variant="caption" weight="semibold">
          {t.common.positions}
        </Text>
      </View>
    </View>
  );
}
