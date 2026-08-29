import React, { useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../src/theme/ThemeProvider';
import { useT } from '../src/i18n/I18nContext';
import { Text } from '../src/components/Text';
import { Card } from '../src/components/Card';
import { StockListRow } from '../src/components/StockListRow';
import { MarketPulseCard } from '../src/components/MarketPulseCard';
import { Skeleton } from '../src/components/Skeleton';
import { EmptyState } from '../src/components/EmptyState';
import { VisualHeaderBanner } from '../src/components/VisualHeaderBanner';
import { useQuotes } from '../src/hooks/useQuotes';
import { useSparklines } from '../src/hooks/useSparklines';
import { ALL_SYMBOLS, BIST30, GLOBAL_POPULAR } from '../src/constants/symbols';

type Strategy = 'momentum' | 'trend' | 'volume';
type Universe = 'all' | 'bist' | 'global';

export default function ScannerScreen() {
  const { colors, spacing, radius } = useTheme();
  const t = useT();
  const insets = useSafeAreaInsets();
  const [strategy, setStrategy] = useState<Strategy>('momentum');
  const [universe, setUniverse] = useState<Universe>('all');
  const [query, setQuery] = useState('');

  const metadata = universe === 'bist' ? BIST30 : universe === 'global' ? GLOBAL_POPULAR : ALL_SYMBOLS;
  const symbols = useMemo(() => metadata.map((item) => item.symbol), [metadata]);
  const { data: quotes, isLoading, isRefetching, refetch } = useQuotes(symbols);

  const results = useMemo(() => {
    const search = query.trim().toLocaleUpperCase('tr-TR');
    const filtered = (quotes ?? []).filter((quote) => {
      const meta = metadata.find((item) => item.symbol === quote.symbol);
      return !search || quote.symbol.toLocaleUpperCase('tr-TR').includes(search) || meta?.name.toLocaleUpperCase('tr-TR').includes(search);
    });
    if (strategy === 'volume') return [...filtered].sort((a, b) => (b.regularMarketVolume ?? 0) - (a.regularMarketVolume ?? 0)).slice(0, 15);
    if (strategy === 'trend') {
      return [...filtered]
        .filter((quote) => quote.regularMarketPrice !== undefined && (quote.fiftyDayAverage !== undefined || quote.regularMarketChangePercent !== undefined))
        .sort((a, b) => {
          const score = (quote: typeof a) => quote.fiftyDayAverage ? ((quote.regularMarketPrice ?? 0) / quote.fiftyDayAverage - 1) * 100 : quote.regularMarketChangePercent ?? 0;
          return score(b) - score(a);
        })
        .slice(0, 15);
    }
    return [...filtered].sort((a, b) => (b.regularMarketChangePercent ?? -999) - (a.regularMarketChangePercent ?? -999)).slice(0, 15);
  }, [quotes, metadata, query, strategy]);

  const resultSymbols = useMemo(() => results.slice(0, 10).map((quote) => quote.symbol), [results]);
  const sparklines = useSparklines(resultSymbols);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ paddingTop: insets.top + spacing.sm, paddingHorizontal: spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 13, backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="close" size={21} color={colors.textPrimary} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text color="tertiary" weight="extrabold" style={{ fontSize: 10, letterSpacing: 1.1 }}>KEŞİF</Text>
            <Text variant="headline" weight="extrabold">{t.markets.scanner}</Text>
          </View>
        </View>
        <Text variant="caption" color="secondary" style={{ marginTop: spacing.xs }}>{t.markets.scannerSubtitle}</Text>
      </View>

      <VisualHeaderBanner source={require('../assets/market-crypto-v1.png')} eyebrow="Piyasa Sinyali" title="Güçlü hareketleri tara" icon="funnel-outline" />

      <ScrollView
        contentContainerStyle={{ padding: spacing.md, paddingBottom: 60 }}
        refreshControl={<RefreshControl refreshing={isRefetching && !isLoading} onRefresh={refetch} tintColor={colors.accent} />}
        keyboardShouldPersistTaps="handled"
      >
        <MarketPulseCard quotes={quotes} title={t.markets.overview} subtitle={t.markets.overviewSubtitle} averageLabel={t.home.averageMove} advancingLabel={t.home.advancing} decliningLabel={t.home.declining} />

        <View style={{ flexDirection: 'row', gap: 5, marginTop: spacing.md, padding: 4, borderRadius: radius.md, backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border }}>
          {([
            ['momentum', t.markets.momentum, 'flash-outline'],
            ['trend', t.markets.trend, 'trending-up-outline'],
            ['volume', t.markets.volumeLeaders, 'bar-chart-outline'],
          ] as [Strategy, string, keyof typeof Ionicons.glyphMap][]).map(([value, label, icon]) => (
            <Pressable key={value} onPress={() => setStrategy(value)} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 9, borderRadius: radius.sm, backgroundColor: strategy === value ? colors.accentSoft : 'transparent' }}>
              <Ionicons name={icon} size={14} color={strategy === value ? colors.accent : colors.textTertiary} />
              <Text variant="label" weight="bold" style={{ color: strategy === value ? colors.accent : colors.textTertiary }}>{label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={{ flexDirection: 'row', gap: spacing.xs, marginTop: spacing.sm }}>
          {([
            ['all', t.markets.allMarkets],
            ['bist', 'BIST'],
            ['global', 'Global'],
          ] as [Universe, string][]).map(([value, label]) => (
            <Pressable key={value} onPress={() => setUniverse(value)} style={{ paddingHorizontal: 13, paddingVertical: 7, borderRadius: 99, backgroundColor: universe === value ? '#081713' : colors.bgCard, borderWidth: 1, borderColor: universe === value ? '#081713' : colors.border }}>
              <Text variant="label" weight="bold" style={{ color: universe === value ? '#67F1B2' : colors.textSecondary }}>{label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.md, paddingHorizontal: spacing.sm, borderRadius: radius.md, backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border }}>
          <Ionicons name="search-outline" size={17} color={colors.textTertiary} />
          <TextInput value={query} onChangeText={setQuery} placeholder={t.common.searchPlaceholder} placeholderTextColor={colors.textTertiary} autoCapitalize="characters" style={{ flex: 1, color: colors.textPrimary, paddingVertical: 12 }} />
          {!!query && <Pressable onPress={() => setQuery('')}><Ionicons name="close-circle" size={17} color={colors.textTertiary} /></Pressable>}
        </View>

        <View style={{ marginTop: spacing.md }}>
          {isLoading && !quotes ? (
            <View style={{ gap: spacing.xs }}>{Array.from({ length: 7 }).map((_, index) => <Skeleton key={index} height={68} radius={14} />)}</View>
          ) : results.length === 0 ? (
            <EmptyState icon="funnel-outline" title={t.common.noResults} />
          ) : (
            <Card padded={false}>
              {results.map((quote) => (
                <StockListRow key={quote.symbol} symbol={quote.symbol} name={quote.shortName} price={quote.regularMarketPrice} changePercent={quote.regularMarketChangePercent} sparklineData={sparklines.get(quote.symbol)} />
              ))}
            </Card>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
