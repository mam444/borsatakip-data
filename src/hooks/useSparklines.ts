import { useQueries } from '@tanstack/react-query';
import { getChart } from '../services/yahooFinance';

// One lightweight chart request per symbol, cached for 5 minutes — sparklines are a
// trend indicator, not a real-time feed, so they don't need to track the quote poll rate.
export function useSparklines(symbols: string[]) {
  const results = useQueries({
    queries: symbols.map((symbol) => ({
      queryKey: ['sparkline', symbol],
      queryFn: () => getChart(symbol, '1D'),
      staleTime: 5 * 60_000,
      enabled: !!symbol,
    })),
  });

  const bySymbol = new Map<string, number[]>();
  results.forEach((r, i) => {
    const points = (r.data as any)?.points ?? [];
    bySymbol.set(symbols[i], points.map((p: any) => p.close));
  });
  return bySymbol;
}
