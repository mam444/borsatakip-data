import React, { useMemo, useState } from 'react';
import { View, ScrollView, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../src/theme/ThemeProvider';
import { useT } from '../src/i18n/I18nContext';
import { Text } from '../src/components/Text';
import { Card } from '../src/components/Card';
import { useSettingsStore } from '../src/store/useSettingsStore';
import { currencySymbol } from '../src/utils/currency';
import { formatPrice, formatPercent } from '../src/utils/format';
import { useQuotes } from '../src/hooks/useQuotes';
import { ModalHeader } from '../src/components/ModalHeader';
import { VisualHeaderBanner } from '../src/components/VisualHeaderBanner';

type Tab = 'profitLoss' | 'growth' | 'avgCost' | 'converter';

function num(s: string): number {
  const n = Number(s.replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

function useInputStyle() {
  const { colors, radius, spacing } = useTheme();
  return {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 12,
    color: colors.textPrimary,
  };
}

function FieldLabel({ children }: { children: string }) {
  const { spacing } = useTheme();
  return (
    <Text variant="label" weight="semibold" color="tertiary" style={{ marginBottom: 6, marginTop: spacing.sm }}>
      {children}
    </Text>
  );
}

function ResultRow({
  label,
  value,
  valueColor = 'primary',
  emphasis,
}: {
  label: string;
  value: string;
  valueColor?: 'primary' | 'positive' | 'negative';
  emphasis?: boolean;
}) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 }}>
      <Text variant="caption" color="secondary">
        {label}
      </Text>
      <Text variant={emphasis ? 'headline' : 'body'} weight="bold" color={valueColor}>
        {value}
      </Text>
    </View>
  );
}

