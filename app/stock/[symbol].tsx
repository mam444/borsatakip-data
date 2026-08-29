import React, { useState } from 'react';
import { View, ScrollView, Pressable, RefreshControl } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useT } from '../../src/i18n/I18nContext';
import { Text } from '../../src/components/Text';
import { Card } from '../../src/components/Card';
import { StockChart } from '../../src/components/StockChart';
import { PriceChangeBadge } from '../../src/components/PriceChangeBadge';
import { FlashPrice } from '../../src/components/FlashPrice';
import { SymbolAvatar } from '../../src/components/SymbolAvatar';
import { PremiumGate } from '../../src/components/PremiumGate';
import { SectionHeader } from '../../src/components/SectionHeader';
import { Skeleton } from '../../src/components/Skeleton';
import { AdBanner } from '../../src/components/AdBanner';
import { PivotPoints } from '../../src/components/PivotPoints';
import { QuickActionGrid } from '../../src/components/QuickActionGrid';
import { TechnicalSummary } from '../../src/components/TechnicalSummary';
import { QuoteFreshnessBadge } from '../../src/components/QuoteFreshnessBadge';
import { useQuote } from '../../src/hooks/useQuotes';
import { useChart } from '../../src/hooks/useChart';
import { useSymbolNews } from '../../src/hooks/useNews';
import { useWatchlistStore } from '../../src/store/useWatchlistStore';
import { ChartRange } from '../../src/constants/symbols';
import { formatPrice, formatSignedPrice, formatDateTime, changeColorKey, compactNumber } from '../../src/utils/format';

