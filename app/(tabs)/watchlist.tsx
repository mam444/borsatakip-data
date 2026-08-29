import React, { useMemo, useState } from 'react';
import { View, ScrollView, Pressable, Alert, TextInput, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Swipeable } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useT } from '../../src/i18n/I18nContext';
import { Text } from '../../src/components/Text';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { Card } from '../../src/components/Card';
import { EmptyState } from '../../src/components/EmptyState';
import { StockListRow } from '../../src/components/StockListRow';
import { useWatchlistStore } from '../../src/store/useWatchlistStore';
import { useQuotes } from '../../src/hooks/useQuotes';
import { useSparklines } from '../../src/hooks/useSparklines';
import { VisualHeaderBanner } from '../../src/components/VisualHeaderBanner';
import { usePremiumStore, FREE_LIMITS } from '../../src/store/usePremiumStore';
import { MarketPulseCard } from '../../src/components/MarketPulseCard';
import { SectionHeader } from '../../src/components/SectionHeader';

function SwipeDelete({ onDelete }: { onDelete: () => void }) {
  const { colors, spacing } = useTheme();
  return (
    <Pressable
      onPress={() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        onDelete();
      }}
      style={{
        backgroundColor: colors.negative,
        justifyContent: 'center',
        alignItems: 'center',
        width: 72,
        borderRadius: 14,
        marginVertical: 2,
      }}
    >
      <Ionicons name="trash-outline" size={20} color="#fff" />
    </Pressable>
  );
}

