import React, { useState } from 'react';
import { View, ScrollView, Pressable, Alert, ImageBackground } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../src/theme/ThemeProvider';
import { useT } from '../src/i18n/I18nContext';
import { Text } from '../src/components/Text';
import { Card } from '../src/components/Card';
import { Button } from '../src/components/Button';
import { usePremiumStore } from '../src/store/usePremiumStore';
import { usePremiumPurchase, PlanId } from '../src/hooks/usePremiumPurchase';
import { PRIVACY_POLICY_URL } from '../src/constants/links';
import * as WebBrowser from 'expo-web-browser';

const FEATURE_KEYS = [
  'featureWatchlists',
  'featurePortfolios',
  'featureAlerts',
  'featureRefresh',
  'featureStats',
  'featureNotif',
  'featureAdFree',
  'featureBadge',
] as const;

const PLANS: PlanId[] = ['weekly', 'monthly', 'lifetime'];

export default function PremiumScreen() {
  const { colors, spacing, radius } = useTheme();
  const t = useT();
  const insets = useSafeAreaInsets();

  const isPremium = usePremiumStore((s) => s.isPremium);
  const { connected, planDisplayPrice, purchase, restore, error } = usePremiumPurchase();
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('lifetime');
  const [busy, setBusy] = useState(false);

  const handlePurchase = async () => {
    setBusy(true);
    try {
      await purchase(selectedPlan);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch {
      Alert.alert(t.premium.unavailable, t.premium.unavailableSubtitle);
    } finally {
      setBusy(false);
    }
  };

  const handleRestore = async () => {
    setBusy(true);
    try {
      await restore();
    } catch {
      Alert.alert(t.premium.unavailable, t.premium.unavailableSubtitle);
    } finally {
      setBusy(false);
    }
  };

  const planLabel = (p: PlanId) => (p === 'weekly' ? t.premium.planWeekly : p === 'monthly' ? t.premium.planMonthly : t.premium.planLifetime);
  const planSuffix = (p: PlanId) => (p === 'weekly' ? t.premium.perWeek : p === 'monthly' ? t.premium.perMonth : t.premium.oneTime);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <LinearGradient
        colors={[colors.gold + '33', colors.bg]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 280 }}
      />
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + spacing.sm, padding: spacing.md, paddingBottom: 60 }}>
        <Pressable onPress={() => router.back()} style={{ padding: 8, marginLeft: -8, alignSelf: 'flex-start' }}>
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </Pressable>

        <ImageBackground
          source={require('../assets/premium-intelligence-v1.png')}
          resizeMode="cover"
          imageStyle={{ borderRadius: radius.xl }}
          style={{ minHeight: 285, borderRadius: radius.xl, overflow: 'hidden', marginTop: spacing.sm, marginBottom: spacing.xl, shadowColor: '#071712', shadowOffset: { width: 0, height: 18 }, shadowOpacity: 0.28, shadowRadius: 28 }}
        >
          <LinearGradient colors={['rgba(3,16,12,0.08)', 'rgba(3,16,12,0.52)', 'rgba(3,16,12,0.98)']} style={{ flex: 1, minHeight: 285, padding: spacing.lg, justifyContent: 'flex-end' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 7 }}>
              <View style={{ width: 28, height: 28, borderRadius: 10, backgroundColor: '#67F1B2', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="diamond" size={15} color="#082118" />
              </View>
              <Text style={{ color: '#AEE7CB', fontSize: 10, letterSpacing: 1 }} weight="extrabold">PREMIUM INTELLIGENCE</Text>
            </View>
            <Text variant="title" weight="extrabold" style={{ color: '#FFFFFF', letterSpacing: -0.8 }}>{t.premium.title}</Text>
            <Text variant="caption" style={{ color: '#AABBB5', marginTop: 5, lineHeight: 19 }}>{t.premium.subtitle}</Text>
          </LinearGradient>
        </ImageBackground>

        {isPremium ? (
          <Card style={{ alignItems: 'center', gap: spacing.xs, borderColor: colors.gold, backgroundColor: colors.gold + '14' }}>
            <Ionicons name="checkmark-circle" size={32} color={colors.gold} />
            <Text variant="headline" weight="bold">
              {t.premium.active}
            </Text>
            <Text variant="caption" color="secondary">
              {t.premium.activeSubtitle}
            </Text>
          </Card>
        ) : (
          <>
            <Card padded={false}>
              {FEATURE_KEYS.map((key, i) => (
                <View
                  key={key}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.sm,
                    padding: spacing.md,
                    borderBottomWidth: i < FEATURE_KEYS.length - 1 ? 1 : 0,
                    borderBottomColor: colors.borderSubtle,
                  }}
                >
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: colors.gold + '22',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons name="checkmark" size={16} color={colors.gold} />
                  </View>
                  <Text variant="body" weight="medium" style={{ flex: 1 }}>
                    {t.premium[key]}
                  </Text>
                </View>
              ))}
            </Card>

            <View style={{ marginTop: spacing.xl, flexDirection: 'row', gap: spacing.sm }}>
              {PLANS.map((plan) => {
                const selected = plan === selectedPlan;
                return (
                  <Pressable
                    key={plan}
                    onPress={() => {
                      setSelectedPlan(plan);
                      Haptics.selectionAsync().catch(() => {});
                    }}
                    style={{
                      flex: 1,
                      borderRadius: radius.md,
                      borderWidth: selected ? 2 : 1,
                      borderColor: selected ? colors.gold : colors.border,
                      backgroundColor: selected ? colors.gold + '14' : colors.bgCard,
                      padding: spacing.sm,
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    {plan === 'lifetime' && (
                      <View
                        style={{
                          position: 'absolute',
                          top: -10,
                          backgroundColor: colors.gold,
                          borderRadius: 999,
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                        }}
                      >
                        <Text variant="label" weight="bold" style={{ color: '#fff', fontSize: 9 }}>
                          {t.premium.bestValue}
                        </Text>
                      </View>
                    )}
                    <Text variant="caption" weight="semibold" color={selected ? 'primary' : 'secondary'} style={{ marginTop: plan === 'lifetime' ? 6 : 0 }}>
                      {planLabel(plan)}
                    </Text>
                    <Text variant="body" weight="extrabold" style={{ color: selected ? colors.gold : colors.textPrimary }}>
                      {planDisplayPrice(plan)}
                    </Text>
                    <Text variant="label" color="tertiary">
                      {planSuffix(plan)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={{ marginTop: spacing.xl }}>
              <Button label={t.premium.ctaPurchase} onPress={handlePurchase} disabled={busy} />

              <Pressable onPress={handleRestore} disabled={busy} style={{ marginTop: spacing.md, alignItems: 'center' }}>
                <Text variant="caption" weight="semibold" color="accent">
                  {t.premium.ctaRestore}
                </Text>
              </Pressable>

              <Text variant="label" color="tertiary" style={{ marginTop: spacing.lg, textAlign: 'center', lineHeight: 17 }}>
                {selectedPlan === 'lifetime' ? t.premium.termsLifetime : t.premium.termsRecurring}
                {'  '}
                <Text
                  variant="label"
                  weight="semibold"
                  color="accent"
                  onPress={() => WebBrowser.openBrowserAsync(PRIVACY_POLICY_URL).catch(() => {})}
                >
                  {t.premium.termsPrivacyLink}
                </Text>
              </Text>

              {!connected && (
                <View
                  style={{
                    marginTop: spacing.lg,
                    flexDirection: 'row',
                    gap: spacing.sm,
                    padding: spacing.md,
                    borderRadius: radius.md,
                    backgroundColor: colors.bgCardAlt,
                  }}
                >
                  <Ionicons name="information-circle-outline" size={18} color={colors.textTertiary} />
                  <Text variant="label" color="tertiary" style={{ flex: 1 }}>
                    {t.premium.unavailableSubtitle}
                  </Text>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
