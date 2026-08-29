import React, { useEffect, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useTheme } from '../src/theme/ThemeProvider';
import { useT } from '../src/i18n/I18nContext';
import { Text } from '../src/components/Text';
import { Card } from '../src/components/Card';
import { ModalHeader } from '../src/components/ModalHeader';
import { VisualHeaderBanner } from '../src/components/VisualHeaderBanner';

type Exchange = {
  id: string;
  name: string;
  city: string;
  flag: string;
  timeZone: string;
  openMin: number; // minutes since local midnight
  closeMin: number;
  sessions?: [number, number][];
  tradingDays?: string[];
};

const EXCHANGES: Exchange[] = [
  { id: 'bist', name: 'Borsa İstanbul', city: 'İstanbul', flag: '🇹🇷', timeZone: 'Europe/Istanbul', openMin: 10 * 60, closeMin: 18 * 60 },
  { id: 'nyse', name: 'NYSE / NASDAQ', city: 'New York', flag: '🇺🇸', timeZone: 'America/New_York', openMin: 9 * 60 + 30, closeMin: 16 * 60 },
  { id: 'lse', name: 'London Stock Exchange', city: 'Londra', flag: '🇬🇧', timeZone: 'Europe/London', openMin: 8 * 60, closeMin: 16 * 60 + 30 },
  { id: 'xetra', name: 'Xetra (DAX)', city: 'Frankfurt', flag: '🇩🇪', timeZone: 'Europe/Berlin', openMin: 9 * 60, closeMin: 17 * 60 + 30 },
  { id: 'euronext', name: 'Euronext Paris', city: 'Paris', flag: '🇫🇷', timeZone: 'Europe/Paris', openMin: 9 * 60, closeMin: 17 * 60 + 30 },
  { id: 'six', name: 'SIX Swiss Exchange', city: 'Zürih', flag: '🇨🇭', timeZone: 'Europe/Zurich', openMin: 9 * 60, closeMin: 17 * 60 + 30 },
  { id: 'bme', name: 'Bolsa de Madrid', city: 'Madrid', flag: '🇪🇸', timeZone: 'Europe/Madrid', openMin: 9 * 60, closeMin: 17 * 60 + 30 },
  { id: 'milan', name: 'Euronext Milan', city: 'Milano', flag: '🇮🇹', timeZone: 'Europe/Rome', openMin: 9 * 60, closeMin: 17 * 60 + 30 },
  { id: 'tsx', name: 'Toronto Stock Exchange', city: 'Toronto', flag: '🇨🇦', timeZone: 'America/Toronto', openMin: 9 * 60 + 30, closeMin: 16 * 60 },
  { id: 'b3', name: 'B3 Bovespa', city: 'São Paulo', flag: '🇧🇷', timeZone: 'America/Sao_Paulo', openMin: 10 * 60, closeMin: 17 * 60 + 55 },
  { id: 'tse', name: 'Tokyo Stock Exchange', city: 'Tokyo', flag: '🇯🇵', timeZone: 'Asia/Tokyo', openMin: 9 * 60, closeMin: 15 * 60 + 30, sessions: [[9 * 60, 11 * 60 + 30], [12 * 60 + 30, 15 * 60 + 30]] },
  { id: 'sse', name: 'Shanghai Stock Exchange', city: 'Şangay', flag: '🇨🇳', timeZone: 'Asia/Shanghai', openMin: 9 * 60 + 30, closeMin: 15 * 60, sessions: [[9 * 60 + 30, 11 * 60 + 30], [13 * 60, 15 * 60]] },
  { id: 'hkex', name: 'Hong Kong Exchange', city: 'Hong Kong', flag: '🇭🇰', timeZone: 'Asia/Hong_Kong', openMin: 9 * 60 + 30, closeMin: 16 * 60, sessions: [[9 * 60 + 30, 12 * 60], [13 * 60, 16 * 60]] },
  { id: 'krx', name: 'Korea Exchange', city: 'Seul', flag: '🇰🇷', timeZone: 'Asia/Seoul', openMin: 9 * 60, closeMin: 15 * 60 + 30 },
  { id: 'nse', name: 'NSE / BSE', city: 'Mumbai', flag: '🇮🇳', timeZone: 'Asia/Kolkata', openMin: 9 * 60 + 15, closeMin: 15 * 60 + 30 },
  { id: 'asx', name: 'Australian Securities Exchange', city: 'Sydney', flag: '🇦🇺', timeZone: 'Australia/Sydney', openMin: 10 * 60, closeMin: 16 * 60 },
  { id: 'sgx', name: 'Singapore Exchange', city: 'Singapur', flag: '🇸🇬', timeZone: 'Asia/Singapore', openMin: 9 * 60, closeMin: 17 * 60, sessions: [[9 * 60, 12 * 60], [13 * 60, 17 * 60]] },
  { id: 'tadawul', name: 'Saudi Exchange', city: 'Riyad', flag: '🇸🇦', timeZone: 'Asia/Riyadh', openMin: 10 * 60, closeMin: 15 * 60, tradingDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'] },
  { id: 'jse', name: 'Johannesburg Stock Exchange', city: 'Johannesburg', flag: '🇿🇦', timeZone: 'Africa/Johannesburg', openMin: 9 * 60, closeMin: 17 * 60 },
];

function formatHm(min: number): string {
  const h = Math.floor(min / 60) % 24;
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function statusFor(ex: Exchange, nowMs: number) {
  const date = new Date(nowMs);
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: ex.timeZone, weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? '';
  const hour = Number(value('hour')) % 24;
  const minute = Number(value('minute'));
  const minutes = hour * 60 + minute;
  const tradingDays = ex.tradingDays ?? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const isTradingDay = tradingDays.includes(value('weekday'));
  const sessions = ex.sessions ?? [[ex.openMin, ex.closeMin]];
  const isOpen = isTradingDay && sessions.some(([start, end]) => minutes >= start && minutes < end);
  return { isOpen, localHm: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}` };
}

export default function MarketHoursScreen() {
  const { colors, spacing, radius } = useTheme();
  const t = useT();

  const [nowMs, setNowMs] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ModalHeader title={t.marketHours.title} eyebrow="Dünya Piyasaları" subtitle="Başlıca borsaların yerel saati ve anlık işlem durumu." />
      <VisualHeaderBanner source={require('../assets/market-world-v1.png')} eyebrow="Global Seanslar" title="Hangi borsa şimdi açık?" icon="time-outline" />

      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 60, gap: spacing.sm }}>
        {EXCHANGES.map((ex) => {
          const { isOpen, localHm } = statusFor(ex, nowMs);
          return (
            <Card key={ex.id} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <Text style={{ fontSize: 26 }}>{ex.flag}</Text>
              <View style={{ flex: 1 }}>
                <Text variant="body" weight="bold">
                  {ex.name}
                </Text>
                <Text variant="label" color="tertiary">
                  {ex.city} · {t.marketHours.localTime} {localHm}
                </Text>
                <Text variant="label" color="tertiary" style={{ marginTop: 2 }}>
                  {t.marketHours.opensAt} {formatHm(ex.openMin)} · {t.marketHours.closesAt} {formatHm(ex.closeMin)}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 5,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: radius.pill,
                  backgroundColor: isOpen ? colors.positiveSoft : colors.bgCardAlt,
                }}
              >
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: isOpen ? colors.positive : colors.textTertiary }} />
                <Text variant="label" weight="bold" style={{ color: isOpen ? colors.positive : colors.textTertiary }}>
                  {isOpen ? t.marketHours.open : t.marketHours.closed}
                </Text>
              </View>
            </Card>
          );
        })}

        <Text variant="label" color="tertiary" style={{ textAlign: 'center', marginTop: spacing.md }}>
          {t.marketHours.disclaimer}
        </Text>
      </ScrollView>
    </View>
  );
}
