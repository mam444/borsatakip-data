import React from 'react';
import { ImageBackground, Pressable, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { Text } from './Text';

type Props = {
  title: string;
  summary?: string;
  source?: string;
  onPress: () => void;
};

export function EditorialStory({ title, summary, source = 'GÜNLÜK BÜLTEN', onPress }: Props) {
  const { radius, spacing } = useTheme();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.96 : 1, transform: [{ scale: pressed ? 0.994 : 1 }] })}>
      <ImageBackground
        source={require('../../assets/istanbul-finance-v2.png')}
        resizeMode="cover"
        imageStyle={{ borderRadius: radius.xl }}
        style={{ minHeight: 252, borderRadius: radius.xl, overflow: 'hidden', backgroundColor: '#10213A' }}
      >
        <LinearGradient colors={['rgba(3,12,20,0.10)', 'rgba(3,12,20,0.42)', 'rgba(3,12,20,0.96)']} style={{ flex: 1, minHeight: 252, padding: spacing.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ borderRadius: 8, paddingHorizontal: 9, paddingVertical: 6, backgroundColor: '#67F1B2' }}>
              <Text style={{ color: '#052014', fontSize: 9, letterSpacing: 0.7 }} weight="extrabold">{source.toUpperCase()}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.24)', backgroundColor: 'rgba(6,18,27,0.36)' }}>
              <Ionicons name="time-outline" size={12} color="#FFFFFF" />
              <Text style={{ color: '#FFFFFF', fontSize: 9 }} weight="bold">4 dk</Text>
            </View>
          </View>
          <View style={{ marginTop: 'auto', paddingRight: 42 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 7 }}>
              <View style={{ width: 16, height: 1, backgroundColor: '#67F1B2' }} />
              <Text style={{ color: '#B8D6CA', fontSize: 10 }} weight="bold">Piyasa gündemi</Text>
            </View>
            <Text variant="headline" weight="extrabold" style={{ color: '#FFFFFF', lineHeight: 26, letterSpacing: -0.55 }} numberOfLines={3}>{title}</Text>
            {!!summary && <Text style={{ color: '#AABBB5', fontSize: 11, lineHeight: 16, marginTop: 6 }} numberOfLines={2}>{summary}</Text>}
          </View>
          <View style={{ position: 'absolute', right: spacing.md, bottom: spacing.md, width: 36, height: 36, borderRadius: 12, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="arrow-up" size={18} color="#0A2119" style={{ transform: [{ rotate: '45deg' }] }} />
          </View>
        </LinearGradient>
      </ImageBackground>
    </Pressable>
  );
}
