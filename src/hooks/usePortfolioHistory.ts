import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { getChart } from '../services/yahooFinance';
import { computePortfolioHistory, PortfolioHistoryPoint } from '../utils/portfolioHistory';
import { useUsdTryRate } from './useExchangeRate';
import type { Transaction } from '../store/usePortfolioStore';
import type { ChartRange } from '../constants/symbols';

export function usePortfolioHistory(transactions: Transaction[], symbols: string[], range: ChartRange) {
  const usdTryRate = useUsdTryRate();

  const results = useQueries({
    queries: symbols.map((symbol) => ({
      queryKey: ['portfolio-history-chart', symbol, range],
      queryFn: () => getChart(symbol, range),
      staleTime: 5 * 60_000,
      enabled: !!symbol,
    })),
  });

  const isLoading = results.some((r) => r.isLoading);

  const transactionsBySymbol = useMemo(() => {
    const map: Record<string, Transaction[]> = {};
    for (const tx of transactions) {
      (map[tx.symbol] ??= []).push(tx);
    }
    for (const key of Object.keys(map)) {
      map[key].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
    return map;
  }, [transactions]);

  const chartsBySymbol = useMemo(() => {
    const map: Record<string, { points: any[]; currency?: string }> = {};
    results.forEach((r, i) => {
      const data = r.data as any;
      if (data?.points?.length) {
        map[symbols[i]] = { points: data.points, currency: data.currency };
      }
    });
    return map;
  }, [results, symbols]);

  const history: PortfolioHistoryPoint[] = useMemo(
    () => computePortfolioHistory(transactionsBySymbol, chartsBySymbol, usdTryRate),
    [transactionsBySymbol, chartsBySymbol, usdTryRate]
  );

  return { history, isLoading };
}
