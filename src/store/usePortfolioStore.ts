import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type TransactionType = 'buy' | 'sell';

export type Transaction = {
  id: string;
  symbol: string;
  type: TransactionType;
  quantity: number;
  price: number;
  fees: number;
  date: string; // ISO date
  note?: string;
};

export type Portfolio = {
  id: string;
  name: string;
  transactions: Transaction[];
};

type PortfolioState = {
  portfolios: Portfolio[];
  activePortfolioId: string;
  createPortfolio: (name: string) => string;
  renamePortfolio: (id: string, name: string) => void;
  deletePortfolio: (id: string) => void;
  setActivePortfolio: (id: string) => void;
  addTransaction: (portfolioId: string, tx: Omit<Transaction, 'id'>) => void;
  removeTransaction: (portfolioId: string, txId: string) => void;
};

const DEFAULT_PORTFOLIO_ID = 'default';

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set) => ({
      portfolios: [{ id: DEFAULT_PORTFOLIO_ID, name: 'Portföyüm', transactions: [] }],
      activePortfolioId: DEFAULT_PORTFOLIO_ID,
      createPortfolio: (name) => {
        const id = `portfolio-${Date.now()}`;
        set((s) => ({ portfolios: [...s.portfolios, { id, name, transactions: [] }] }));
        return id;
      },
      renamePortfolio: (id, name) =>
        set((s) => ({
          portfolios: s.portfolios.map((p) => (p.id === id ? { ...p, name } : p)),
        })),
      deletePortfolio: (id) =>
        set((s) => {
          const remaining = s.portfolios.filter((p) => p.id !== id);
          const nextActive =
            s.activePortfolioId === id ? remaining[0]?.id ?? DEFAULT_PORTFOLIO_ID : s.activePortfolioId;
          return { portfolios: remaining.length ? remaining : s.portfolios, activePortfolioId: nextActive };
        }),
      setActivePortfolio: (id) => set({ activePortfolioId: id }),
      addTransaction: (portfolioId, tx) =>
        set((s) => ({
          portfolios: s.portfolios.map((p) =>
            p.id === portfolioId
              ? { ...p, transactions: [...p.transactions, { ...tx, id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` }] }
              : p
          ),
        })),
      removeTransaction: (portfolioId, txId) =>
        set((s) => ({
          portfolios: s.portfolios.map((p) =>
            p.id === portfolioId
              ? { ...p, transactions: p.transactions.filter((t) => t.id !== txId) }
              : p
          ),
        })),
    }),
    {
      name: 'borsatakip-portfolio',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
