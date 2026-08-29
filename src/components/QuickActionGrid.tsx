import React from 'react';
import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeProvider';
import { Text } from './Text';

export type QuickAction = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
};

export function QuickActionGrid({ actions }: { actions: QuickAction[] }) {
  const { colors, radius, spacing } = useTheme();

  return (
    <View style={{ flexDirection: 'row', gap: 5, paddingVertical: 13, paddingHorizontal: 8, borderRadius: radius.lg, backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border, shadowColor: '#142F26', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.055, shadowRadius: 22 }}>
      {actions.map((action) => (
        <Pressable
          key={action.label}
          onPress={() => {
            Haptics.selectionAsync().catch(() => {});
            action.onPress();
          }}
          style={({ pressed }) => ({
            flex: 1,
            alignItems: 'center',
            gap: 8,
            paddingVertical: 2,
            paddingHorizontal: 2,
            borderRadius: radius.md,
            backgroundColor: pressed ? colors.bgCardAlt : 'transparent',
            transform: [{ scale: pressed ? 0.97 : 1 }],
          })}
        >
          <View
            style={{
              width: 41,
              height: 41,
              borderRadius: 13,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: action.color + '18',
            }}
          >
            <Ionicons name={action.icon} size={18} color={action.color} />
          </View>
          <Text weight="bold" numberOfLines={1} style={{ fontSize: 10, color: colors.textSecondary }}>
            {action.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
