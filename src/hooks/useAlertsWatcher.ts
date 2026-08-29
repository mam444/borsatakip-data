import { useEffect } from 'react';
import { useAlertsStore } from '../store/useAlertsStore';
import { useQuotes } from './useQuotes';
import { checkAlertCondition, notifyAlertTriggered } from '../services/alerts';
import { useSettingsStore } from '../store/useSettingsStore';

// Foreground-only trigger check: polls active alert symbols alongside normal
// quote refresh and fires a local notification the moment a condition is met.
// True background delivery would need a paid push backend; out of scope for v1.
export function useAlertsWatcher() {
  const alerts = useAlertsStore((s) => s.alerts);
  const markTriggered = useAlertsStore((s) => s.markTriggered);
  const activeAlerts = alerts.filter((a) => a.active);
  const notificationsEnabled = useSettingsStore((s) => s.notificationsEnabled);
  const symbols = Array.from(new Set(activeAlerts.map((a) => a.symbol)));

  const { data: quotes } = useQuotes(symbols);

  useEffect(() => {
    if (!quotes || !notificationsEnabled) return;
    const priceBySymbol = new Map(quotes.map((q) => [q.symbol, q.regularMarketPrice]));

    for (const alert of activeAlerts) {
      const price = priceBySymbol.get(alert.symbol);
      if (checkAlertCondition(alert, price)) {
        markTriggered(alert.id);
        notifyAlertTriggered(alert, price as number).catch(() => {});
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quotes, notificationsEnabled]);
}
