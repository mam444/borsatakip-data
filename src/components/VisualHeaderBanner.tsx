import React from 'react';
import { ImageBackground, ImageSourcePropType, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { Text } from './Text';

type Props = {
  source: ImageSourcePropType;
  eyebrow: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
};

export function VisualHeaderBanner({ source, eyebrow, title, icon }: Props) {
  const { spacing, radius } = useTheme();
  return (
    <ImageBackground source={source} resizeMode="cover" imageStyle={{ borderRadius: radius.lg }} style={{ height: 150, marginHorizontal: spacing.md, marginBottom: spacing.md, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: '#0A241A' }}>
      <LinearGradient colors={['rgba(3,18,13,0.76)', 'rgba(3,18,13,0.28)', 'rgba(3,18,13,0.04)']} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={{ flex: 1, padding: spacing.md, justifyContent: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 7 }}>
          <Ionicons name={icon} size={13} color="#86F7BE" />
          <Text weight="extrabold" style={{ color: '#A7EAC7', fontSize: 9, letterSpacing: 1 }}>{eyebrow.toUpperCase()}</Text>
        </View>
        <Text variant="headline" weight="extrabold" style={{ color: '#FFFFFF', maxWidth: 210 }}>{title}</Text>
      </LinearGradient>
    </ImageBackground>
  );
}