export default function StockDetailScreen() {
  const { symbol } = useLocalSearchParams<{ symbol: string }>();
  const { colors, spacing } = useTheme();
  const t = useT();
  const insets = useSafeAreaInsets();

  const [range, setRange] = useState<ChartRange>('1D');
  const [mode, setMode] = useState<'line' | 'candle'>('line');

  const { data: quote, isLoading: quoteLoading, isError: quoteError } = useQuote(symbol);
  const { data: chart, isLoading: chartLoading } = useChart(symbol, range);
  const { data: news } = useSymbolNews(symbol);

  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['quotes'] }),
      queryClient.invalidateQueries({ queryKey: ['chart', symbol] }),
    ]);
    setRefreshing(false);
  };

  const activeListId = useWatchlistStore((s) => s.activeListId);
  const isWatched = useWatchlistStore((s) => (symbol ? s.isInAnyList(symbol) : false));
  const addSymbol = useWatchlistStore((s) => s.addSymbol);
  const removeSymbol = useWatchlistStore((s) => s.removeSymbol);
  const lists = useWatchlistStore((s) => s.lists);

  const changeKey = changeColorKey(quote?.regularMarketChangePercent);
  const priceColor = changeKey === 'positive' ? colors.positive : changeKey === 'negative' ? colors.negative : colors.textPrimary;

  const toggleWatch = () => {
    if (!symbol) return;
    if (isWatched) {
      lists.forEach((l) => l.symbols.includes(symbol) && removeSymbol(l.id, symbol));
    } else {
      addSymbol(activeListId, symbol);
    }
  };

  const low = quote?.fiftyTwoWeekLow;
  const high = quote?.fiftyTwoWeekHigh;
  const current = quote?.regularMarketPrice;
  const rangePct = low !== undefined && high !== undefined && current !== undefined && high > low ? ((current - low) / (high - low)) * 100 : undefined;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + spacing.sm, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, marginBottom: spacing.sm }}>
          <Pressable onPress={() => router.back()} style={{ padding: 8, marginLeft: -8 }}>
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </Pressable>
          <Pressable onPress={toggleWatch} style={{ padding: 8, marginRight: -8 }}>
            <Ionicons name={isWatched ? 'star' : 'star-outline'} size={22} color={isWatched ? colors.gold : colors.textPrimary} />
          </Pressable>
        </View>

        {quoteError && !quote && (
          <View style={{ marginHorizontal: spacing.md, marginBottom: spacing.sm }}>
            <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.negativeSoft, borderColor: colors.negative }}>
              <Ionicons name="cloud-offline-outline" size={18} color={colors.negative} />
              <Text variant="caption" weight="semibold" color="negative" style={{ flex: 1 }}>
                {t.common.error}
              </Text>
              <Pressable onPress={onRefresh}>
                <Text variant="caption" weight="bold" color="negative">
                  {t.common.retry}
                </Text>
              </Pressable>
            </Card>
          </View>
        )}

        <View style={{ paddingHorizontal: spacing.md }}>
          <Card elevated style={{ padding: spacing.lg, overflow: 'hidden' }}>
          <View style={{ position: 'absolute', width: 150, height: 150, borderRadius: 75, right: -65, top: -70, backgroundColor: priceColor + '0D' }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <SymbolAvatar symbol={symbol ?? ''} size={48} />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text variant="caption" color="tertiary" weight="medium">
                  {quote?.fullExchangeName ?? '—'}
                </Text>
                {quote?.marketState && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <View
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: quote.marketState === 'REGULAR' ? colors.positive : colors.textTertiary,
                      }}
                    />
                    <Text variant="label" style={{ color: quote.marketState === 'REGULAR' ? colors.positive : colors.textTertiary }}>
                      {quote.marketState === 'REGULAR' ? t.common.marketOpen : t.common.marketClosed}
                    </Text>
                  </View>
                )}
              </View>
              <Text variant="title" weight="extrabold">
                {(symbol ?? '').replace('.IS', '')}
              </Text>
              <Text variant="caption" color="secondary" numberOfLines={1}>
                {quote?.longName ?? quote?.shortName ?? ''}
              </Text>
            </View>
          </View>

          {quoteLoading && !quote ? (
            <View style={{ marginTop: spacing.sm, gap: spacing.xs }}>
              <Skeleton height={36} width={160} />
              <Skeleton height={20} width={100} />
            </View>
          ) : (
            <View style={{ marginTop: spacing.md, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: spacing.sm }}>
              <FlashPrice
                value={quote?.regularMarketPrice}
                formatted={formatPrice(quote?.regularMarketPrice, quote?.currency)}
                variant="display"
                weight="extrabold"
                style={{ color: priceColor }}
              />
              <View style={{ gap: 4, alignItems: 'flex-end', paddingBottom: 3 }}>
                <Text variant="caption" weight="semibold" style={{ color: priceColor }}>
                  {formatSignedPrice(quote?.regularMarketChange)}
                </Text>
                <PriceChangeBadge changePercent={quote?.regularMarketChangePercent} />
              </View>
            </View>
          )}
          <QuoteFreshnessBadge quote={quote} />
          </Card>
        </View>

        <View style={{ paddingHorizontal: spacing.md, marginTop: spacing.lg }}>
          <StockChart
            points={chart?.points ?? []}
            range={range}
            onRangeChange={setRange}
            mode={mode}
            onModeChange={setMode}
            isLoading={chartLoading}
            positive={changeKey !== 'negative'}
          />
        </View>

        <View style={{ paddingHorizontal: spacing.md, marginTop: spacing.lg }}>
          <QuickActionGrid
            actions={[
              { label: t.tabs.watchlist, icon: isWatched ? 'star' : 'star-outline', color: isWatched ? colors.gold : colors.accent, onPress: toggleWatch },
              { label: t.home.addTrade, icon: 'swap-horizontal-outline', color: colors.positive, onPress: () => router.push({ pathname: '/add-transaction', params: { symbol } }) },
              { label: t.home.setAlert, icon: 'notifications-outline', color: colors.gold, onPress: () => router.push({ pathname: '/create-alert', params: { symbol } }) },
              { label: t.home.compare, icon: 'git-compare-outline', color: colors.accentTo, onPress: () => router.push('/compare') },
            ]}
          />
        </View>

        {rangePct !== undefined && (
          <View style={{ paddingHorizontal: spacing.md, marginTop: spacing.lg }}>
            <Text variant="caption" weight="semibold" color="secondary" style={{ marginBottom: spacing.xs }}>
              {t.stock.range52w}
            </Text>
            <Card elevated>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm }}>
                <View>
                  <Text variant="label" color="tertiary">{t.stock.low}</Text>
                  <Text variant="caption" weight="bold">{formatPrice(low)}</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text variant="label" color="tertiary">Konum</Text>
                  <Text variant="caption" weight="bold" color="accent">%{Math.round(rangePct)}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text variant="label" color="tertiary">{t.stock.high}</Text>
                  <Text variant="caption" weight="bold">{formatPrice(high)}</Text>
                </View>
              </View>
              <View style={{ height: 8, borderRadius: 4, backgroundColor: colors.bgCardAlt }}>
                <View style={{ width: `${Math.max(0, Math.min(100, rangePct))}%`, height: 8, borderRadius: 4, backgroundColor: colors.accent }} />
                <View
                  style={{
                    position: 'absolute',
                    left: `${Math.max(0, Math.min(100, rangePct))}%`,
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    backgroundColor: colors.textPrimary,
                    borderWidth: 4,
                    borderColor: colors.accent,
                    top: -4,
                    marginLeft: -8,
                  }}
                />
              </View>
            </Card>
          </View>
        )}

        <View style={{ paddingHorizontal: spacing.md, marginTop: spacing.lg }}>
          <Card padded={false} style={{ backgroundColor: 'transparent', borderWidth: 0 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
              <StatItem label={t.stock.open} value={formatPrice(quote?.regularMarketOpen)} />
              <StatItem label={t.stock.high} value={formatPrice(quote?.regularMarketDayHigh)} />
              <StatItem label={t.stock.low} value={formatPrice(quote?.regularMarketDayLow)} />
              <StatItem label={t.stock.prevClose} value={formatPrice(quote?.regularMarketPreviousClose)} />
              <StatItem label={t.stock.volume} value={compactNumber(quote?.regularMarketVolume)} />
              <StatItem label={t.stock.marketCap} value={compactNumber(quote?.marketCap)} />
              <StatItem label={t.stock.peRatio} value={quote?.trailingPE ? quote.trailingPE.toFixed(2) : '—'} />
            </View>
          </Card>
        </View>

        <View style={{ paddingHorizontal: spacing.md, marginTop: spacing.lg }}>
          <TechnicalSummary quote={quote} />
        </View>

        {symbol && (
          <View style={{ paddingHorizontal: spacing.md, marginTop: spacing.lg }}>
            <Text variant="caption" weight="semibold" color="secondary" style={{ marginBottom: spacing.xs }}>
              {t.pivot.title}
            </Text>
            <PivotPoints symbol={symbol} />
          </View>
        )}

        <View style={{ paddingHorizontal: spacing.md, marginTop: spacing.lg }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.xs }}>
            <Text variant="caption" weight="semibold" color="secondary">
              {t.stock.advancedStats}
            </Text>
            <Ionicons name="diamond" size={12} color={colors.gold} />
          </View>
          <PremiumGate>
            <Card padded={false} style={{ backgroundColor: 'transparent', borderWidth: 0 }}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
                <StatItem label={t.stock.forwardPE} value={quote?.forwardPE ? quote.forwardPE.toFixed(2) : '—'} />
                <StatItem label={t.stock.dividendYield} value={quote?.dividendYield ? `%${quote.dividendYield.toFixed(2)}` : '—'} />
                <StatItem label={t.stock.analystRating} value={quote?.averageAnalystRating ?? '—'} />
                <StatItem label={t.stock.day50Avg} value={formatPrice(quote?.fiftyDayAverage)} />
                <StatItem label={t.stock.day200Avg} value={formatPrice(quote?.twoHundredDayAverage)} />
                <StatItem label={t.stock.bidAsk} value={quote?.bid && quote?.ask ? `${formatPrice(quote.bid)} / ${formatPrice(quote.ask)}` : '—'} />
              </View>
            </Card>
          </PremiumGate>
        </View>

        {(news ?? []).length > 0 && (
          <View style={{ paddingHorizontal: spacing.md, marginTop: spacing.lg }}>
            <SectionHeader title={t.stock.news} />
            <Card padded={false}>
              {news!.slice(0, 5).map((item, i) => (
                <Pressable
                  key={item.id}
                  onPress={() => WebBrowser.openBrowserAsync(item.link).catch(() => {})}
                  style={{
                    padding: spacing.md,
                    borderBottomWidth: i < news!.length - 1 && i < 4 ? 1 : 0,
                    borderBottomColor: colors.borderSubtle,
                  gap: 7,
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                }}
              >
                  <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: i === 0 ? colors.accentSoft : colors.bgCardAlt, alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name={i === 0 ? 'flash' : 'newspaper-outline'} size={16} color={i === 0 ? colors.accent : colors.textSecondary} />
                  </View>
                  <View style={{ flex: 1, gap: 3 }}>
                    <Text variant="caption" weight="semibold" numberOfLines={2}>{item.title}</Text>
                    <Text variant="label" color="tertiary">{formatDateTime(item.publishedAt)}</Text>
                  </View>
                  <Ionicons name="open-outline" size={15} color={colors.textTertiary} style={{ marginTop: 9 }} />
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

function StatItem({ label, value }: { label: string; value: string }) {
  const { colors, spacing, radius } = useTheme();
  return (
    <View style={{ width: '48.7%', minHeight: 72, padding: spacing.sm, borderRadius: radius.md, backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border, justifyContent: 'center' }}>
      <Text variant="label" color="tertiary">
        {label}
      </Text>
      <Text variant="caption" weight="semibold" style={{ marginTop: 2 }}>
        {value}
      </Text>
    </View>
  );
}
