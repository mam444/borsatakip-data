import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { PriceAlert } from '../store/useAlertsStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { usePremiumStore } from '../store/usePremiumStore';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const DEFAULT_CHANNEL_ID = 'price-alerts-default';
const VIP_CHANNEL_ID = 'price-alerts-vip';

// Two distinct Android notification channels so a VIP alert is felt as more
// urgent/premium than a free one — no bundled audio asset required (we don't
// have one to ship), but importance + a distinctive triple-pulse vibration
// pattern are a real, verifiable difference on-device. Channels are
// write-once on Android (settings can't be changed after creation without
// deleting/recreating), so this only needs to run once per app install.
let channelsReady: Promise<void> | null = null;

export function ensureNotificationChannels(): Promise<void> {
  if (Platform.OS !== 'android') return Promise.resolve();
  if (!channelsReady) {
    channelsReady = (async () => {
      await Notifications.setNotificationChannelAsync(DEFAULT_CHANNEL_ID, {
        name: 'Fiyat Alarmları',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250],
        sound: 'default',
      });
      await Notifications.setNotificationChannelAsync(VIP_CHANNEL_ID, {
        name: 'Fiyat Alarmları (VIP)',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 200, 100, 200, 100, 400],
        sound: 'default',
        lightColor: '#F5B94D',
      });
    })();
  }
  return channelsReady;
}

export async function ensureNotificationPermission(): Promise<boolean> {
  const settings = await Notifications.getPermissionsAsync();
  if (!settings.granted) {
    const req = await Notifications.requestPermissionsAsync();
    if (!req.granted) return false;
  }
  await ensureNotificationChannels();
  return true;
}

export async function notifyAlertTriggered(alert: PriceAlert, currentPrice: number) {
  if (!useSettingsStore.getState().notificationsEnabled) return;

  const language = useSettingsStore.getState().language;
  const isPremium = usePremiumStore.getState().isPremium;
  const symbol = alert.symbol.replace('.IS', '');

  const title = language === 'tr' ? `${symbol} fiyat alarmı` : `${symbol} price alert`;
  const body =
    language === 'tr'
      ? alert.condition === 'above'
        ? `${symbol} hedef fiyatın (${alert.targetPrice}) üzerine çıktı: ${currentPrice}`
        : `${symbol} hedef fiyatın (${alert.targetPrice}) altına indi: ${currentPrice}`
      : alert.condition === 'above'
        ? `${symbol} rose above your target of ${alert.targetPrice}: ${currentPrice}`
        : `${symbol} fell below your target of ${alert.targetPrice}: ${currentPrice}`;

  await ensureNotificationChannels();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: isPremium ? `💎 ${title}` : title,
      body,
      sound: Platform.OS === 'android' ? 'default' : true,
      priority: isPremium ? Notifications.AndroidNotificationPriority.MAX : Notifications.AndroidNotificationPriority.HIGH,
      ...(Platform.OS === 'android' ? { channelId: isPremium ? VIP_CHANNEL_ID : DEFAULT_CHANNEL_ID } : {}),
    },
    trigger: null,
  });
}

export function checkAlertCondition(alert: PriceAlert, currentPrice: number | undefined): boolean {
  if (currentPrice === undefined || !alert.active) return false;
  return alert.condition === 'above' ? currentPrice >= alert.targetPrice : currentPrice <= alert.targetPrice;
}
