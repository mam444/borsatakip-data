import React from 'react';
import { View, ScrollView, Pressable, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useTheme } from '../src/theme/ThemeProvider';
import { useT } from '../src/i18n/I18nContext';
import { Text } from '../src/components/Text';
import { Card } from '../src/components/Card';
import { Skeleton } from '../src/components/Skeleton';
import { useMarketNews } from '../src/hooks/useNews';
import { formatDateTime } from '../src/utils/format';
import { EditorialStory } from '../src/components/EditorialStory';
import { ModalHeader } from '../src/components/ModalHeader';
import { VisualHeaderBanner } from '../src/components/VisualHeaderBanner';

export default function NewsScreen() {
  const { colors, spacing } = useTheme();
  const t = useT();
  const { data: news, isLoading, refetch, isRefetching } = useMarketNews();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ModalHeader title={t.home.latestNews} eyebrow="Piyasa Gündemi" subtitle="Küresel piyasaları etkileyen son gelişmeler." />
      <VisualHeaderBanner source={require('../assets/market-world-v1.png')} eyebrow="Borsa Gündemi" title="Fiyatın arkasındaki hikâyeyi oku" icon="newspaper-outline" />

      <ScrollView
        contentContainerStyle={{ padding: spacing.md, paddingBottom: 60 }}
        refreshControl={<RefreshControl refreshing={isRefetching && !isLoading} onRefresh={refetch} tintColor={colors.accent} />}
      >
        {isLoading && !news ? (
          <View style={{ gap: spacing.sm }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} height={64} radius={14} />
            ))}
          </View>
        ) : (
          <>
          {!!news?.[0] && (
            <EditorialStory
              title={news[0].title}
              summary={news[0].summary}
              source={news[0].source}
              onPress={() => WebBrowser.openBrowserAsync(news[0].link).catch(() => {})}
            />
          )}
          <Card padded={false} style={{ marginTop: spacing.md }}>
            {(news ?? []).slice(1).map((item, i) => (
              <Pressable
                key={item.id}
                onPress={() => WebBrowser.openBrowserAsync(item.link).catch(() => {})}
                style={{
                  padding: spacing.md,
                  borderBottomWidth: i < (news?.length ?? 0) - 2 ? 1 : 0,
                  borderBottomColor: colors.borderSubtle,
                  gap: 5,
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                }}
              >
                <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="newspaper-outline" size={17} color={colors.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="body" weight="semibold" numberOfLines={2}>{item.title}</Text>
                  {!!item.summary && <Text variant="caption" color="secondary" numberOfLines={2} style={{ marginTop: 3 }}>{item.summary}</Text>}
                  <Text variant="label" color="tertiary" style={{ marginTop: 4 }}>{item.source} · {formatDateTime(item.publishedAt)}</Text>
                </View>
                <Ionicons name="arrow-up" size={15} color={colors.textTertiary} style={{ transform: [{ rotate: '45deg' }], marginTop: 10 }} />
              </Pressable>
            ))}
          </Card>
          </>
        )}
      </ScrollView>
    </View>
  );
}
