import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MAX_HISTORY = 10;

type SearchHistoryState = {
  recent: string[];
  addRecent: (symbol: string) => void;
  clearRecent: () => void;
};

export const useSearchHistoryStore = create<SearchHistoryState>()(
  persist(
    (set) => ({
      recent: [],
      addRecent: (symbol) =>
        set((s) => ({
          recent: [symbol, ...s.recent.filter((x) => x !== symbol)].slice(0, MAX_HISTORY),
        })),
      clearRecent: () => set({ recent: [] }),
    }),
    {
      name: 'borsatakip-search-history',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
