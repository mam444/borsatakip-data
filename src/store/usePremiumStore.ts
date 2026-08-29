import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Free-tier limits — VIP removes all of these caps. Kept in one place so the
// paywall copy and the actual gates never drift apart.
export const FREE_LIMITS = {
  maxWatchlists: 1,
  maxPortfolios: 1,
  maxAlerts: 3,
  minRefreshIntervalMs: 15000,
};

type PremiumState = {
  isPremium: boolean;
  purchasedAt: string | null;
  productId: string | null;
  setPremium: (productId: string) => void;
  clearPremium: () => void;
};

export const usePremiumStore = create<PremiumState>()(
  persist(
    (set) => ({
      isPremium: false,
      purchasedAt: null,
      productId: null,
      setPremium: (productId) => set({ isPremium: true, purchasedAt: new Date().toISOString(), productId }),
      clearPremium: () => set({ isPremium: false, purchasedAt: null, productId: null }),
    }),
    {
      name: 'borsatakip-premium',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
