import React, { useState } from 'react';
import { View, TextInput, Pressable, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../src/theme/ThemeProvider';
import { useT } from '../src/i18n/I18nContext';
import { Text } from '../src/components/Text';
import { Button } from '../src/components/Button';
import { useAlertsStore, AlertCondition } from '../src/store/useAlertsStore';
import { useQuote } from '../src/hooks/useQuotes';
import { ensureNotificationPermission } from '../src/services/alerts';
import { useTaskCompleteInterstitial } from '../src/hooks/useTaskCompleteInterstitial';
import { formatPrice } from '../src/utils/format';
import { ModalHeader } from '../src/components/ModalHeader';
import { Card } from '../src/components/Card';
import { VisualHeaderBanner } from '../src/components/VisualHeaderBanner';

export default function CreateAlertScreen() {
  const { symbol: prefillSymbol } = useLocalSearchParams<{ symbol?: string }>();
  const { colors, spacing, radius } = useTheme();
  const t = useT();

  const [symbol, setSymbol] = useState(prefillSymbol ?? '');
  const [condition, setCondition] = useState<AlertCondition>('above');
  const [targetPrice, setTargetPrice] = useState('');

  const { data: quote } = useQuote(symbol || undefined);
  const addAlert = useAlertsStore((s) => s.addAlert);
  const { showIfReady } = useTaskCompleteInterstitial();

  const canSave = symbol.trim().length > 0 && Number(targetPrice) > 0;

  const handleSave = async () => {
    if (!canSave) return;
    const notificationsGranted = await ensureNotificationPermission();
    addAlert({ symbol: symbol.trim().toUpperCase(), condition, targetPrice: Number(targetPrice) });
    if (!notificationsGranted) {
      Alert.alert('Bildirim izni kapalı', 'Alarm kaydedildi. Bildirim almak için Ayarlar bölümünden izinleri açın.');
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    router.back();
    showIfReady();
  };

  const inputStyle = {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 12,
    color: colors.textPrimary,
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ModalHeader title={t.alerts.createTitle} eyebrow="Fiyat Takibi" subtitle="Hedef seviyeye ulaşıldığında anında bildirim al." />
      <VisualHeaderBanner source={require('../assets/onboarding-alerts-v1.png')} eyebrow="Akıllı Alarm" title="Hedefine yaklaşan fiyatı izle" icon="notifications-outline" />

      <View style={{ padding: spacing.md }}>
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.accentSoft, borderColor: colors.accent + '33', marginBottom: spacing.sm }}>
          <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: '#081713', alignItems: 'center', justifyContent: 'center' }}><Ionicons name="notifications" size={19} color="#67F1B2" /></View>
          <View style={{ flex: 1 }}><Text variant="body" weight="extrabold">Akıllı fiyat alarmı</Text><Text variant="label" color="tertiary">Aktif alarmlar arka planda izlenir.</Text></View>
        </Card>
        <Text variant="label" weight="semibold" color="tertiary" style={{ marginBottom: 6 }}>
          {t.portfolio.symbolLabel}
        </Text>
        <TextInput
          value={symbol}
          onChangeText={setSymbol}
          placeholder={t.portfolio.symbolPlaceholder}
          placeholderTextColor={colors.textTertiary}
          autoCapitalize="characters"
          autoCorrect={false}
          style={inputStyle}
        />
        {quote?.regularMarketPrice !== undefined && (
          <Text variant="caption" color="tertiary" style={{ marginTop: 6 }}>
            {t.alerts.currentPrice}: {formatPrice(quote.regularMarketPrice)}
          </Text>
        )}

        <Text variant="label" weight="semibold" color="tertiary" style={{ marginBottom: 6, marginTop: spacing.md }}>
          {t.alerts.condition}
        </Text>
        <View style={{ flexDirection: 'row', gap: spacing.xs }}>
          {(['above', 'below'] as AlertCondition[]).map((c) => (
            <Pressable
              key={c}
              onPress={() => setCondition(c)}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: radius.md,
                alignItems: 'center',
                backgroundColor: condition === c ? colors.accentSoft : colors.bgCard,
                borderWidth: 1,
                borderColor: condition === c ? colors.accent : colors.border,
              }}
            >
              <Text variant="caption" weight="bold" style={{ color: condition === c ? colors.accent : colors.textSecondary }}>
                {c === 'above' ? t.alerts.above : t.alerts.below}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text variant="label" weight="semibold" color="tertiary" style={{ marginBottom: 6, marginTop: spacing.md }}>
          {t.alerts.targetPrice}
        </Text>
        <TextInput
          value={targetPrice}
          onChangeText={setTargetPrice}
          keyboardType="decimal-pad"
          placeholder="0.00"
          placeholderTextColor={colors.textTertiary}
          style={inputStyle}
        />

        <Button label={t.common.save} onPress={handleSave} disabled={!canSave} style={{ marginTop: spacing.xl }} />
      </View>
    </View>
  );
}
