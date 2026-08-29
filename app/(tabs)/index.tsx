import React, { useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import * as WebBrowser from 'expo-web-browser';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useT } from '../../src/i18n/I18nContext';
import { Text } from '../../src/components/Text';
import { Card } from '../../src/components/Card';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { SectionHeader } from '../../src/components/SectionHeader';
import { MiniTickerCard } from '../../src/components/MiniTickerCard';
import { StockListRow } from '../../src/components/StockListRow';
import { Skeleton } from '../../src/components/Skeleton';
import { EmptyState } from '../../src/components/EmptyState';
import { AdBanner } from '../../src/components/AdBanner';
import { PortfolioHero } from '../../src/components/PortfolioHero';
import { QuickActionGrid } from '../../src/components/QuickActionGrid';
import { MarketPulseCard } from '../../src/components/MarketPulseCard';
import { LiveMarketTape } from '../../src/components/LiveMarketTape';
import { EditorialStory } from '../../src/components/EditorialStory';
import { MarketVisualCard } from '../../src/components/MarketVisualCard';
import { useWatchlistStore } from '../../src/store/useWatchlistStore';
import { usePortfolioStore } from '../../src/store/usePortfolioStore';
import { useQuotes } from '../../src/hooks/useQuotes';
import { useSparklines } from '../../src/hooks/useSparklines';
import { usePortfolioMetrics } from '../../src/hooks/usePortfolioMetrics';
import { useMarketNews } from '../../src/hooks/useNews';
import { useSettingsStore } from '../../src/store/useSettingsStore';
import { INDICES, ALL_SYMBOLS } from '../../src/constants/symbols';
import { formatPrice, formatSignedPrice, formatDateTime } from '../../src/utils/format';
import { convertFromTRY, currencySymbol } from '../../src/utils/currency';

const ALLOCATION_COLORS = ['#67F1B2', '#69A8FF', '#F3BF5D'];

function greetingKey() {
  const hour = new Date().getHours();
  if (hour < 12) return 'greetingMorning' as const;
  if (hour < 18) return 'greetingDay' as const;
  return 'greetingEvening' as const;
}

