import React, { useState } from 'react';
import { View, ScrollView, TextInput, Pressable, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../src/theme/ThemeProvider';
import { useT } from '../src/i18n/I18nContext';
import { Text } from '../src/components/Text';
import { Button } from '../src/components/Button';
import { usePortfolioStore } from '../src/store/usePortfolioStore';
import { TransactionType } from '../src/store/usePortfolioStore';
import { useSettingsStore } from '../src/store/useSettingsStore';
import { ModalHeader } from '../src/components/ModalHeader';
import { VisualHeaderBanner } from '../src/components/VisualHeaderBanner';
import { Card } from '../src/components/Card';

function FieldLabel({ children }: { children: string }) {
  const { spacing } = useTheme();
  return (
    <Text variant="label" weight="semibold" color="tertiary" style={{ marginBottom: 6, marginTop: spacing.sm }}>
      {children}
    </Text>
  );
}

export default function AddTransactionScreen() {
  const { symbol: prefillSymbol } = useLocalSearchParams<{ symbol?: string }>();
  const { colors, spacing, radius } = useTheme();
  const t = useT();
  const language = useSettingsStore((s) => s.language);

  const portfolios = usePortfolioStore((s) => s.portfolios);
  const activePortfolioId = usePortfolioStore((s) => s.activePortfolioId);
  const addTransaction = usePortfolioStore((s) => s.addTransaction);

  const [portfolioId, setPortfolioId] = useState(activePortfolioId);
  const [symbol, setSymbol] = useState(prefillSymbol ?? '');
  const [type, setType] = useState<TransactionType>('buy');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [fees, setFees] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const canSave = symbol.trim().length > 0 && Number(quantity) > 0 && Number(price) > 0;

  const handleSave = () => {
    if (!canSave) return;
    addTransaction(portfolioId, {
      symbol: symbol.trim().toUpperCase(),
      type,
      quantity: Number(quantity),
      price: Number(price),
      fees: Number(fees) || 0,
      date: date.toISOString(),
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    router.back();
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
      <ModalHeader title={t.portfolio.addTransactionTitle} eyebrow="Portföy" subtitle="Gerçekleşen alış veya satışını portföyüne kaydet." />
      <VisualHeaderBanner source={require('../assets/onboarding-portfolio-v1.png')} eyebrow="Portföy Hareketi" title="Yatırım geçmişini canlı tut" icon="swap-horizontal-outline" />

      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
          <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: type === 'buy' ? colors.positiveSoft : colors.negativeSoft, alignItems: 'center', justifyContent: 'center' }}><Ionicons name={type === 'buy' ? 'arrow-down' : 'arrow-up'} size={20} color={type === 'buy' ? colors.positive : colors.negative} /></View>
          <View><Text variant="body" weight="extrabold">{type === 'buy' ? t.portfolio.buy : t.portfolio.sell}</Text><Text variant="label" color="tertiary">Maliyet ve kâr/zarar otomatik hesaplanır.</Text></View>
        </Card>
        {portfolios.length > 1 && (
          <>
            <FieldLabel>{t.portfolio.portfolioLabel}</FieldLabel>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.xs }}>
              {portfolios.map((p) => (
                <Pressable
                  key={p.id}
                  onPress={() => setPortfolioId(p.id)}
                  style={{
                    paddingHorizontal: spacing.md,
                    paddingVertical: 8,
                    borderRadius: 999,
                    backgroundColor: portfolioId === p.id ? colors.accent : colors.bgCard,
                    borderWidth: 1,
                    borderColor: portfolioId === p.id ? colors.accent : colors.border,
                  }}
                >
                  <Text variant="caption" weight="semibold" style={{ color: portfolioId === p.id ? '#fff' : colors.textSecondary }}>
                    {p.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </>
        )}

        <FieldLabel>{t.portfolio.symbolLabel}</FieldLabel>
        <TextInput
          value={symbol}
          onChangeText={setSymbol}
          placeholder={t.portfolio.symbolPlaceholder}
          placeholderTextColor={colors.textTertiary}
          autoCapitalize="characters"
          autoCorrect={false}
          style={inputStyle}
        />

        <FieldLabel>{t.portfolio.transactionType}</FieldLabel>
        <View style={{ flexDirection: 'row', gap: spacing.xs }}>
          {(['buy', 'sell'] as TransactionType[]).map((tp) => (
            <Pressable
              key={tp}
              onPress={() => setType(tp)}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: radius.md,
                alignItems: 'center',
                backgroundColor: type === tp ? (tp === 'buy' ? colors.positiveSoft : colors.negativeSoft) : colors.bgCard,
                borderWidth: 1,
                borderColor: type === tp ? (tp === 'buy' ? colors.positive : colors.negative) : colors.border,
              }}
            >
              <Text variant="caption" weight="bold" style={{ color: type === tp ? (tp === 'buy' ? colors.positive : colors.negative) : colors.textSecondary }}>
                {tp === 'buy' ? t.portfolio.buy : t.portfolio.sell}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <View style={{ flex: 1 }}>
            <FieldLabel>{t.portfolio.quantity}</FieldLabel>
            <TextInput value={quantity} onChangeText={setQuantity} keyboardType="decimal-pad" placeholder="0" placeholderTextColor={colors.textTertiary} style={inputStyle} />
          </View>
          <View style={{ flex: 1 }}>
            <FieldLabel>{t.portfolio.price}</FieldLabel>
            <TextInput value={price} onChangeText={setPrice} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor={colors.textTertiary} style={inputStyle} />
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <View style={{ flex: 1 }}>
            <FieldLabel>{t.portfolio.fees}</FieldLabel>
            <TextInput value={fees} onChangeText={setFees} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor={colors.textTertiary} style={inputStyle} />
          </View>
          <View style={{ flex: 1 }}>
            <FieldLabel>{t.portfolio.date}</FieldLabel>
            <Pressable onPress={() => setShowDatePicker(true)} style={inputStyle}>
              <Text variant="body">{date.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US')}</Text>
            </Pressable>
          </View>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            maximumDate={new Date()}
            onChange={(_, selected) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (selected) setDate(selected);
            }}
          />
        )}

        <Button label={t.common.save} onPress={handleSave} disabled={!canSave} style={{ marginTop: spacing.xl }} />
      </ScrollView>
    </View>
  );
}