export default function WatchlistScreen() {
  const { colors, spacing } = useTheme();
  const t = useT();
  const insets = useSafeAreaInsets();

  const lists = useWatchlistStore((s) => s.lists);
  const activeListId = useWatchlistStore((s) => s.activeListId);
  const setActiveList = useWatchlistStore((s) => s.setActiveList);
  const removeSymbol = useWatchlistStore((s) => s.removeSymbol);
  const createList = useWatchlistStore((s) => s.createList);
  const deleteList = useWatchlistStore((s) => s.deleteList);

  const activeList = lists.find((l) => l.id === activeListId) ?? lists[0];
  const symbols = activeList?.symbols ?? [];

  const { data: quotes, isLoading, isError, refetch, isRefetching } = useQuotes(symbols);
  const sparklines = useSparklines(symbols);

  const isPremium = usePremiumStore((s) => s.isPremium);
  const canCreateList = isPremium || lists.length < FREE_LIMITS.maxWatchlists;

  const [creating, setCreating] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [sort, setSort] = useState<'manual' | 'gainers' | 'losers'>('manual');
  const displaySymbols = useMemo(() => {
    if (sort === 'manual') return symbols;
    return [...symbols].sort((a, b) => {
      const changeA = quotes?.find((quote) => quote.symbol === a)?.regularMarketChangePercent ?? 0;
      const changeB = quotes?.find((quote) => quote.symbol === b)?.regularMarketChangePercent ?? 0;
      return sort === 'gainers' ? changeB - changeA : changeA - changeB;
    });
  }, [symbols, quotes, sort]);

  const requestCreateList = () => {
    if (!canCreateList) {
      Alert.alert(t.premium.limitReachedWatchlist, t.premium.upgradeToUnlock, [
        { text: t.common.cancel, style: 'cancel' },
        { text: t.premium.title, onPress: () => router.push('/premium') },
      ]);
      return;
    }
    setCreating(true);
  };

  const handleCreateList = () => {
    if (newListName.trim()) {
      const id = createList(newListName.trim());
      setActiveList(id);
    }
    setNewListName('');
    setCreating(false);
  };

  const confirmDeleteList = (id: string, name: string) => {
    Alert.alert(name, t.common.delete + '?', [
      { text: t.common.cancel, style: 'cancel' },
      { text: t.common.delete, style: 'destructive', onPress: () => deleteList(id) },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ paddingTop: insets.top + spacing.sm }}>
        <ScreenHeader
          title={t.tabs.watchlist}
          actions={[{ icon: 'add', onPress: requestCreateList }]}
        />
        <VisualHeaderBanner source={require('../../assets/market-world-v1.png')} eyebrow="Küresel İzleme" title="Piyasadaki hareketi kaçırma" icon="globe-outline" />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: spacing.md, gap: spacing.xs, paddingBottom: spacing.sm }}
        >
          {lists.map((l) => {
            const active = l.id === activeListId;
            return (
              <Pressable
                key={l.id}
                onPress={() => setActiveList(l.id)}
                onLongPress={() => lists.length > 1 && confirmDeleteList(l.id, l.name)}
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
                  {l.name} ({l.symbols.length})
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {creating && (
          <View style={{ flexDirection: 'row', paddingHorizontal: spacing.md, gap: spacing.xs, marginTop: spacing.xs }}>
            <TextInput
              autoFocus
              value={newListName}
              onChangeText={setNewListName}
              placeholder={t.watchlist.listName}
              placeholderTextColor={colors.textTertiary}
              onSubmitEditing={handleCreateList}
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
            <Pressable onPress={handleCreateList} style={{ justifyContent: 'center', paddingHorizontal: spacing.sm }}>
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
        refreshControl={<RefreshControl refreshing={isRefetching && !isLoading} onRefresh={refetch} tintColor={colors.accent} />}
      >
        {symbols.length > 0 && (
          <View style={{ marginBottom: spacing.lg }}>
            <MarketPulseCard
              quotes={quotes}
              title={t.home.marketPulse}
              subtitle={t.home.marketPulseSubtitle}
              averageLabel={t.home.averageMove}
              advancingLabel={t.home.advancing}
              decliningLabel={t.home.declining}
            />
          </View>
        )}
        <SectionHeader eyebrow="Canlı Takip" title={activeList?.name ?? t.tabs.watchlist} />
        {symbols.length > 1 && (
          <View style={{ flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.sm }}>
            {([
              ['manual', t.watchlist.defaultOrder],
              ['gainers', t.home.advancing],
              ['losers', t.home.declining],
            ] as const).map(([value, label]) => (
              <Pressable key={value} onPress={() => setSort(value)} style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 99, backgroundColor: sort === value ? '#081713' : colors.bgCard, borderWidth: 1, borderColor: sort === value ? '#081713' : colors.border }}>
                <Text variant="label" weight="bold" style={{ color: sort === value ? '#67F1B2' : colors.textSecondary }}>{label}</Text>
              </Pressable>
            ))}
          </View>
        )}
        {isError && symbols.length > 0 && !quotes && (
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.negativeSoft, borderColor: colors.negative, marginBottom: spacing.sm }}>
            <Text variant="caption" weight="semibold" color="negative" style={{ flex: 1 }}>
              {t.common.error}
            </Text>
            <Pressable onPress={() => refetch()}>
              <Text variant="caption" weight="bold" color="negative">
                {t.common.retry}
              </Text>
            </Pressable>
          </Card>
        )}
        {symbols.length === 0 ? (
          <Card>
            <EmptyState icon="star-outline" title={t.watchlist.emptyTitle} subtitle={t.watchlist.emptySubtitle} />
          </Card>
        ) : (
          <Card padded={false}>
            {displaySymbols.map((symbol) => {
              const q = quotes?.find((x) => x.symbol === symbol);
              return (
                <Swipeable
                  key={symbol}
                  renderRightActions={() => <SwipeDelete onDelete={() => removeSymbol(activeList!.id, symbol)} />}
                >
                  <StockListRow
                    symbol={symbol}
                    name={q?.shortName}
                    price={q?.regularMarketPrice}
                    changePercent={q?.regularMarketChangePercent}
                    sparklineData={sparklines.get(symbol)}
                  />
                </Swipeable>
              );
            })}
          </Card>
        )}

        <Pressable
          onPress={() => router.push('/(tabs)/search')}
          style={{
            marginTop: spacing.md,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.xs,
            paddingVertical: 14,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.border,
            borderStyle: 'dashed',
          }}
        >
          <Ionicons name="add-circle-outline" size={18} color={colors.accent} />
          <Text variant="caption" weight="semibold" color="accent">
            {t.stock.addToWatchlist}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