function TabSwitcher({ value, onChange, tabs }: { value: Tab; onChange: (t: Tab) => void; tabs: { value: Tab; label: string }[] }) {
  const { colors, radius } = useTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ backgroundColor: colors.bgCardAlt, borderRadius: radius.md }}
      contentContainerStyle={{ padding: 3, gap: 3 }}
    >
      {tabs.map((tab) => (
        <Pressable
          key={tab.value}
          onPress={() => {
            onChange(tab.value);
            Haptics.selectionAsync().catch(() => {});
          }}
          style={{
            paddingVertical: 10,
            paddingHorizontal: 14,
            borderRadius: radius.sm,
            alignItems: 'center',
            backgroundColor: value === tab.value ? colors.bgCard : 'transparent',
          }}
        >
          <Text variant="caption" weight={value === tab.value ? 'bold' : 'medium'} color={value === tab.value ? 'primary' : 'tertiary'}>
            {tab.label}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

function ProfitLossCalculator() {
  const { colors, spacing } = useTheme();
  const t = useT();
  const inputStyle = useInputStyle();
  const displayCurrency = useSettingsStore((s) => s.displayCurrency);
  const currSymbol = currencySymbol(displayCurrency);

  const [buyPrice, setBuyPrice] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [feePercent, setFeePercent] = useState('');

  const { totalCost, totalRevenue, profit, profitPercent } = useMemo(() => {
    const bp = num(buyPrice);
    const sp = num(sellPrice);
    const qty = num(quantity);
    const fee = num(feePercent);
    const totalCost = bp * qty * (1 + fee / 100);
    const totalRevenue = sp * qty * (1 - fee / 100);
    const profit = totalRevenue - totalCost;
    const profitPercent = totalCost > 0 ? (profit / totalCost) * 100 : 0;
    return { totalCost, totalRevenue, profit, profitPercent };
  }, [buyPrice, sellPrice, quantity, feePercent]);

  const hasInput = num(buyPrice) > 0 && num(quantity) > 0;

  return (
    <>
      <FieldLabel>{t.calculators.buyPrice}</FieldLabel>
      <TextInput value={buyPrice} onChangeText={setBuyPrice} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor={inputStyle.color + '80'} style={inputStyle} />

      <FieldLabel>{t.calculators.sellPrice}</FieldLabel>
      <TextInput value={sellPrice} onChangeText={setSellPrice} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor={inputStyle.color + '80'} style={inputStyle} />

      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <View style={{ flex: 1 }}>
          <FieldLabel>{t.calculators.quantity}</FieldLabel>
          <TextInput value={quantity} onChangeText={setQuantity} keyboardType="decimal-pad" placeholder="0" placeholderTextColor={inputStyle.color + '80'} style={inputStyle} />
        </View>
        <View style={{ flex: 1 }}>
          <FieldLabel>{t.calculators.feePercent}</FieldLabel>
          <TextInput value={feePercent} onChangeText={setFeePercent} keyboardType="decimal-pad" placeholder="0" placeholderTextColor={inputStyle.color + '80'} style={inputStyle} />
        </View>
      </View>

      <Card style={{ marginTop: spacing.lg }}>
        <ResultRow label={t.calculators.totalCost} value={formatPrice(totalCost, currSymbol)} />
        <ResultRow label={t.calculators.totalRevenue} value={formatPrice(totalRevenue, currSymbol)} />
        <View style={{ height: 1, backgroundColor: colors.borderSubtle, marginVertical: spacing.xs }} />
        <ResultRow
          label={profit >= 0 ? t.calculators.profit : t.calculators.loss}
          value={`${formatPrice(profit, currSymbol)} (${formatPercent(profitPercent)})`}
          valueColor={hasInput ? (profit >= 0 ? 'positive' : 'negative') : 'primary'}
          emphasis
        />
      </Card>
    </>
  );
}

function GrowthCalculator() {
  const { colors, spacing } = useTheme();
  const t = useT();
  const inputStyle = useInputStyle();
  const displayCurrency = useSettingsStore((s) => s.displayCurrency);
  const currSymbol = currencySymbol(displayCurrency);

  const [initialAmount, setInitialAmount] = useState('');
  const [monthlyContribution, setMonthlyContribution] = useState('');
  const [annualReturn, setAnnualReturn] = useState('10');
  const [years, setYears] = useState('10');

  const { futureValue, totalContributed, totalGain } = useMemo(() => {
    const P = num(initialAmount);
    const M = num(monthlyContribution);
    const annualRate = num(annualReturn);
    const n = Math.max(0, Math.round(num(years) * 12));
    const r = annualRate / 100 / 12;

    const fvPrincipal = P * Math.pow(1 + r, n);
    const fvContrib = r > 0 ? M * ((Math.pow(1 + r, n) - 1) / r) : M * n;
    const futureValue = fvPrincipal + fvContrib;
    const totalContributed = P + M * n;
    const totalGain = futureValue - totalContributed;
    return { futureValue, totalContributed, totalGain };
  }, [initialAmount, monthlyContribution, annualReturn, years]);

  return (
    <>
      <FieldLabel>{t.calculators.initialAmount}</FieldLabel>
      <TextInput value={initialAmount} onChangeText={setInitialAmount} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor={inputStyle.color + '80'} style={inputStyle} />

      <FieldLabel>{t.calculators.monthlyContribution}</FieldLabel>
      <TextInput value={monthlyContribution} onChangeText={setMonthlyContribution} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor={inputStyle.color + '80'} style={inputStyle} />

      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <View style={{ flex: 1 }}>
          <FieldLabel>{t.calculators.annualReturn}</FieldLabel>
          <TextInput value={annualReturn} onChangeText={setAnnualReturn} keyboardType="decimal-pad" placeholder="10" placeholderTextColor={inputStyle.color + '80'} style={inputStyle} />
        </View>
        <View style={{ flex: 1 }}>
          <FieldLabel>{t.calculators.years}</FieldLabel>
          <TextInput value={years} onChangeText={setYears} keyboardType="decimal-pad" placeholder="10" placeholderTextColor={inputStyle.color + '80'} style={inputStyle} />
        </View>
      </View>

      <Card style={{ marginTop: spacing.lg }}>
        <ResultRow label={t.calculators.totalContributed} value={formatPrice(totalContributed, currSymbol)} />
        <ResultRow label={t.calculators.totalGain} value={formatPrice(totalGain, currSymbol)} valueColor={totalGain >= 0 ? 'positive' : 'negative'} />
        <View style={{ height: 1, backgroundColor: colors.borderSubtle, marginVertical: spacing.xs }} />
        <ResultRow label={t.calculators.futureValue} value={formatPrice(futureValue, currSymbol)} emphasis />
      </Card>
    </>
  );
}

type Lot = { id: string; qty: string; price: string };

function AvgCostCalculator() {
  const { colors, spacing, radius } = useTheme();
  const t = useT();
  const inputStyle = useInputStyle();
  const displayCurrency = useSettingsStore((s) => s.displayCurrency);
  const currSymbol = currencySymbol(displayCurrency);

  const [lots, setLots] = useState<Lot[]>([
    { id: '1', qty: '', price: '' },
    { id: '2', qty: '', price: '' },
  ]);

  const addLot = () => {
    setLots((prev) => [...prev, { id: String(Date.now()), qty: '', price: '' }]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  const removeLot = (id: string) => {
    setLots((prev) => prev.filter((l) => l.id !== id));
  };

  const updateLot = (id: string, field: 'qty' | 'price', value: string) => {
    setLots((prev) => prev.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  };

  const { totalQty, totalCost, avgCost } = useMemo(() => {
    let totalQty = 0;
    let totalCost = 0;
    for (const lot of lots) {
      const q = num(lot.qty);
      const p = num(lot.price);
      totalQty += q;
      totalCost += q * p;
    }
    const avgCost = totalQty > 0 ? totalCost / totalQty : 0;
    return { totalQty, totalCost, avgCost };
  }, [lots]);

  return (
    <>
      {lots.map((lot, i) => (
        <View key={lot.id} style={{ flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm, marginTop: spacing.sm }}>
          <View style={{ flex: 1 }}>
            <FieldLabel>{`${t.calculators.lot} ${i + 1} · ${t.calculators.quantity}`}</FieldLabel>
            <TextInput
              value={lot.qty}
              onChangeText={(v) => updateLot(lot.id, 'qty', v)}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={inputStyle.color + '80'}
              style={inputStyle}
            />
          </View>
          <View style={{ flex: 1 }}>
            <FieldLabel>{t.calculators.buyPrice}</FieldLabel>
            <TextInput
              value={lot.price}
              onChangeText={(v) => updateLot(lot.id, 'price', v)}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={inputStyle.color + '80'}
              style={inputStyle}
            />
          </View>
          {lots.length > 1 && (
            <Pressable onPress={() => removeLot(lot.id)} style={{ paddingBottom: 12 }} hitSlop={8}>
              <Ionicons name="close-circle" size={22} color={colors.textTertiary} />
            </Pressable>
          )}
        </View>
      ))}

      <Pressable
        onPress={addLot}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          marginTop: spacing.md,
          paddingVertical: 12,
          borderRadius: radius.md,
          borderWidth: 1,
          borderColor: colors.border,
          borderStyle: 'dashed',
        }}
      >
        <Ionicons name="add" size={16} color={colors.accent} />
        <Text variant="caption" weight="semibold" color="accent">
          {t.calculators.addLot}
        </Text>
      </Pressable>

      <Card style={{ marginTop: spacing.lg }}>
        <ResultRow label={t.calculators.totalShares} value={totalQty.toLocaleString('tr-TR')} />
        <ResultRow label={t.calculators.totalInvested} value={formatPrice(totalCost, currSymbol)} />
        <View style={{ height: 1, backgroundColor: colors.borderSubtle, marginVertical: spacing.xs }} />
        <ResultRow label={t.calculators.avgCostResult} value={formatPrice(avgCost, currSymbol)} emphasis />
      </Card>
    </>
  );
}

const CONVERTER_CURRENCIES = ['TRY', 'USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD'] as const;
type ConverterCurrency = (typeof CONVERTER_CURRENCIES)[number];
const CURRENCY_TO_TRY_SYMBOL: Partial<Record<ConverterCurrency, string>> = {
  USD: 'USDTRY=X',
  EUR: 'EURTRY=X',
  GBP: 'GBPTRY=X',
  JPY: 'JPYTRY=X',
  CHF: 'CHFTRY=X',
  CAD: 'CADTRY=X',
  AUD: 'AUDTRY=X',
};

function CurrencyPicker({
  value,
  onChange,
}: {
  value: ConverterCurrency;
  onChange: (c: ConverterCurrency) => void;
}) {
  const { colors, radius } = useTheme();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
      {CONVERTER_CURRENCIES.map((c) => (
        <Pressable
          key={c}
          onPress={() => {
            onChange(c);
            Haptics.selectionAsync().catch(() => {});
          }}
          style={{
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: radius.sm,
            backgroundColor: value === c ? colors.accent : colors.bgCard,
            borderWidth: 1,
            borderColor: value === c ? colors.accent : colors.border,
          }}
        >
          <Text variant="caption" weight="bold" style={{ color: value === c ? '#fff' : colors.textSecondary }}>
            {c}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

function CurrencyConverter() {
  const { colors, spacing } = useTheme();
  const t = useT();
  const inputStyle = useInputStyle();

  const [amount, setAmount] = useState('100');
  const [from, setFrom] = useState<ConverterCurrency>('USD');
  const [to, setTo] = useState<ConverterCurrency>('TRY');

  const fxSymbols = useMemo(() => Object.values(CURRENCY_TO_TRY_SYMBOL), []);
  const { data: quotes, isLoading } = useQuotes(fxSymbols);

  const rateToTRY = (code: ConverterCurrency): number | undefined => {
    if (code === 'TRY') return 1;
    const sym = CURRENCY_TO_TRY_SYMBOL[code];
    return quotes?.find((q) => q.symbol === sym)?.regularMarketPrice;
  };

  const { result, rate } = useMemo(() => {
    const fromRate = rateToTRY(from);
    const toRate = rateToTRY(to);
    if (fromRate === undefined || toRate === undefined) return { result: undefined, rate: undefined };
    const amountTRY = num(amount) * fromRate;
    return { result: amountTRY / toRate, rate: fromRate / toRate };
  }, [amount, from, to, quotes]);

  const swap = () => {
    setFrom(to);
    setTo(from);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  return (
    <>
      <FieldLabel>{t.calculators.amount}</FieldLabel>
      <TextInput value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="0" placeholderTextColor={inputStyle.color + '80'} style={inputStyle} />

      <FieldLabel>{t.calculators.fromCurrency}</FieldLabel>
      <CurrencyPicker value={from} onChange={setFrom} />

      <Pressable onPress={swap} style={{ alignSelf: 'center', marginVertical: spacing.xs, padding: 6 }} hitSlop={10}>
        <Ionicons name="swap-vertical" size={20} color={colors.accent} />
      </Pressable>

      <FieldLabel>{t.calculators.toCurrency}</FieldLabel>
      <CurrencyPicker value={to} onChange={setTo} />

      <Card style={{ marginTop: spacing.lg }}>
        {isLoading && result === undefined ? (
          <Text variant="caption" color="tertiary">
            {t.common.loading}
          </Text>
        ) : result === undefined ? (
          <Text variant="caption" color="negative">
            {t.calculators.converterUnavailable}
          </Text>
        ) : (
          <>
            <ResultRow label={`1 ${from} = ${to}`} value={rate !== undefined ? rate.toFixed(4) : '—'} />
            <View style={{ height: 1, backgroundColor: colors.borderSubtle, marginVertical: spacing.xs }} />
            <ResultRow label={`${amount || '0'} ${from}`} value={`${result.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${to}`} emphasis />
          </>
        )}
      </Card>
    </>
  );
}

export default function CalculatorsScreen() {
  const { colors, spacing } = useTheme();
  const t = useT();
  const [tab, setTab] = useState<Tab>('profitLoss');

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ModalHeader title={t.calculators.title} eyebrow="Yatırım Araçları" subtitle="Kâr, büyüme, maliyet ve canlı kur hesaplamaları." />
      <VisualHeaderBanner source={require('../assets/market-funds-v1.png')} eyebrow="Finansal Araçlar" title="Planını rakamlarla netleştir" icon="calculator-outline" />

      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
        <TabSwitcher
          value={tab}
          onChange={setTab}
          tabs={[
            { value: 'profitLoss', label: t.calculators.profitLoss },
            { value: 'growth', label: t.calculators.growth },
            { value: 'avgCost', label: t.calculators.avgCost },
            { value: 'converter', label: t.calculators.converter },
          ]}
        />

        <View style={{ marginTop: spacing.md }}>
          {tab === 'profitLoss' && <ProfitLossCalculator />}
          {tab === 'growth' && <GrowthCalculator />}
          {tab === 'avgCost' && <AvgCostCalculator />}
          {tab === 'converter' && <CurrencyConverter />}
        </View>

        <Text variant="label" color="tertiary" style={{ textAlign: 'center', marginTop: spacing.xl }}>
          {t.calculators.disclaimer}
        </Text>
      </ScrollView>
    </View>
  );
}
