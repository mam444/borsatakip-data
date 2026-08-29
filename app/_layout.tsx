import React, { useEffect, useCallback } from 'react';
import { Platform, View } from 'react-native';
import { Stack, router } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';

import { ThemeProvider, useTheme } from '../src/theme/ThemeProvider';
import { I18nProvider } from '../src/i18n/I18nContext';
import { useAlertsWatcher } from '../src/hooks/useAlertsWatcher';
import { useSettingsStore } from '../src/store/useSettingsStore';
import { Sentry } from '../src/services/sentry';
import { registerAlertsBackgroundTask } from '../src/services/alertsBackground';

SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function RootNavigator() {
  const { colors, isDark } = useTheme();
  const hasOnboarded = useSettingsStore((s) => s.hasOnboarded);
  const hasHydrated = useSettingsStore((s) => s.hasHydrated);
  useAlertsWatcher();

  useEffect(() => {
    if (hasHydrated) registerAlertsBackgroundTask().catch(() => {});
  }, [hasHydrated]);

  useEffect(() => {
    if (hasHydrated && !hasOnboarded) {
      router.replace('/onboarding');
    }
  }, [hasHydrated, hasOnboarded]);

  return (
    <View
      style={{
        flex: 1,
        width: '100%',
        maxWidth: Platform.OS === 'web' ? 480 : undefined,
        alignSelf: 'center',
        overflow: 'hidden',
        backgroundColor: colors.bg,
        shadowColor: '#081713',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: Platform.OS === 'web' ? 0.16 : 0,
        shadowRadius: 48,
      }}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
        <Stack.Screen name="stock/[symbol]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="alerts" options={{ presentation: 'modal' }} />
        <Stack.Screen name="settings" options={{ presentation: 'modal' }} />
        <Stack.Screen name="add-transaction" options={{ presentation: 'modal' }} />
        <Stack.Screen name="create-alert" options={{ presentation: 'modal' }} />
        <Stack.Screen name="news" options={{ presentation: 'modal' }} />
        <Stack.Screen name="calculators" options={{ presentation: 'modal' }} />
        <Stack.Screen name="compare" options={{ presentation: 'modal' }} />
        <Stack.Screen name="scanner" options={{ presentation: 'modal' }} />
        <Stack.Screen name="market-hours" options={{ presentation: 'modal' }} />
        <Stack.Screen name="premium" options={{ presentation: 'modal' }} />
      </Stack>
    </View>
  );
}

function RootLayout() {
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    onLayoutRootView();
  }, [onLayoutRootView]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#DFE6E2' }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <I18nProvider>
            <RootNavigator />
          </I18nProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

export default Sentry.wrap(RootLayout);
