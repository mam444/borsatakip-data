import React, { useState } from 'react';
import { View, ScrollView, Pressable, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { useTheme } from '../src/theme/ThemeProvider';
import { useT } from '../src/i18n/I18nContext';
import { Text } from '../src/components/Text';
import { Button } from '../src/components/Button';
import { SymbolAvatar } from '../src/components/SymbolAvatar';
import { OnboardingVisual } from '../src/components/OnboardingVisual';
import { useSettingsStore, Language, ThemePreference } from '../src/store/useSettingsStore';
import { useWatchlistStore } from '../src/store/useWatchlistStore';
import { ALL_SYMBOLS } from '../src/constants/symbols';

const STEP_COUNT = 4;

export default function OnboardingScreen() {
  const { colors, spacing, radius } = useTheme();
  const t = useT();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const width = Math.min(windowWidth, 480);

  const language = useSettingsStore((s) => s.language);
  const setLanguage = useSettingsStore((s) => s.setLanguage);
  const themePreference = useSettingsStore((s) => s.themePreference);
  const setThemePreference = useSettingsStore((s) => s.setThemePreference);
  const completeOnboarding = useSettingsStore((s) => s.completeOnboarding);
  const addSymbol = useWatchlistStore((s) => s.addSymbol);
  const activeListId = useWatchlistStore((s) => s.activeListId);

  const [selected, setSelected] = useState<Set<string>>(new Set(['THYAO.IS', 'AAPL']));
  const [step, setStep] = useState(0);
  const [pageHeight, setPageHeight] = useState(0);

  const toggleSymbol = (symbol: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(symbol) ? next.delete(symbol) : next.add(symbol);
      return next;
    });
  };

  const goTo = (index: number) => setStep(index);

  const finish = () => {
    selected.forEach((s) => addSymbol(activeListId, s));
    completeOnboarding();
    router.replace('/(tabs)');
  };

  const featureRows: { icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
    { icon: 'flash', label: t.onboarding.featureRealtime },
    { icon: 'notifications', label: t.onboarding.featureAlerts },
    { icon: 'pie-chart', label: t.onboarding.featurePortfolio },
  ];

  const intelligenceRows: { icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
    { icon: 'funnel', label: t.onboarding.featureScanner },
    { icon: 'git-compare', label: t.onboarding.featureCompare },
    { icon: 'calculator', label: t.onboarding.featureCalculators },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <LinearGradient
        colors={[colors.accentFrom + '33', colors.bg]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 260 }}
      />

      <View style={{ paddingTop: insets.top + spacing.md, paddingHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        {Array.from({ length: STEP_COUNT }).map((_, i) => (
          <View
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              backgroundColor: i <= step ? colors.accent : colors.bgCardAlt,
            }}
          />
        ))}
      </View>

      <View style={{ flex: 1, overflow: 'hidden' }} onLayout={(e) => setPageHeight(e.nativeEvent.layout.height)}>
      {pageHeight > 0 && (
      <MotiView
        animate={{ translateX: -step * width }}
        transition={{ type: 'timing', duration: 360 }}
        style={{
          flexDirection: 'row',
          width: width * STEP_COUNT,
          height: pageHeight,
        }}
      >
        {/* Step 1 — Welcome + language/theme */}
        <ScrollView
          style={{ width, height: pageHeight }}
          contentContainerStyle={{ paddingTop: spacing.xl, paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl }}
          showsVerticalScrollIndicator={false}
        >
          <OnboardingVisual
            source={require('../assets/onboarding-markets-v1.png')}
            eyebrow={t.onboarding.marketTag}
            icon="globe-outline"
            height={270}
          />

          <Text variant="display" weight="extrabold" style={{ marginTop: spacing.xl, marginBottom: spacing.xs }}>
            {t.onboarding.welcomeTitle}
          </Text>
          <Text variant="body" color="secondary" style={{ marginBottom: spacing.xl }}>
            {t.onboarding.welcomeSubtitle}
          </Text>

          <Text variant="caption" weight="semibold" color="tertiary" style={{ marginBottom: spacing.sm }}>
            {t.onboarding.chooseLanguage}
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.lg }}>
            {(['tr', 'en'] as Language[]).map((l) => (
              <Pressable
                key={l}
                onPress={() => setLanguage(l)}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: radius.md,
                  alignItems: 'center',
                  backgroundColor: language === l ? colors.accentSoft : colors.bgCard,
                  borderWidth: 1,
                  borderColor: language === l ? colors.accent : colors.border,
                }}
              >
                <Text variant="caption" weight="bold" style={{ color: language === l ? colors.accent : colors.textSecondary }}>
                  {l === 'tr' ? 'Türkçe' : 'English'}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text variant="caption" weight="semibold" color="tertiary" style={{ marginBottom: spacing.sm }}>
            {t.onboarding.chooseTheme}
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.xs }}>
            {(['dark', 'light', 'system'] as ThemePreference[]).map((th) => (
              <Pressable
                key={th}
                onPress={() => setThemePreference(th)}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: radius.md,
                  alignItems: 'center',
                  backgroundColor: themePreference === th ? colors.accentSoft : colors.bgCard,
                  borderWidth: 1,
                  borderColor: themePreference === th ? colors.accent : colors.border,
                }}
              >
                <Text variant="caption" weight="bold" style={{ color: themePreference === th ? colors.accent : colors.textSecondary }}>
                  {th === 'dark' ? t.settings.themeDark : th === 'light' ? t.settings.themeLight : t.settings.themeSystem}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {/* Step 2 — Portfolio setup + starter symbol picker */}
        <ScrollView
          style={{ width, height: pageHeight }}
          contentContainerStyle={{ paddingTop: spacing.xl, paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl }}
          showsVerticalScrollIndicator={false}
        >
          <OnboardingVisual
            source={require('../assets/onboarding-portfolio-v1.png')}
            eyebrow={t.onboarding.portfolioTag}
            icon="pie-chart-outline"
          />

          <Text variant="title" weight="extrabold" style={{ marginTop: spacing.xl, marginBottom: spacing.xs }}>
            {t.onboarding.portfolioTitle}
          </Text>
          <Text variant="body" color="secondary" style={{ marginBottom: spacing.xl }}>
            {t.onboarding.portfolioSubtitle}
          </Text>

          <Text variant="caption" weight="semibold" color="tertiary" style={{ marginBottom: spacing.sm }}>
            {t.onboarding.pickStarter}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {ALL_SYMBOLS.slice(0, 14).map((s) => {
              const active = selected.has(s.symbol);
              return (
                <Pressable
                  key={s.symbol}
                  onPress={() => toggleSymbol(s.symbol)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    paddingLeft: 6,
                    paddingRight: spacing.sm,
                    paddingVertical: 6,
                    borderRadius: 999,
                    backgroundColor: active ? colors.accent : colors.bgCard,
                    borderWidth: 1,
                    borderColor: active ? colors.accent : colors.border,
                  }}
                >
                  <SymbolAvatar symbol={s.symbol} size={22} />
                  <Text variant="caption" weight="semibold" style={{ color: active ? '#fff' : colors.textSecondary }}>
                    {s.symbol.replace('.IS', '')}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        {/* Step 3 — Alerts pitch + feature summary */}
        <ScrollView
          style={{ width, height: pageHeight }}
          contentContainerStyle={{ paddingTop: spacing.xl, paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl }}
          showsVerticalScrollIndicator={false}
        >
          <OnboardingVisual
            source={require('../assets/onboarding-alerts-v1.png')}
            eyebrow={t.onboarding.alertTag}
            icon="notifications-outline"
          />

          <Text variant="title" weight="extrabold" style={{ marginTop: spacing.xl, marginBottom: spacing.xs }}>
            {t.onboarding.step3Title}
          </Text>
          <Text variant="body" color="secondary" style={{ marginBottom: spacing.xl }}>
            {t.onboarding.step3Subtitle}
          </Text>

          <View style={{ gap: spacing.sm }}>
            {featureRows.map((f) => (
              <View
                key={f.icon}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.sm,
                  backgroundColor: colors.bgCard,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: radius.md,
                  padding: spacing.sm,
                }}
              >
                <View
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 12,
                    backgroundColor: colors.accentSoft,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name={f.icon} size={17} color={colors.accent} />
                </View>
                <Text variant="body" weight="semibold">
                  {f.label}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Step 4 — Intelligence tools + finish */}
        <ScrollView
          style={{ width, height: pageHeight }}
          contentContainerStyle={{ paddingTop: spacing.xl, paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl }}
          showsVerticalScrollIndicator={false}
        >
          <OnboardingVisual
            source={require('../assets/premium-intelligence-v1.png')}
            eyebrow={t.onboarding.intelligenceTag}
            icon="sparkles-outline"
          />

          <Text variant="title" weight="extrabold" style={{ marginTop: spacing.xl, marginBottom: spacing.xs }}>
            {t.onboarding.intelligenceTitle}
          </Text>
          <Text variant="body" color="secondary" style={{ marginBottom: spacing.xl }}>
            {t.onboarding.intelligenceSubtitle}
          </Text>

          <View style={{ flexDirection: 'row', gap: spacing.xs }}>
            {intelligenceRows.map((feature) => (
              <View
                key={feature.icon}
                style={{
                  flex: 1,
                  minHeight: 104,
                  padding: spacing.sm,
                  borderRadius: radius.md,
                  backgroundColor: colors.bgCard,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <View style={{ width: 34, height: 34, borderRadius: 12, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                  <Ionicons name={feature.icon} size={17} color={colors.accent} />
                </View>
                <Text variant="label" weight="bold" style={{ lineHeight: 16 }}>
                  {feature.label}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </MotiView>
      )}
      </View>

      <View style={{ paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + spacing.md, paddingTop: spacing.sm, flexDirection: 'row', gap: spacing.sm }}>
        {step > 0 && (
          <Button label={t.onboarding.back} variant="secondary" onPress={() => goTo(step - 1)} style={{ flex: 1 }} />
        )}
        <Button
          label={step === STEP_COUNT - 1 ? t.onboarding.getStarted : t.onboarding.next}
          onPress={() => (step === STEP_COUNT - 1 ? finish() : goTo(step + 1))}
          style={{ flex: 2 }}
        />
      </View>
      {step < STEP_COUNT - 1 && (
        <Pressable onPress={finish} style={{ marginBottom: insets.bottom + spacing.sm, alignItems: 'center' }}>
          <Text variant="caption" color="tertiary">
            {t.onboarding.skip}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
