import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AlertCondition = 'above' | 'below';

export type PriceAlert = {
  id: string;
  symbol: string;
  condition: AlertCondition;
  targetPrice: number;
  createdAt: string;
  triggeredAt?: string;
  active: boolean;
};

type AlertsState = {
  alerts: PriceAlert[];
  addAlert: (alert: Omit<PriceAlert, 'id' | 'createdAt' | 'active'>) => void;
  removeAlert: (id: string) => void;
  markTriggered: (id: string) => void;
  toggleActive: (id: string) => void;
};

export const useAlertsStore = create<AlertsState>()(
  persist(
    (set) => ({
      alerts: [],
      addAlert: (alert) =>
        set((s) => ({
          alerts: [
            ...s.alerts,
            {
              ...alert,
              id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              createdAt: new Date().toISOString(),
              active: true,
            },
          ],
        })),
      removeAlert: (id) => set((s) => ({ alerts: s.alerts.filter((a) => a.id !== id) })),
      markTriggered: (id) =>
        set((s) => ({
          alerts: s.alerts.map((a) =>
            a.id === id ? { ...a, active: false, triggeredAt: new Date().toISOString() } : a
          ),
        })),
      toggleActive: (id) =>
        set((s) => ({
          alerts: s.alerts.map((a) => (a.id === id ? { ...a, active: !a.active } : a)),
        })),
    }),
    {
      name: 'borsatakip-alerts',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
