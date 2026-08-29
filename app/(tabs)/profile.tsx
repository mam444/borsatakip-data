import React from 'react';
import { Image, ImageBackground, Pressable, ScrollView, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useT } from '../../src/i18n/I18nContext';
import { Text } from '../../src/components/Text';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { DataSourceBadge } from '../../src/components/DataSourceBadge';
import { useWatchlistStore } from '../../src/store/useWatchlistStore';
import { usePortfolioStore } from '../../src/store/usePortfolioStore';
import { useAlertsStore } from '../../src/store/useAlertsStore';
import { usePremiumStore } from '../../src/store/usePremiumStore';

function ProfileStat({ value, label }: { value: number; label: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 3 }}>
      <Text variant="headline" weight="extrabold" style={{ color: colors.textPrimary }}>{value}</Text>
      <Text variant="label" color="tertiary" numberOfLines={1}>{label}</Text>
    </View>
  );
}

function ProfileLink({ icon, title, subtitle, onPress, accent }: { icon: keyof typeof Ionicons.glyphMap; title: string; subtitle: string; onPress: () => void; accent?: boolean }) {
  const { colors, radius, spacing } = useTheme();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderRadius: radius.lg, backgroundColor: accent ? colors.accentSoft : colors.bgCard, borderWidth: 1, borderColor: accent ? colors.accent + '3D' : colors.border, opacity: pressed ? 0.78 : 1 })}>
      <View style={{ width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: accent ? colors.accent : colors.bgCardAlt }}>
        <Ionicons name={icon} size={20} color={accent ? colors.textInverse : colors.textSecondary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="body" weight="bold">{title}</Text>
        <Text variant="label" color="tertiary" numberOfLines={1}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={17} color={colors.textTertiary} />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { colors, spacing, radius } = useTheme();
  const t = useT();
  const insets = useSafeAreaInsets();
  const lists = useWatchlistStore((state) => state.lists);
  const portfolios = usePortfolioStore((state) => state.portfolios);
  const alerts = useAlertsStore((state) => state.alerts);
  const isPremium = usePremiumStore((state) => state.isPremium);
  const symbolCount = new Set(lists.flatMap((list) => list.symbols)).size;
  const transactionCount = portfolios.reduce((sum, portfolio) => sum + portfolio.transactions.length, 0);
  const activeAlertCount = alerts.filter((alert) => alert.active).length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + spacing.sm, paddingBottom: 132 }} showsVerticalScrollIndicator={false}>
        <ScreenHeader title={t.tabs.profile} actions={[{ icon: 'settings-outline', onPress: () => router.push('/settings') }]} />

        <ImageBackground source={require('../../assets/market-world-v1.png')} resizeMode="cover" imageStyle={{ borderRadius: radius.xl }} style={{ minHeight: 268, marginHorizontal: spacing.md, borderRadius: radius.xl, overflow: 'hidden', shadowColor: '#04150F', shadowOffset: { width: 0, height: 18 }, shadowOpacity: 0.25, shadowRadius: 28, elevation: 7 }}>
          <LinearGradient colors={['rgba(3,18,13,0.08)', 'rgba(3,18,13,0.56)', 'rgba(3,18,13,0.96)']} style={{ flex: 1, minHeight: 268, padding: spacing.lg, justifyContent: 'flex-end', alignItems: 'center' }}>
            <View style={{ width: 76, height: 76, borderRadius: 25, padding: 5, backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: 'rgba(139,255,202,0.35)', marginBottom: spacing.sm }}>
              <Image source={require('../../assets/icon-premium-v1.png')} style={{ width: '100%', height: '100%', borderRadius: 20 }} />
            </View>
            <Text variant="title" weight="extrabold" style={{ color: '#FFFFFF' }}>{t.profile.investorProfile}</Text>
            <View style={{ marginTop: 7, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: isPremium ? 'rgba(245,185,77,0.18)' : 'rgba(103,241,178,0.14)', borderWidth: 1, borderColor: isPremium ? 'rgba(245,185,77,0.42)' : 'rgba(103,241,178,0.28)' }}>
              <Text variant="label" weight="bold" style={{ color: isPremium ? '#FFD681' : '#9DFFD0' }}>{isPremium ? t.profile.premiumMember : t.profile.freeMember}</Text>
            </View>
          </LinearGradient>
        </ImageBackground>

        <View style={{ marginHorizontal: spacing.md, marginTop: -1, flexDirection: 'row', paddingVertical: spacing.md, borderRadius: radius.lg, backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border }}>
          <ProfileStat value={symbolCount} label={t.profile.trackedAssets} />
          <View style={{ width: 1, backgroundColor: colors.borderSubtle }} />
          <ProfileStat value={transactionCount} label={t.profile.transactions} />
          <View style={{ width: 1, backgroundColor: colors.borderSubtle }} />
          <ProfileStat value={activeAlertCount} label={t.profile.activeAlerts} />
        </View>

        <View style={{ margin: spacing.md }}><DataSourceBadge /></View>

        <View style={{ paddingHorizontal: spacing.md, gap: spacing.sm }}>
          {!isPremium && <ProfileLink icon="diamond-outline" title={t.premium.title} subtitle={t.profile.premiumSubtitle} accent onPress={() => router.push('/premium')} />}
          <ProfileLink icon="notifications-outline" title={t.alerts.title} subtitle={t.profile.alertsSubtitle} onPress={() => router.push('/alerts')} />
          <ProfileLink icon="settings-outline" title={t.settings.title} subtitle={t.profile.settingsSubtitle} onPress={() => router.push('/settings')} />
          <ProfileLink icon="sparkles-outline" title={t.settings.replayOnboarding} subtitle={t.profile.onboardingSubtitle} onPress={() => router.push('/onboarding')} />
        </View>
      </ScrollView>
    </View>
  );
}
