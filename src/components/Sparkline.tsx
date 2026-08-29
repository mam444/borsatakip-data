import React, { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Polyline, Path } from 'react-native-svg';
import { useTheme } from '../theme/ThemeProvider';

type Props = {
  data: number[];
  width?: number;
  height?: number;
  positive?: boolean;
};

export function Sparkline({ data, width = 72, height = 32, positive }: Props) {
  const { colors } = useTheme();
  const color = positive === undefined ? colors.accent : positive ? colors.positive : colors.negative;

  const points = useMemo(() => {
    if (!data || data.length < 2) return '';
    const min = Math.min(...data);
    const max = Math.max(...data);
    const span = max - min || 1;
    const stepX = width / (data.length - 1);
    return data
      .map((v, i) => {
        const x = i * stepX;
        const y = height - ((v - min) / span) * height;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }, [data, width, height]);

  if (!points) return <View style={{ width, height }} />;

  return (
    <Svg width={width} height={height}>
      <Polyline points={points} fill="none" stroke={color} strokeWidth={1.75} strokeLinejoin="round" strokeLinecap="round" />
    </Svg>
  );
}
