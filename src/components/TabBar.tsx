import React from 'react';
import { View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useTheme } from '../theme/ThemeProvider';
import { Text } from './Text';
import { useT } from '../i18n/I18nContext';

const ICONS: Record<string, { active: any; inactive: any }> = {
  index: { active: 'home', inactive: 'home-outline' },
  watchlist: { active: 'star', inactive: 'star-outline' },
  portfolio: { active: 'pie-chart', inactive: 'pie-chart-outline' },
  markets: { active: 'stats-chart', inactive: 'stats-chart-outline' },
  profile: { active: 'person', inactive: 'person-outline' },
};

const LABEL_KEY: Record<string, keyof ReturnType<typeof useT>['tabs']> = {
  index: 'home',
  watchlist: 'watchlist',
  portfolio: 'portfolio',
  markets: 'markets',
  profile: 'profile',
};

function TabItem({ focused, route, onPress }: { focused: boolean; route: string; onPress: () => void }) {
  const { colors, spacing, radius } = useTheme();
  const t = useT();
  const icons = ICONS[route] ?? ICONS.index;
  const center = route === 'portfolio';

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(focused ? 1 : 0.92, { damping: 14, stiffness: 180 }) }],
  }));

  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onPress();
      }}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 7 }}
    >
      <Animated.View
        style={[
          {
            alignItems: 'center',
            gap: center ? 4 : 3,
            minWidth: 52,
            paddingVertical: center ? 0 : 5,
            paddingHorizontal: 7,
            borderRadius: radius.md,
            backgroundColor: 'transparent',
            marginTop: center ? -27 : 0,
          },
          animatedStyle,
        ]}
      >
        <View style={center ? { width: 54, height: 54, borderRadius: 18, backgroundColor: '#67F1B2', borderWidth: 5, borderColor: colors.bg, alignItems: 'center', justifyContent: 'center', shadowColor: '#2DC987', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 14, elevation: 8 } : undefined}>
          <Ionicons name={focused ? icons.active : icons.inactive} size={center ? 24 : 21} color={center ? '#082118' : focused ? colors.accent : colors.textTertiary} />
        </View>
        <Text variant="label" weight={focused ? 'bold' : 'medium'} style={{ color: focused ? colors.accent : colors.textTertiary, fontSize: center ? 9 : 10 }}>
          {t.tabs[LABEL_KEY[route] ?? 'home']}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

type MinimalTabBarProps = {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: {
    emit: (event: { type: string; target: string; canPreventDefault: boolean }) => { defaultPrevented: boolean };
    navigate: (name: string) => void;
  };
};

export function TabBar({ state, navigation }: MinimalTabBarProps) {
  const { colors, radius, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
      <View
        style={{
          borderTopLeftRadius: radius.lg,
          borderTopRightRadius: radius.lg,
          overflow: 'hidden',
          borderTopWidth: 1,
          borderColor: colors.border,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: isDark ? 0.42 : 0.12,
          shadowRadius: 22,
          elevation: 12,
        }}
      >
        <BlurView intensity={82} tint={isDark ? 'dark' : 'light'} style={{ flexDirection: 'row', minHeight: 76 + insets.bottom, paddingBottom: insets.bottom, paddingTop: 6, backgroundColor: isDark ? 'rgba(7,18,15,0.94)' : 'rgba(255,255,255,0.94)' }}>
          {state.routes.filter((route) => route.name !== 'search').map((route) => {
            const index = state.routes.findIndex((item) => item.key === route.key);
            const focused = state.index === index;
            return (
              <TabItem
                key={route.key}
                route={route.name}
                focused={focused}
                onPress={() => {
                  const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                  if (!focused && !event.defaultPrevented) {
                    navigation.navigate(route.name);
                  }
                }}
              />
            );
          })}
        </BlurView>
      </View>
    </View>
  );
}