export default function HomeScreen() {
  const { colors, spacing, radius } = useTheme();
  const t = useT();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const activeListId = useWatchlistStore((s) => s.activeListId);
  const watchlist = useWatchlistStore((s) => s.lists.find((list) => list.id === activeListId));
  const previewSymbols = (watchlist?.symbols ?? []).slice(0, 4);
  const activePortfolioId = usePortfolioStore((s) => s.activePortfolioId);
  const { holdings, summary, usdTryRate } = usePortfolioMetrics(activePortfolioId);
  const displayCurrency = useSettingsStore((s) => s.displayCurrency);
  const currSymbol = currencySymbol(displayCurrency);
  const conv = (amountTRY: number) => convertFromTRY(amountTRY, displayCurrency, usdTryRate);

  const indexSymbols = useMemo(() => [...INDICES.slice(0, 5).map((item) => item.symbol), 'USDTRY=X'], []);
  const { data: indexQuotes, isLoading: indicesLoading } = useQuotes(indexSymbols);
  const { data: watchlistQuotes } = useQuotes(previewSymbols);
  const sparklines = useSparklines(previewSymbols);

  const moversUniverse = useMemo(() => ALL_SYMBOLS.slice(0, 20).map((item) => item.symbol), []);
  const { data: moversQuotes } = useQuotes(moversUniverse);
  const movers = useMemo(() => {
    const valid = (moversQuotes ?? []).filter((quote) => quote.regularMarketChangePercent !== undefined);
    const sorted = [...valid].sort((a, b) => (b.regularMarketChangePercent ?? 0) - (a.regularMarketChangePercent ?? 0));
    return { gainers: sorted.slice(0, 2), losers: sorted.slice(-2).reverse() };
  }, [moversQuotes]);

  const allocations = useMemo(() => {
    if (!holdings.length || summary.totalValue <= 0) return undefined;
    return [...holdings]
      .sort((a, b) => (b.marketValueBase ?? 0) - (a.marketValueBase ?? 0))
      .slice(0, 3)
      .map((holding, index) => ({
        label: holding.symbol,
        percent: ((holding.marketValueBase ?? 0) / summary.totalValue) * 100,
        color: ALLOCATION_COLORS[index],
      }));
  }, [holdings, summary.totalValue]);

  const { data: news, isLoading: newsLoading } = useMarketNews();
  const leadStory = news?.[0];
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries();
    setRefreshing(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ position: 'absolute', width: 330, height: 330, borderRadius: 165, top: -190, left: -120, backgroundColor: colors.accentSoft }} />
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + spacing.sm, paddingBottom: 126 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          brand
          title={t.common.appName}
          subtitle={t.home[greetingKey()]}
          actions={[
            { icon: 'search-outline', onPress: () => router.push('/(tabs)/search') },
            { icon: 'notifications-outline', onPress: () => router.push('/alerts') },
          ]}
        />

        <LiveMarketTape
          quotes={[
            indexQuotes?.find((quote) => quote.symbol === 'XU100.IS'),
            indexQuotes?.find((quote) => quote.symbol === 'USDTRY=X'),
          ].filter(Boolean) as NonNullable<typeof indexQuotes>}
        />

        <View style={{ paddingHorizontal: spacing.md }}>
          <PortfolioHero
            label={t.home.portfolioValue}
            value={formatPrice(conv(summary.totalValue), currSymbol)}
            change={formatSignedPrice(conv(summary.dayChangeValue))}
            changePercent={summary.dayChangePercent}
            allocations={allocations}
            marketOpenLabel={t.common.marketOpen}
            onPress={() => router.push('/(tabs)/portfolio')}
          />
        </View>

        <View style={{ paddingHorizontal: spacing.md, marginTop: spacing.sm }}>
          <QuickActionGrid
            actions={[
              { label: t.home.addTrade, icon: 'swap-horizontal-outline', color: '#08794D', onPress: () => router.push('/add-transaction') },
              { label: t.home.setAlert, icon: 'notifications-outline', color: '#315FBA', onPress: () => router.push('/create-alert') },
              { label: t.home.compare, icon: 'analytics-outline', color: '#9A6512', onPress: () => router.push('/compare') },
              { label: t.markets.scanner, icon: 'funnel-outline', color: '#7750AE', onPress: () => router.push('/scanner') },
            ]}
          />
        </View>

        <View style={{ marginTop: 26 }}>
          <View style={{ paddingHorizontal: spacing.md, marginBottom: spacing.sm }}>
            <SectionHeader eyebrow="Görsel piyasa haritası" title="Dünyayı tek bakışta izle" onSeeAll={() => router.push('/(tabs)/markets')} />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.md, gap: 12, paddingBottom: 8 }}>
            <MarketVisualCard
              source={require('../../assets/market-world-v1.png')}
              title={t.markets.worldMarkets}
              subtitle="Global endeksler"
              icon="globe-outline"
              active
              onPress={() => router.push('/(tabs)/markets')}
            />
            <MarketVisualCard
              source={require('../../assets/market-fx-v1.png')}
              title={t.markets.forex}
              subtitle="Majör pariteler"
              icon="swap-horizontal-outline"
              onPress={() => router.push('/(tabs)/markets')}
            />
            <MarketVisualCard
              source={require('../../assets/market-crypto-v1.png')}
              title={t.markets.crypto}
              subtitle="Dijital varlıklar"
              icon="cube-outline"
              onPress={() => router.push('/(tabs)/markets')}
            />
          </ScrollView>
        </View>

        <View style={{ paddingHorizontal: spacing.md, marginTop: 28 }}>
          <SectionHeader eyebrow={t.tabs.markets} title={t.home.marketMovers} onSeeAll={() => router.push('/(tabs)/markets')} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.md, gap: 11, paddingBottom: 8 }}>
          {indicesLoading && !indexQuotes
            ? Array.from({ length: 3 }).map((_, index) => <MiniTickerCard key={index} label="" loading />)
            : INDICES.slice(0, 5).map((index) => {
                const quote = indexQuotes?.find((item) => item.symbol === index.symbol);
                return (
                  <MiniTickerCard
                    key={index.symbol}
                    symbol={index.symbol}
                    label={index.shortName}
                    icon={index.flag}
                    price={quote?.regularMarketPrice}
                    changePercent={quote?.regularMarketChangePercent}
                  />
                );
              })}
        </ScrollView>

        <View style={{ paddingHorizontal: spacing.md, marginTop: 24 }}>
          <SectionHeader eyebrow="BorsaTakip Bakış" title={t.home.latestNews} onSeeAll={() => router.push('/news')} />
          {newsLoading && !leadStory ? (
            <Skeleton height={252} radius={radius.xl} />
          ) : leadStory ? (
            <EditorialStory
              title={leadStory.title}
              summary={leadStory.summary}
              source={leadStory.source}
              onPress={() => WebBrowser.openBrowserAsync(leadStory.link).catch(() => {})}
            />
          ) : (
            <Card><EmptyState icon="newspaper-outline" title={t.common.noResults} /></Card>
          )}

          <View style={{ flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs }}>
            <MoverTile icon="trending-up" label={t.markets.gainers} quote={movers.gainers[0]} positive />
            <MoverTile icon="trending-down" label={t.markets.losers} quote={movers.losers[0]} />
          </View>
        </View>

        <View style={{ paddingHorizontal: spacing.md, marginTop: 28 }}>
          <SectionHeader eyebrow="Canlı Takip" title={t.home.yourWatchlist} onSeeAll={() => router.push('/(tabs)/watchlist')} />
          <Card padded={false} style={{ borderRadius: radius.lg, overflow: 'hidden' }}>
            {previewSymbols.length === 0 ? (
              <View style={{ padding: spacing.md }}><EmptyState icon="star-outline" title={t.watchlist.emptyTitle} subtitle={t.watchlist.emptySubtitle} /></View>
            ) : previewSymbols.map((symbol) => {
              const quote = watchlistQuotes?.find((item) => item.symbol === symbol);
              return (
                <StockListRow
                  key={symbol}
                  symbol={symbol}
                  name={quote?.shortName}
                  price={quote?.regularMarketPrice}
                  changePercent={quote?.regularMarketChangePercent}
                  sparklineData={sparklines.get(symbol)}
                />
              );
            })}
          </Card>
        </View>

        <View style={{ paddingHorizontal: spacing.md, marginTop: 24 }}>
          <MarketPulseCard
            quotes={moversQuotes}
            title={t.home.marketPulse}
            subtitle={t.home.marketPulseSubtitle}
            averageLabel={t.home.averageMove}
            advancingLabel={t.home.advancing}
            decliningLabel={t.home.declining}
          />
        </View>

        {(news ?? []).slice(1, 4).length > 0 && (
          <View style={{ paddingHorizontal: spacing.md, marginTop: 24 }}>
            <SectionHeader title={t.stock.news} onSeeAll={() => router.push('/news')} />
            <Card padded={false}>
              {(news ?? []).slice(1, 4).map((item, index) => (
                <Pressable
                  key={item.id}
                  onPress={() => WebBrowser.openBrowserAsync(item.link).catch(() => {})}
                  style={{ padding: spacing.md, flexDirection: 'row', gap: spacing.sm, alignItems: 'center', borderBottomWidth: index < 2 ? 1 : 0, borderBottomColor: colors.borderSubtle }}
                >
                  <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="newspaper-outline" size={17} color={colors.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text variant="caption" weight="bold" numberOfLines={2}>{item.title}</Text>
                    <Text color="tertiary" style={{ fontSize: 10, marginTop: 3 }}>{item.source} · {formatDateTime(item.publishedAt)}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={15} color={colors.textTertiary} />
                </Pressable>
              ))}
            </Card>
          </View>
        )}

        <AdBanner style={{ marginTop: spacing.lg, marginHorizontal: spacing.md }} />
      </ScrollView>
    </View>
  );
}

