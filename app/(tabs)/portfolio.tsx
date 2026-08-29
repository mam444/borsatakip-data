import React, { useMemo, useState } from 'react';
import { View, ScrollView, Pressable, Alert, TextInput, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useT } from '../../src/i18n/I18nContext';
import { Text } from '../../src/components/Text';
import { Card } from '../../src/components/Card';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { SectionHeader } from '../../src/components/SectionHeader';
import { EmptyState } from '../../src/components/EmptyState';
import { HoldingRow } from '../../src/components/HoldingRow';
import { AllocationDonut } from '../../src/components/AllocationDonut';
import { Button } from '../../src/components/Button';
import { usePortfolioStore } from '../../src/store/usePortfolioStore';
import { usePortfolioMetrics } from '../../src/hooks/usePortfolioMetrics';
import { usePortfolioHistory } from '../../src/hooks/usePortfolioHistory';
import { useSettingsStore } from '../../src/store/useSettingsStore';
import { formatPrice, formatSignedPrice } from '../../src/utils/format';
import { convertFromTRY, currencySymbol } from '../../src/utils/currency';
import { PortfolioChart } from '../../src/components/PortfolioChart';
import { usePremiumStore, FREE_LIMITS } from '../../src/store/usePremiumStore';
import type { ChartRange } from '../../src/constants/symbols';
import { LinearGradient } from 'expo-linear-gradient';
import { PortfolioHealthCard } from '../../src/components/PortfolioHealthCard';

const PALETTE = ['#7C6CFF', '#22D3C7', '#F5B94D', '#FF5C72', '#1FD990', '#6C8CFF', '#C88AFF', '#5FD1E0'];
const HISTORY_RANGES: ChartRange[] = ['1M', '6M', '1Y'];

