import React, { useMemo, useState } from 'react';
import { View, ScrollView, Pressable, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useT } from '../../src/i18n/I18nContext';
import { Text } from '../../src/components/Text';
import { Card } from '../../src/components/Card';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { SectionHeader } from '../../src/components/SectionHeader';
import { MiniTickerCard } from '../../src/components/MiniTickerCard';
import { StockListRow } from '../../src/components/StockListRow';
import { AdBanner } from '../../src/components/AdBanner';
import { MarketPulseCard } from '../../src/components/MarketPulseCard';
import { MarketVisualCard } from '../../src/components/MarketVisualCard';
import { DataSourceBadge } from '../../src/components/DataSourceBadge';
import { useQuotes } from '../../src/hooks/useQuotes';
import { useSparklines } from '../../src/hooks/useSparklines';
import { INDICES, FOREX, CRYPTO, COMMODITIES, FUNDS, BIST30, GLOBAL_POPULAR } from '../../src/constants/symbols';
import { changeColorKey } from '../../src/utils/format';

type Tab = 'gainers' | 'losers' | 'active' | 'heatmap';
type AssetCategory = 'indices' | 'forex' | 'crypto' | 'commodities' | 'funds';

export default function MarketsScreen() {
  const { colors, spacing, radius } = useTheme();
  const t = useT();
  const insets = useSafeAreaInsets();

  const indexSymbols = useMemo(() => INDICES.map((i) => i.symbol), []);
  const { data: indexQuotes, isLoading: indicesLoading } = useQuotes(indexSymbols);

  const fxSymbols = useMemo(() => FOREX.map((f) => f.symbol), []);
  const { data: fxQuotes, isLoading: fxLoading } = useQuotes(fxSymbols);
  const cryptoSymbols = useMemo(() => CRYPTO.map((item) => item.symbol), []);
  const { data: cryptoQuotes, isLoading: cryptoLoading } = useQuotes(cryptoSymbols);
  const commoditySymbols = useMemo(() => COMMODITIES.map((item) => item.symbol), []);
  const { data: commodityQuotes, isLoading: commodityLoading } = useQuotes(commoditySymbols);
  const fundSymbols = useMemo(() => FUNDS.map((item) => item.symbol), []);
  const { data: fundQuotes, isLoading: fundLoading } = useQuotes(fundSymbols);
  const [assetCategory, setAssetCategory] = useState<AssetCategory>('indices');

  const [universe, setUniverse] = useState<'BIST' | 'GLOBAL'>('BIST');
  const universeList = universe === 'BIST' ? BIST30 : GLOBAL_POPULAR;
  const universeSymbols = useMemo(() => universeList.map((s) => s.symbol), [universeList]);
  const { data: universeQuotes } = useQuotes(universeSymbols);

  const [tab, setTab] = useState<Tab>('gainers');

  const categoryMeta = assetCategory === 'indices' ? INDICES : assetCategory === 'forex' ? FOREX : assetCategory === 'crypto' ? CRYPTO : assetCategory === 'commodities' ? COMMODITIES : FUNDS;
  const categoryQuotes = assetCategory === 'indices' ? indexQuotes : assetCategory === 'forex' ? fxQuotes : assetCategory === 'crypto' ? cryptoQuotes : assetCategory === 'commodities' ? commodityQuotes : fundQuotes;
  const categoryLoading = assetCategory === 'indices' ? indicesLoading : assetCategory === 'forex' ? fxLoading : assetCategory === 'crypto' ? cryptoLoading : assetCategory === 'commodities' ? commodityLoading : fundLoading;

  const sorted = useMemo(() => {
    const withChange = (universeQuotes ?? []).filter((q) => q.regularMarketChangePercent !== undefined);
    return [...withChange].sort((a, b) => (b.regularMarketChangePercent ?? 0) - (a.regularMarketChangePercent ?? 0));
  }, [universeQuotes]);

  const byVolume = useMemo(
    () => [...(universeQuotes ?? [])].sort((a, b) => (b.regularMarketVolume ?? 0) - (a.regularMarketVolume ?? 0)),
    [universeQuotes]
  );

  const list = tab === 'gainers' ? sorted.slice(0, 10) : tab === 'losers' ? sorted.slice(-10).reverse() : byVolume.slice(0, 10);
  const listSymbols = useMemo(() => list.map((q) => q.symbol), [list]);
  const listSparklines = useSparklines(listSymbols);

  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['quotes'] });
    setRefreshing(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + spacing.sm, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
      >
        <ScreenHeader
          title={t.tabs.markets}
          actions={[
            { icon: 'funnel-outline', onPress: () => router.push('/scanner') },
            { icon: 'git-compare-outline', onPress: () => router.push('/compare') },
            { icon: 'time-outline', onPress: () => router.push('/market-hours') },
          ]}
        />

        <View style={{ paddingHorizontal: spacing.md, marginBottom: spacing.md }}>
          <DataSourceBadge />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: spacing.md, gap: spacing.sm }}>
          <MarketVisualCard source={require('../../assets/market-world-v1.png')} title={t.markets.worldMarkets} subtitle={`${INDICES.length} ${t.markets.majorIndices}`} icon="globe-outline" quote={indexQuotes?.find((q) => q.symbol === '^GSPC') ?? indexQuotes?.[0]} active={assetCategory === 'indices'} onPress={() => setAssetCategory('indices')} />
          <MarketVisualCard source={require('../../assets/market-fx-v1.png')} title={t.markets.forex} subtitle={`${FOREX.length} ${t.markets.currencyPairs}`} icon="swap-horizontal-outline" quote={fxQuotes?.find((q) => q.symbol === 'USDTRY=X') ?? fxQuotes?.[0]} active={assetCategory === 'forex'} onPress={() => setAssetCategory('forex')} />
          <MarketVisualCard source={require('../../assets/market-crypto-v1.png')} title={t.markets.crypto} subtitle={`${CRYPTO.length} ${t.markets.digitalAssets}`} icon="cube-outline" quote={cryptoQuotes?.find((q) => q.symbol === 'BTC-USD') ?? cryptoQuotes?.[0]} active={assetCategory === 'crypto'} onPress={() => setAssetCategory('crypto')} />
          <MarketVisualCard source={require('../../assets/market-commodities-v1.png')} title={t.markets.commodities} subtitle={`${COMMODITIES.length} ${t.markets.contracts}`} icon="diamond-outline" quote={commodityQuotes?.find((q) => q.symbol === 'GC=F') ?? commodityQuotes?.[0]} active={assetCategory === 'commodities'} onPress={() => setAssetCategory('commodities')} />
          <MarketVisualCard source={require('../../assets/market-funds-v1.png')} title={t.markets.funds} subtitle={`${FUNDS.length} ${t.markets.fundAssets}`} icon="layers-outline" quote={fundQuotes?.find((q) => q.symbol === 'SPY') ?? fundQuotes?.[0]} active={assetCategory === 'funds'} onPress={() => setAssetCategory('funds')} />
        </ScrollView>

        <View style={{ paddingHorizontal: spacing.md, marginTop: spacing.lg }}>
          <SectionHeader eyebrow={t.markets.marketUniverse} title={assetCategory === 'indices' ? t.markets.indices : assetCategory === 'forex' ? t.markets.forex : assetCategory === 'crypto' ? t.markets.crypto : assetCategory === 'commodities' ? t.markets.commodities : t.markets.funds} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.md, gap: spacing.sm }}>
          {categoryLoading && !categoryQuotes
            ? Array.from({ length: 4 }).map((_, i) => <MiniTickerCard key={i} label="" loading />)
            : categoryMeta.map((item) => {
                const q = categoryQuotes?.find((x) => x.symbol === item.symbol);
                return (
                  <MiniTickerCard
                    key={item.symbol}
                    symbol={item.symbol}
                    label={item.shortName}
                    icon={'flag' in item ? item.flag : item.icon}
                    price={q?.regularMarketPrice}
                    changePercent={q?.regularMarketChangePercent}
                  />
                );
              })}
        </ScrollView>

        <View style={{ paddingHorizontal: spacing.md, marginTop: spacing.lg, flexDirection: 'row', gap: spacing.xs }}>
          {(['BIST', 'GLOBAL'] as const).map((u) => (
            <Pressable
              key={u}
              onPress={() => setUniverse(u)}
              style={{
                paddingHorizontal: spacing.md,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: universe === u ? colors.accentSoft : colors.bgCard,
                borderWidth: 1,
                borderColor: universe === u ? colors.accent : colors.border,
              }}
            >
              <Text variant="caption" weight="semibold" style={{ color: universe === u ? colors.accent : colors.textSecondary }}>
                {u === 'BIST' ? 'BIST 30' : 'Global'}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={{ paddingHorizontal: spacing.md, marginTop: spacing.md }}>
          <MarketPulseCard
            quotes={universeQuotes}
            title={t.markets.overview}
            subtitle={t.markets.overviewSubtitle}
            averageLabel={t.home.averageMove}
            advancingLabel={t.home.advancing}
            decliningLabel={t.home.declining}
          />
        </View>

        <View
          style={{
            marginHorizontal: spacing.md,
            marginTop: spacing.md,
            flexDirection: 'row',
            padding: 4,
            gap: 4,
            borderRadius: radius.md,
            backgroundColor: colors.bgCard,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          {([
            ['gainers', t.markets.gainers],
            ['losers', t.markets.losers],
            ['active', t.markets.mostActive],
          ] as [Tab, string][]).map(([key, label]) => (
            <Pressable
              key={key}
              onPress={() => setTab(key)}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 4,
                paddingVertical: 9,
                borderRadius: radius.sm,
                backgroundColor: tab === key ? colors.accentSoft : 'transparent',
              }}
            >
              <Text variant="label" weight={tab === key ? 'bold' : 'medium'} color={tab === key ? 'accent' : 'tertiary'} numberOfLines={1}>
                {label}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={{ paddingHorizontal: spacing.md, marginTop: spacing.sm }}>
          <Card padded={false}>
            {list.map((q) => (
              <StockListRow
                key={q.symbol}
                symbol={q.symbol}
                name={q.shortName}
                price={q.regularMarketPrice}
                changePercent={q.regularMarketChangePercent}
                sparklineData={listSparklines.get(q.symbol)}
              />
            ))}
          </Card>
        </View>

        <View style={{ paddingHorizontal: spacing.md, marginTop: spacing.lg }}>
          <SectionHeader eyebrow="Sektörler" title={t.markets.heatmap} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {universeList.map((s) => {
              const q = universeQuotes?.find((x) => x.symbol === s.symbol);
              const key = changeColorKey(q?.regularMarketChangePercent);
              const bg = key === 'positive' ? colors.positiveSoft : key === 'negative' ? colors.negativeSoft : colors.bgCardAlt;
              const fg = key === 'positive' ? colors.positive : key === 'negative' ? colors.negative : colors.textTertiary;
              const magnitude = Math.min(1, Math.abs(q?.regularMarketChangePercent ?? 0) / 5);
              return (
                <Pressable
                  key={s.symbol}
                  onPress={() => router.push(`/stock/${encodeURIComponent(s.symbol)}`)}
                  style={{
                    width: '31%',
                    backgroundColor: bg,
                    borderRadius: radius.md,
                    borderWidth: 1,
                    borderColor: fg + (magnitude > 0.55 ? '55' : '24'),
                    paddingVertical: 12,
                    paddingHorizontal: 6,
                    alignItems: 'flex-start',
                    gap: 3,
                  }}
                >
                  <Text variant="caption" weight="extrabold" numberOfLines={1}>
                    {s.symbol.replace('.IS', '')}
                  </Text>
                  <Text variant="label" color="tertiary" numberOfLines={1} style={{ width: '100%' }}>
                    {s.sector ?? s.exchange}
                  </Text>
                  <Text variant="caption" weight="bold" style={{ color: fg, marginTop: 3 }}>
                    {q?.regularMarketChangePercent !== undefined ? `${q.regularMarketChangePercent > 0 ? '+' : ''}${q.regularMarketChangePercent.toFixed(2)}%` : '—'}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <AdBanner style={{ marginTop: spacing.lg, marginHorizontal: spacing.md }} />
      </ScrollView>
    </View>
  );
}
