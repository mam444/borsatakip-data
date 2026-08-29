import React from 'react';
import { View, ScrollView, Pressable, Alert, Share } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme } from '../src/theme/ThemeProvider';
import { useT } from '../src/i18n/I18nContext';
import { Text } from '../src/components/Text';
import { Card } from '../src/components/Card';
import { useSettingsStore, ThemePreference, Language, DisplayCurrency, AccentPreset } from '../src/store/useSettingsStore';
import { usePremiumStore, FREE_LIMITS } from '../src/store/usePremiumStore';
import { usePortfolioStore } from '../src/store/usePortfolioStore';
import { ACCENT_PRESETS } from '../src/theme/colors';
import { PremiumGate } from '../src/components/PremiumGate';
import { portfoliosToCsv } from '../src/utils/csvExport';
import { PRIVACY_POLICY_URL } from '../src/constants/links';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';
import { ModalHeader } from '../src/components/ModalHeader';
import { DataSourceBadge } from '../src/components/DataSourceBadge';
import { ensureNotificationPermission } from '../src/services/alerts';
import { VisualHeaderBanner } from '../src/components/VisualHeaderBanner';

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const { colors, radius, spacing } = useTheme();
  return (
    <View style={{ flexDirection: 'row', backgroundColor: colors.bgCardAlt, borderRadius: radius.md, padding: 3, gap: 3 }}>
      {options.map((opt) => (
        <Pressable
          key={opt.value}
          onPress={() => onChange(opt.value)}
          style={{
            flex: 1,
            paddingVertical: 8,
            borderRadius: radius.sm,
            alignItems: 'center',
            backgroundColor: value === opt.value ? colors.bgCard : 'transparent',
          }}
        >
          <Text variant="caption" weight={value === opt.value ? 'bold' : 'medium'} color={value === opt.value ? 'primary' : 'tertiary'}>
            {opt.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  const { spacing } = useTheme();
  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text variant="caption" weight="semibold" color="tertiary" style={{ marginBottom: 8 }}>
        {label}
      </Text>
      {children}
    </View>
  );
}

export default function SettingsScreen() {
  const { colors, spacing, radius } = useTheme();
  const t = useT();
  const queryClient = useQueryClient();

  const themePreference = useSettingsStore((s) => s.themePreference);
  const setThemePreference = useSettingsStore((s) => s.setThemePreference);
  const language = useSettingsStore((s) => s.language);
  const setLanguage = useSettingsStore((s) => s.setLanguage);
  const displayCurrency = useSettingsStore((s) => s.displayCurrency);
  const setDisplayCurrency = useSettingsStore((s) => s.setDisplayCurrency);
  const refreshIntervalMs = useSettingsStore((s) => s.refreshIntervalMs);
  const setRefreshIntervalMs = useSettingsStore((s) => s.setRefreshIntervalMs);
  const notificationsEnabled = useSettingsStore((s) => s.notificationsEnabled);
  const setNotificationsEnabled = useSettingsStore((s) => s.setNotificationsEnabled);
  const accentPreset = useSettingsStore((s) => s.accentPreset);
  const setAccentPreset = useSettingsStore((s) => s.setAccentPreset);
  const resetOnboarding = useSettingsStore((s) => s.resetOnboarding);
  const isPremium = usePremiumStore((s) => s.isPremium);
  const portfolios = usePortfolioStore((s) => s.portfolios);

  const handleExport = async () => {
    const csv = portfoliosToCsv(portfolios);
    if (portfolios.every((p) => p.transactions.length === 0)) {
      Alert.alert(t.portfolio.emptyTitle);
      return;
    }
    try {
      await Share.share({ message: csv, title: 'BorsaTakip - Portföy Dışa Aktarımı' });
    } catch {}
  };

  const handleRefreshIntervalChange = (v: string) => {
    const ms = Number(v);
    if (!isPremium && ms < FREE_LIMITS.minRefreshIntervalMs) {
      router.push('/premium');
      return;
    }
    setRefreshIntervalMs(ms);
  };

  const handleNotificationsChange = async (value: string) => {
    const enabled = value === 'on';
    if (enabled) {
      const granted = await ensureNotificationPermission();
      setNotificationsEnabled(granted);
      if (!granted) Alert.alert('Bildirim izni gerekli', 'Fiyat alarmlarını kullanmak için cihaz ayarlarından bildirim izni verin.');
      return;
    }
    setNotificationsEnabled(false);
  };

  const clearCache = () => {
    Alert.alert(t.settings.clearCache, '', [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.common.delete,
        style: 'destructive',
        onPress: async () => {
          queryClient.clear();
          const keys = await AsyncStorage.getAllKeys();
          const cacheKeys = keys.filter((k) => k.startsWith('borsatakip-') === false);
          if (cacheKeys.length) await AsyncStorage.multiRemove(cacheKeys);
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ModalHeader title={t.settings.title} eyebrow="Kişiselleştirme" subtitle="Görünüm, veri yenileme, bildirimler ve hesap tercihleri." />
      <VisualHeaderBanner source={require('../assets/market-funds-v1.png')} eyebrow="BorsaTakip Kontrol Merkezi" title="Deneyimini kendine göre ayarla" icon="options-outline" />

      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 60 }}>
        <Pressable onPress={() => router.push('/premium')}>
          <Card padded={false} style={{ overflow: 'hidden', borderWidth: 0, marginBottom: spacing.lg }}>
            <LinearGradient
              colors={isPremium ? [colors.gold, colors.gold] : [colors.accentFrom, colors.accentTo]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}
            >
              <Ionicons name={isPremium ? 'checkmark-circle' : 'diamond'} size={22} color="#fff" />
              <View style={{ flex: 1 }}>
                <Text variant="body" weight="bold" color="inverse">
                  {isPremium ? t.premium.active : t.premium.title}
                </Text>
                <Text variant="label" style={{ color: 'rgba(255,255,255,0.85)' }}>
                  {isPremium ? t.premium.activeSubtitle : t.premium.subtitle}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#fff" />
            </LinearGradient>
          </Card>
        </Pressable>

        <Card>
          <Row label={t.settings.theme}>
            <SegmentedControl<ThemePreference>
              value={themePreference}
              onChange={setThemePreference}
              options={[
                { label: t.settings.themeSystem, value: 'system' },
                { label: t.settings.themeDark, value: 'dark' },
                { label: t.settings.themeLight, value: 'light' },
              ]}
            />
          </Row>
          <Row label={t.settings.language}>
            <SegmentedControl<Language>
              value={language}
              onChange={setLanguage}
              options={[
                { label: 'Türkçe', value: 'tr' },
                { label: 'English', value: 'en' },
              ]}
            />
          </Row>
          <Row label={t.settings.currency}>
            <SegmentedControl<DisplayCurrency>
              value={displayCurrency}
              onChange={setDisplayCurrency}
              options={[
                { label: '₺ TRY', value: 'TRY' },
                { label: '$ USD', value: 'USD' },
              ]}
            />
          </Row>
          <Row label={`${t.settings.refreshInterval}: ${refreshIntervalMs / 1000}s`}>
            <SegmentedControl<string>
              value={String(refreshIntervalMs)}
              onChange={handleRefreshIntervalChange}
              options={[
                { label: isPremium ? '5s' : '5s 🔒', value: '5000' },
                { label: '15s', value: '15000' },
                { label: '30s', value: '30000' },
                { label: '60s', value: '60000' },
              ]}
            />
          </Row>
          <Row label={t.settings.notifications}>
            <SegmentedControl<string>
              value={notificationsEnabled ? 'on' : 'off'}
              onChange={handleNotificationsChange}
              options={[
                { label: t.settings.on, value: 'on' },
                { label: t.settings.off, value: 'off' },
              ]}
            />
          </Row>
        </Card>

        <Pressable onPress={() => router.push('/calculators')} style={{ marginTop: spacing.lg }}>
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Ionicons name="calculator-outline" size={20} color={colors.accent} />
            <Text variant="body" weight="semibold" style={{ flex: 1 }}>
              {t.calculators.title}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
          </Card>
        </Pressable>

        <View style={{ marginTop: spacing.lg }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Text variant="caption" weight="semibold" color="tertiary">
              {t.settings.vipFeatures}
            </Text>
            <Ionicons name="diamond" size={12} color={colors.gold} />
          </View>
          <Card>
            <PremiumGate>
              <Row label={t.settings.accentColor}>
                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                  {(Object.keys(ACCENT_PRESETS) as AccentPreset[]).map((preset) => {
                    const selected = preset === accentPreset;
                    const swatch = ACCENT_PRESETS[preset];
                    return (
                      <Pressable
                        key={preset}
                        onPress={() => {
                          setAccentPreset(preset);
                          Haptics.selectionAsync().catch(() => {});
                        }}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 18,
                          backgroundColor: swatch.from,
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderWidth: selected ? 3 : 0,
                          borderColor: colors.textPrimary,
                        }}
                      >
                        {selected && <Ionicons name="checkmark" size={16} color="#fff" />}
                      </Pressable>
                    );
                  })}
                </View>
              </Row>
            </PremiumGate>

            <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
              <PremiumGate compact>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                  <Ionicons name="headset-outline" size={18} color={colors.textSecondary} />
                  <View style={{ flex: 1 }}>
                    <Text variant="caption" weight="semibold">
                      {t.settings.prioritySupport}
                    </Text>
                    <Text variant="label" color="tertiary">
                      {t.settings.prioritySupportDesc}
                    </Text>
                  </View>
                </View>
              </PremiumGate>

              <PremiumGate compact>
                <Pressable onPress={handleExport} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                  <Ionicons name="download-outline" size={18} color={colors.textSecondary} />
                  <Text variant="caption" weight="semibold">
                    {t.settings.exportData}
                  </Text>
                </Pressable>
              </PremiumGate>
            </View>
          </Card>
        </View>

        <View style={{ marginTop: spacing.lg }}>
          <Text variant="caption" weight="semibold" color="tertiary" style={{ marginBottom: 8 }}>
            {t.settings.dataSource}
          </Text>
          <Card>
            <DataSourceBadge />
            <Text variant="caption" color="secondary" style={{ marginTop: spacing.sm, lineHeight: 19 }}>
              {t.settings.dataSourceDisclaimer}
            </Text>
          </Card>
        </View>

        <Pressable
          onPress={() => WebBrowser.openBrowserAsync(PRIVACY_POLICY_URL).catch(() => {})}
          style={{
            marginTop: spacing.lg,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.xs,
            paddingVertical: 14,
            borderRadius: radius.md,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Ionicons name="shield-checkmark-outline" size={16} color={colors.textSecondary} />
          <Text variant="caption" weight="semibold" color="secondary">
            {t.settings.privacyPolicy}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => {
            resetOnboarding();
            router.replace('/onboarding');
          }}
          style={{
            marginTop: spacing.sm,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.xs,
            paddingVertical: 14,
            borderRadius: radius.md,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Ionicons name="sparkles-outline" size={16} color={colors.accent} />
          <Text variant="caption" weight="semibold" color="accent">
            {t.settings.replayOnboarding}
          </Text>
        </Pressable>

        <Pressable
          onPress={clearCache}
          style={{
            marginTop: spacing.sm,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.xs,
            paddingVertical: 14,
            borderRadius: radius.md,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Ionicons name="trash-outline" size={16} color={colors.negative} />
          <Text variant="caption" weight="semibold" color="negative">
            {t.settings.clearCache}
          </Text>
        </Pressable>

        <Text variant="label" color="tertiary" style={{ textAlign: 'center', marginTop: spacing.xl }}>
          {t.common.appName} · v1.0.0
        </Text>
      </ScrollView>
    </View>
  );
}
