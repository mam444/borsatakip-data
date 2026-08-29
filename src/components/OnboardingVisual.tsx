import React from 'react';
import { ImageBackground, ImageSourcePropType, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { Text } from './Text';

type Props = {
  source: ImageSourcePropType;
  eyebrow: string;
  icon: keyof typeof Ionicons.glyphMap;
  height?: number;
};

export function OnboardingVisual({ source, eyebrow, icon, height = 250 }: Props) {
  const { radius, spacing } = useTheme();

  return (
    <View
      style={{
        height,
        borderRadius: radius.xl,
        overflow: 'hidden',
        backgroundColor: '#071712',
        shadowColor: '#06130F',
        shadowOffset: { width: 0, height: 18 },
        shadowOpacity: 0.24,
        shadowRadius: 28,
        elevation: 8,
      }}
    >
      <ImageBackground source={source} resizeMode="cover" style={{ flex: 1 }}>
        <LinearGradient
          colors={['rgba(4,18,13,0.02)', 'rgba(4,18,13,0.08)', 'rgba(4,18,13,0.82)']}
          locations={[0, 0.55, 1]}
          style={{ flex: 1, justifyContent: 'flex-end', padding: spacing.md }}
        >
          <View
            style={{
              alignSelf: 'flex-start',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 7,
              paddingHorizontal: 10,
              paddingVertical: 7,
              borderRadius: 999,
              backgroundColor: 'rgba(7,28,21,0.78)',
              borderWidth: 1,
              borderColor: 'rgba(139,255,202,0.26)',
            }}
          >
            <Ionicons name={icon} size={13} color="#7CF1B5" />
            <Text weight="extrabold" style={{ color: '#D9FFEB', fontSize: 10, letterSpacing: 1 }}>
              {eyebrow.toUpperCase()}
            </Text>
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}
