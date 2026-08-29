import React from 'react';
import { View, ScrollView, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/theme/ThemeProvider';
import { useT } from '../src/i18n/I18nContext';
import { Text } from '../src/components/Text';
import { Card } from '../src/components/Card';
import { EmptyState } from '../src/components/EmptyState';
import { Button } from '../src/components/Button';
import { useAlertsStore } from '../src/store/useAlertsStore';
import { useQuotes } from '../src/hooks/useQuotes';
import { usePremiumStore, FREE_LIMITS } from '../src/store/usePremiumStore';
import { formatPrice, formatDate } from '../src/utils/format';
import { ModalHeader } from '../src/components/ModalHeader';
import { VisualHeaderBanner } from '../src/components/VisualHeaderBanner';

export default function AlertsScreen() {
  const { colors, spacing } = useTheme();
  const t = useT();

  const alerts = useAlertsStore((s) => s.alerts);
  const removeAlert = useAlertsStore((s) => s.removeAlert);
  const toggleActive = useAlertsStore((s) => s.toggleActive);

  const symbols = Array.from(new Set(alerts.map((a) => a.symbol)));
  const { data: quotes } = useQuotes(symbols);

  const isPremium = usePremiumStore((s) => s.isPremium);
  const canCreateAlert = isPremium || alerts.length < FREE_LIMITS.maxAlerts;

  const requestCreateAlert = () => {
    if (!canCreateAlert) {
      Alert.alert(t.premium.limitReachedAlert, t.premium.upgradeToUnlock, [
        { text: t.common.cancel, style: 'cancel' },
        { text: t.premium.title, onPress: () => router.push('/premium') },
      ]);
      return;
    }
    router.push('/create-alert');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ModalHeader title={t.alerts.title} eyebrow="Akıllı Bildirimler" subtitle={`${alerts.filter((alert) => alert.active).length} aktif alarm`} actionIcon="add" onAction={requestCreateAlert} />
      <VisualHeaderBanner source={require('../assets/onboarding-alerts-v1.png')} eyebrow="Sinyal Merkezi" title="Önemli fiyat hareketlerini yakala" icon="notifications-outline" />

      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 60 }}>
        {alerts.length === 0 ? (
          <View style={{ marginTop: spacing.xl }}>
            <EmptyState icon="notifications-outline" title={t.alerts.emptyTitle} />
            <Button label={t.alerts.createTitle} onPress={requestCreateAlert} style={{ marginTop: spacing.md }} />
          </View>
        ) : (
          <Card padded={false}>
            {alerts.map((a, i) => {
              const q = quotes?.find((x) => x.symbol === a.symbol);
              return (
                <View
                  key={a.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: spacing.md,
                    borderBottomWidth: i < alerts.length - 1 ? 1 : 0,
                    borderBottomColor: colors.borderSubtle,
                    opacity: a.active ? 1 : 0.5,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text variant="body" weight="semibold">
                      {a.symbol.replace('.IS', '')}
                    </Text>
                    <Text variant="caption" color="tertiary">
                      {a.condition === 'above' ? t.alerts.above : t.alerts.below} {formatPrice(a.targetPrice)}
                      {q?.regularMarketPrice !== undefined ? ` · şu an ${formatPrice(q.regularMarketPrice)}` : ''}
                    </Text>
                    {a.triggeredAt && (
                      <Text variant="label" color="accent" style={{ marginTop: 2 }}>
                        {t.alerts.triggered}: {formatDate(a.triggeredAt)}
                      </Text>
                    )}
                  </View>
                  <Pressable onPress={() => toggleActive(a.id)} style={{ padding: 8 }}>
                    <Ionicons name={a.active ? 'pause-circle-outline' : 'play-circle-outline'} size={22} color={colors.textSecondary} />
                  </Pressable>
                  <Pressable onPress={() => removeAlert(a.id)} style={{ padding: 8 }}>
                    <Ionicons name="trash-outline" size={20} color={colors.negative} />
                  </Pressable>
                </View>
              );
            })}
          </Card>
        )}
      </ScrollView>
    </View>
  );
}
