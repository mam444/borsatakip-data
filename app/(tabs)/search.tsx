import React, { useState, useMemo } from 'react';
import { View, ScrollView, TextInput, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useT } from '../../src/i18n/I18nContext';
import { Text } from '../../src/components/Text';
import { Card } from '../../src/components/Card';
import { EmptyState } from '../../src/components/EmptyState';
import { Skeleton } from '../../src/components/Skeleton';
import { useSearch } from '../../src/hooks/useSearch';
import { useSearchHistoryStore } from '../../src/store/useSearchHistoryStore';
import { ALL_SYMBOLS } from '../../src/constants/symbols';
import { SymbolAvatar } from '../../src/components/SymbolAvatar';
import { StockListRow } from '../../src/components/StockListRow';
import { useQuotes } from '../../src/hooks/useQuotes';
import { useSparklines } from '../../src/hooks/useSparklines';
import { VisualHeaderBanner } from '../../src/components/VisualHeaderBanner';

export default function SearchScreen() {
  const { colors, spacing, radius } = useTheme();
  const t = useT();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  const { data: results, isLoading, isError, refetch } = useSearch(query);

  const recent = useSearchHistoryStore((s) => s.recent);
  const addRecent = useSearchHistoryStore((s) => s.addRecent);
  const clearRecent = useSearchHistoryStore((s) => s.clearRecent);

  const openSymbol = (symbol: string) => {
    addRecent(symbol);
    router.push(`/stock/${encodeURIComponent(symbol)}`);
  };

  const grouped = useMemo(() => {
    const groups: Record<string, typeof results> = {};
    for (const r of results ?? []) {
      const ex = r.exchDisp ?? t.common.other;
      (groups[ex] ??= []).push(r);
    }
    return groups;
  }, [results]);

  const popular = useMemo(() => ALL_SYMBOLS.slice(0, 8), []);
  const popularSymbols = useMemo(() => popular.map((item) => item.symbol), [popular]);
  const { data: popularQuotes } = useQuotes(popularSymbols);
  const popularSparklines = useSparklines(popularSymbols);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ paddingTop: insets.top + spacing.sm, paddingHorizontal: spacing.md }}>
        <Text variant="title" weight="extrabold" style={{ marginBottom: spacing.sm }}>
          {t.tabs.search}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.bgCard,
            borderRadius: radius.md,
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: spacing.sm,
            gap: spacing.xs,
          }}
        >
          <Ionicons name="search" size={18} color={colors.textTertiary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t.common.searchPlaceholder}
            placeholderTextColor={colors.textTertiary}
            style={{ flex: 1, color: colors.textPrimary, paddingVertical: 12 }}
            autoCapitalize="characters"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
            </Pressable>
          )}
        </View>
      </View>

      <VisualHeaderBanner source={require('../../assets/market-world-v1.png')} eyebrow="Global Arama" title="Milyonlarca sembol içinde keşfet" icon="search-outline" />

      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 140 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {query.trim().length === 0 ? (
          <View>
            {recent.length > 0 && (
              <View style={{ marginBottom: spacing.lg }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
                  <Text variant="caption" weight="semibold" color="tertiary">
                    {t.common.recentSearches}
                  </Text>
                  <Pressable onPress={clearRecent} hitSlop={8}>
                    <Text variant="label" weight="semibold" color="accent">
                      {t.common.clear}
                    </Text>
                  </Pressable>
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {recent.map((symbol) => (
                    <Pressable
                      key={symbol}
                      onPress={() => openSymbol(symbol)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                        paddingHorizontal: spacing.sm,
                        paddingVertical: 8,
                        borderRadius: 999,
                        backgroundColor: colors.bgCard,
                        borderWidth: 1,
                        borderColor: colors.border,
                      }}
                    >
                      <Ionicons name="time-outline" size={13} color={colors.textTertiary} />
                      <Text variant="caption" weight="semibold">
                        {symbol.replace('.IS', '')}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            <Text variant="caption" weight="semibold" color="tertiary" style={{ marginBottom: spacing.sm }}>
              {t.common.popular}
            </Text>
            <Card padded={false}>
              {popular.map((item) => {
                const quote = popularQuotes?.find((candidate) => candidate.symbol === item.symbol);
                return <StockListRow key={item.symbol} symbol={item.symbol} name={item.name} price={quote?.regularMarketPrice} changePercent={quote?.regularMarketChangePercent} sparklineData={popularSparklines.get(item.symbol)} onPress={() => openSymbol(item.symbol)} />;
              })}
            </Card>
          </View>
        ) : isLoading ? (
          <View style={{ gap: spacing.sm }}>
            <Skeleton height={48} />
            <Skeleton height={48} />
            <Skeleton height={48} />
          </View>
        ) : isError ? (
          <View style={{ alignItems: 'center', gap: spacing.sm }}>
            <EmptyState icon="cloud-offline-outline" title={t.common.error} />
            <Pressable onPress={() => refetch()} style={{ paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.sm, backgroundColor: colors.bgCardAlt }}>
              <Text variant="caption" weight="semibold" color="accent">
                {t.common.retry}
              </Text>
            </Pressable>
          </View>
        ) : Object.keys(grouped).length === 0 ? (
          <EmptyState icon="search-outline" title={t.common.noResults} />
        ) : (
          Object.entries(grouped).map(([exchange, items]) => (
            <View key={exchange} style={{ marginBottom: spacing.md }}>
              <Text variant="caption" weight="semibold" color="tertiary" style={{ marginBottom: spacing.xs }}>
                {exchange}
              </Text>
              <Card padded={false}>
                {items!.map((r, i) => (
                  <Pressable
                    key={r.symbol + i}
                    onPress={() => openSymbol(r.symbol)}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: spacing.md,
                      gap: spacing.sm,
                      borderBottomWidth: i < items!.length - 1 ? 1 : 0,
                      borderBottomColor: colors.borderSubtle,
                    }}
                  >
                    <SymbolAvatar symbol={r.symbol} size={34} />
                    <View style={{ flex: 1 }}>
                      <Text variant="body" weight="semibold">
                        {r.symbol}
                      </Text>
                      <Text variant="caption" color="tertiary" numberOfLines={1}>
                        {r.shortname ?? r.longname}
                      </Text>
                    </View>
                    <Text variant="label" color="tertiary">
                      {r.typeDisp}
                    </Text>
                  </Pressable>
                ))}
              </Card>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
