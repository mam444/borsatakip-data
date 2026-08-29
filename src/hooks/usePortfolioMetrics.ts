import { useMemo } from 'react';
import { usePortfolioStore } from '../store/usePortfolioStore';
import { useQuotes } from './useQuotes';
import { useUsdTryRate } from './useExchangeRate';
import { computeHoldings, attachMarketData, summarizePortfolio } from '../utils/portfolioMath';

export function usePortfolioMetrics(portfolioId: string) {
  const portfolio = usePortfolioStore((s) => s.portfolios.find((p) => p.id === portfolioId));
  const transactions = portfolio?.transactions ?? [];

  const baseHoldings = useMemo(() => computeHoldings(transactions), [transactions]);
  const symbols = useMemo(() => baseHoldings.map((h) => h.symbol), [baseHoldings]);

  const { data: quotes, isLoading } = useQuotes(symbols);
  const usdTryRate = useUsdTryRate();

  const quotesBySymbol = useMemo(() => {
    const map = new Map<string, { price?: number; changePercent?: number; currency?: string }>();
    for (const q of quotes ?? []) {
      map.set(q.symbol, { price: q.regularMarketPrice, changePercent: q.regularMarketChangePercent, currency: q.currency });
    }
    return map;
  }, [quotes]);

  const holdings = useMemo(
    () => attachMarketData(baseHoldings, quotesBySymbol, usdTryRate),
    [baseHoldings, quotesBySymbol, usdTryRate]
  );
  const summary = useMemo(() => summarizePortfolio(holdings, usdTryRate), [holdings, usdTryRate]);

  return { holdings, summary, isLoading, transactions, usdTryRate };
}
