import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';
import { getQuotes } from './marketData';
import { notifyAlertTriggered, checkAlertCondition, ensureNotificationPermission } from './alerts';
import { useAlertsStore } from '../store/useAlertsStore';

export const ALERTS_BACKGROUND_TASK = 'borsatakip-price-alerts-background';

if (Platform.OS !== 'web') TaskManager.defineTask(ALERTS_BACKGROUND_TASK, async () => {
  try {
    // Give Zustand persistence a moment to hydrate in a headless JS context.
    await new Promise((resolve) => setTimeout(resolve, 250));
    const state = useAlertsStore.getState();
    const activeAlerts = state.alerts.filter((alert) => alert.active);
    if (!activeAlerts.length) return BackgroundFetch.BackgroundFetchResult.NoData;

    const permission = await ensureNotificationPermission();
    if (!permission) return BackgroundFetch.BackgroundFetchResult.NoData;

    const quotes = await getQuotes(Array.from(new Set(activeAlerts.map((alert) => alert.symbol))));
    const priceBySymbol = new Map(quotes.map((quote) => [quote.symbol, quote.regularMarketPrice]));
    let triggered = false;
    for (const alert of activeAlerts) {
      const price = priceBySymbol.get(alert.symbol);
      if (checkAlertCondition(alert, price)) {
        await notifyAlertTriggered(alert, price as number);
        state.markTriggered(alert.id);
        triggered = true;
      }
    }
    return triggered ? BackgroundFetch.BackgroundFetchResult.NewData : BackgroundFetch.BackgroundFetchResult.NoData;
  } catch {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registerAlertsBackgroundTask() {
  if (Platform.OS === 'web') return;
  const status = await BackgroundFetch.getStatusAsync();
  if (status === BackgroundFetch.BackgroundFetchStatus.Restricted || status === BackgroundFetch.BackgroundFetchStatus.Denied) return;
  const registered = await TaskManager.isTaskRegisteredAsync(ALERTS_BACKGROUND_TASK);
  if (!registered) {
    await BackgroundFetch.registerTaskAsync(ALERTS_BACKGROUND_TASK, {
      minimumInterval: 15 * 60,
      stopOnTerminate: false,
      startOnBoot: true,
    });
  }
}
