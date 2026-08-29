import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type WatchlistList = {
  id: string;
  name: string;
  symbols: string[];
};

type WatchlistState = {
  lists: WatchlistList[];
  activeListId: string;
  createList: (name: string) => string;
  renameList: (id: string, name: string) => void;
  deleteList: (id: string) => void;
  setActiveList: (id: string) => void;
  addSymbol: (listId: string, symbol: string) => void;
  removeSymbol: (listId: string, symbol: string) => void;
  reorderSymbols: (listId: string, symbols: string[]) => void;
  isInAnyList: (symbol: string) => boolean;
};

const DEFAULT_LIST_ID = 'default';

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      lists: [
        { id: DEFAULT_LIST_ID, name: 'İzleme Listem', symbols: ['THYAO.IS', 'AAPL', 'GARAN.IS', 'MSFT'] },
      ],
      activeListId: DEFAULT_LIST_ID,
      createList: (name) => {
        const id = `list-${Date.now()}`;
        set((s) => ({ lists: [...s.lists, { id, name, symbols: [] }] }));
        return id;
      },
      renameList: (id, name) =>
        set((s) => ({ lists: s.lists.map((l) => (l.id === id ? { ...l, name } : l)) })),
      deleteList: (id) =>
        set((s) => {
          const remaining = s.lists.filter((l) => l.id !== id);
          const nextActive = s.activeListId === id ? remaining[0]?.id ?? DEFAULT_LIST_ID : s.activeListId;
          return { lists: remaining.length ? remaining : s.lists, activeListId: nextActive };
        }),
      setActiveList: (id) => set({ activeListId: id }),
      addSymbol: (listId, symbol) =>
        set((s) => ({
          lists: s.lists.map((l) =>
            l.id === listId && !l.symbols.includes(symbol)
              ? { ...l, symbols: [...l.symbols, symbol] }
              : l
          ),
        })),
      removeSymbol: (listId, symbol) =>
        set((s) => ({
          lists: s.lists.map((l) =>
            l.id === listId ? { ...l, symbols: l.symbols.filter((sym) => sym !== symbol) } : l
          ),
        })),
      reorderSymbols: (listId, symbols) =>
        set((s) => ({
          lists: s.lists.map((l) => (l.id === listId ? { ...l, symbols } : l)),
        })),
      isInAnyList: (symbol) => get().lists.some((l) => l.symbols.includes(symbol)),
    }),
    {
      name: 'borsatakip-watchlist',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