export default function PortfolioScreen() {
  const { colors, spacing } = useTheme();
  const t = useT();
  const insets = useSafeAreaInsets();

  const portfolios = usePortfolioStore((s) => s.portfolios);
  const activePortfolioId = usePortfolioStore((s) => s.activePortfolioId);
  const setActivePortfolio = usePortfolioStore((s) => s.setActivePortfolio);
  const createPortfolio = usePortfolioStore((s) => s.createPortfolio);
  const deletePortfolio = usePortfolioStore((s) => s.deletePortfolio);
  const removeTransaction = usePortfolioStore((s) => s.removeTransaction);

  const { holdings, summary, transactions, usdTryRate } = usePortfolioMetrics(activePortfolioId);
  const displayCurrency = useSettingsStore((s) => s.displayCurrency);

  const isPremium = usePremiumStore((s) => s.isPremium);
  const canCreatePortfolio = isPremium || portfolios.length < FREE_LIMITS.maxPortfolios;

  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [historyRange, setHistoryRange] = useState<ChartRange>('1M');

  const heldSymbols = useMemo(() => holdings.map((h) => h.symbol), [holdings]);
  const { history, isLoading: historyLoading } = usePortfolioHistory(transactions, heldSymbols, historyRange);

  const requestCreatePortfolio = () => {
    if (!canCreatePortfolio) {
      Alert.alert(t.premium.limitReachedPortfolio, t.premium.upgradeToUnlock, [
        { text: t.common.cancel, style: 'cancel' },
        { text: t.premium.title, onPress: () => router.push('/premium') },
      ]);
      return;
    }
    setCreating(true);
  };

  const handleCreate = () => {
    if (newName.trim()) setActivePortfolio(createPortfolio(newName.trim()));
    setNewName('');
    setCreating(false);
  };

  const confirmDelete = (id: string, name: string) => {
    Alert.alert(name, t.common.delete + '?', [
      { text: t.common.cancel, style: 'cancel' },
      { text: t.common.delete, style: 'destructive', onPress: () => deletePortfolio(id) },
    ]);
  };

  const donutData = useMemo(
    () =>
      holdings
        .filter((h) => (h.marketValueBase ?? 0) > 0)
        .sort((a, b) => (b.marketValueBase ?? 0) - (a.marketValueBase ?? 0))
        .map((h, i) => ({ label: h.symbol, value: h.marketValueBase ?? 0, color: PALETTE[i % PALETTE.length] })),
    [holdings]
  );

  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['quotes'] });
    await queryClient.invalidateQueries({ queryKey: ['portfolio-history-chart'] });
    setRefreshing(false);
  };

  const dayPositive = summary.dayChangeValue >= 0;
  const plPositive = summary.totalPL >= 0;
  const symbol = currencySymbol(displayCurrency);
  const conv = (amountTRY: number) => convertFromTRY(amountTRY, displayCurrency, usdTryRate);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ paddingTop: insets.top + spacing.sm }}>
        <ScreenHeader
          title={t.tabs.portfolio}
          actions={[{ icon: 'add', onPress: requestCreatePortfolio }]}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: spacing.md, gap: spacing.xs, paddingBottom: spacing.sm }}
        >
          {portfolios.map((p) => {
            const active = p.id === activePortfolioId;
            return (
              <Pressable
                key={p.id}
                onPress={() => setActivePortfolio(p.id)}
                onLongPress={() => portfolios.length > 1 && confirmDelete(p.id, p.name)}
                style={{
                  paddingHorizontal: spacing.md,
                  paddingVertical: 8,
                  borderRadius: 999,
                  backgroundColor: active ? colors.accent : colors.bgCard,
                  borderWidth: 1,
                  borderColor: active ? colors.accent : colors.border,
                }}
              >
                <Text variant="caption" weight="semibold" style={{ color: active ? '#fff' : colors.textSecondary }}>
                  {p.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {creating && (
          <View style={{ flexDirection: 'row', paddingHorizontal: spacing.md, gap: spacing.xs, marginTop: spacing.xs }}>
            <TextInput
              autoFocus
              value={newName}
              onChangeText={setNewName}
              placeholder={t.portfolio.newPortfolio}
              placeholderTextColor={colors.textTertiary}
              onSubmitEditing={handleCreate}
              style={{
                flex: 1,
                backgroundColor: colors.bgCard,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 12,
                paddingHorizontal: spacing.sm,
                paddingVertical: 8,
                color: colors.textPrimary,
              }}
            />
            <Pressable onPress={handleCreate} style={{ justifyContent: 'center', paddingHorizontal: spacing.sm }}>
              <Text variant="caption" weight="bold" color="accent">
                {t.common.save}
              </Text>
            </Pressable>
          </View>
        )}
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.md, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
      >
        <LinearGradient
          colors={['#071712', '#102A21']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 26, padding: spacing.lg, minHeight: 190, overflow: 'hidden', shadowColor: '#071712', shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.22, shadowRadius: 26 }}
        >
          <View style={{ position: 'absolute', right: -55, top: -65, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(103,241,178,0.08)', borderWidth: 1, borderColor: 'rgba(103,241,178,0.12)' }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text variant="caption" weight="semibold" style={{ color: '#9BB0A8' }}>{t.portfolio.totalValue}</Text>
            <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(103,241,178,0.12)', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="wallet-outline" size={18} color="#67F1B2" />
            </View>
          </View>
          <Text variant="display" weight="extrabold" style={{ marginTop: 5, color: '#FFFFFF', letterSpacing: -1.1 }}>
            {formatPrice(conv(summary.totalValue), symbol)}
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
            <MetricPill label={t.portfolio.dayChange} value={`${formatSignedPrice(conv(summary.dayChangeValue))} (${summary.dayChangePercent.toFixed(2)}%)`} positive={dayPositive} />
            <MetricPill label={t.portfolio.totalPL} value={`${formatSignedPrice(conv(summary.totalPL))} (${summary.totalPLPercent.toFixed(2)}%)`} positive={plPositive} />
          </View>
        </LinearGradient>

        {heldSymbols.length > 0 && (
          <View style={{ marginTop: spacing.lg }}>
            <SectionHeader eyebrow="Risk & Denge" title={t.portfolio.health} />
            <PortfolioHealthCard holdings={holdings} totalValue={summary.totalValue} />
          </View>
        )}

        {heldSymbols.length > 0 && (
          <View style={{ marginTop: spacing.lg }}>
            <SectionHeader eyebrow="Analiz" title={t.portfolio.performance} />
            <Card>
              <PortfolioChart
                points={history}
                range={historyRange}
                ranges={HISTORY_RANGES}
                onRangeChange={setHistoryRange}
                isLoading={historyLoading}
              />
            </Card>
          </View>
        )}

        {donutData.length > 0 && (
          <View style={{ marginTop: spacing.lg }}>
            <SectionHeader eyebrow="Varlıklar" title={t.portfolio.allocation} />
            <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg }}>
              <AllocationDonut data={donutData} />
              <View style={{ flex: 1, gap: 8 }}>
                {donutData.slice(0, 5).map((d) => (
                  <View key={d.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: d.color }} />
                    <Text variant="label" numberOfLines={1} style={{ flex: 1 }}>
                      {d.label.replace('.IS', '')}
                    </Text>
                    <Text variant="label" color="tertiary">
                      {((d.value / (summary.totalValue || 1)) * 100).toFixed(0)}%
                    </Text>
                  </View>
                ))}
              </View>
            </Card>
          </View>
        )}

        <View style={{ marginTop: spacing.lg }}>
          <SectionHeader eyebrow="Canlı" title={t.portfolio.holdings} />
          {holdings.length === 0 ? (
            <Card>
              <EmptyState icon="pie-chart-outline" title={t.portfolio.emptyTitle} subtitle={t.portfolio.emptySubtitle} />
            </Card>
          ) : (
            <Card padded={false}>
              {holdings.map((h) => (
                <HoldingRow key={h.symbol} holding={h} />
              ))}
            </Card>
          )}
        </View>

        {transactions.length > 0 && (
          <View style={{ marginTop: spacing.lg }}>
            <SectionHeader eyebrow="Kayıtlar" title={t.portfolio.recentTransactions} />
            <Card padded={false}>
              {[...transactions]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 6)
                .map((transaction, index, list) => (
                  <View key={transaction.id} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderBottomWidth: index < list.length - 1 ? 1 : 0, borderBottomColor: colors.borderSubtle }}>
                    <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: transaction.type === 'buy' ? colors.positiveSoft : colors.negativeSoft, alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name={transaction.type === 'buy' ? 'arrow-down' : 'arrow-up'} size={17} color={transaction.type === 'buy' ? colors.positive : colors.negative} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text variant="caption" weight="extrabold">{transaction.symbol.replace('.IS', '')}</Text>
                      <Text variant="label" color="tertiary">
                        {transaction.type === 'buy' ? t.portfolio.buy : t.portfolio.sell} · {transaction.quantity} × {formatPrice(transaction.price)}
                      </Text>
                    </View>
                    <Pressable onPress={() => removeTransaction(activePortfolioId, transaction.id)} hitSlop={8}>
                      <Ionicons name="trash-outline" size={17} color={colors.textTertiary} />
                    </Pressable>
                  </View>
                ))}
            </Card>
          </View>
        )}

        <Button
          label={t.portfolio.addTransactionTitle}
          onPress={() => router.push('/add-transaction')}
          style={{ marginTop: spacing.lg }}
          icon={<Ionicons name="add" size={18} color="#fff" />}
        />
      </ScrollView>
    </View>
  );
}

function MetricPill({ label, value, positive }: { label: string; value: string; positive: boolean }) {
  return (
    <View style={{ flex: 1, padding: 10, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
      <Text style={{ color: '#8DA29A', fontSize: 9 }}>{label}</Text>
      <Text variant="label" weight="extrabold" style={{ color: positive ? '#67F1B2' : '#FF7B87', marginTop: 3 }} numberOfLines={1}>{value}</Text>
    </View>
  );
}