function MoverTile({ icon, label, quote, positive = false }: { icon: keyof typeof Ionicons.glyphMap; label: string; quote?: any; positive?: boolean }) {
  const { colors, radius, spacing } = useTheme();
  const tone = positive ? colors.positive : colors.negative;
  return (
    <Pressable
      onPress={() => quote?.symbol && router.push(`/stock/${encodeURIComponent(quote.symbol)}`)}
      style={{ flex: 1, minHeight: 72, padding: spacing.sm, borderRadius: radius.md, backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 9 }}
    >
      <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: positive ? colors.positiveSoft : colors.negativeSoft, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={icon} size={17} color={tone} />
      </View>
      <View style={{ flex: 1 }}>
        <Text color="tertiary" style={{ fontSize: 9 }} numberOfLines={1}>{label}</Text>
        <Text variant="caption" weight="extrabold" numberOfLines={1}>{quote?.symbol?.replace('.IS', '') ?? '—'}</Text>
        <Text style={{ color: tone, fontSize: 10 }} weight="extrabold">
          {quote?.regularMarketChangePercent !== undefined ? `${quote.regularMarketChangePercent > 0 ? '+' : ''}${quote.regularMarketChangePercent.toFixed(2)}%` : '—'}
        </Text>
      </View>
    </Pressable>
  );
}
