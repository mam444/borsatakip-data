import { useQuery } from '@tanstack/react-query';
import { getQuotes, Quote } from '../services/marketData';
import { useSettingsStore } from '../store/useSettingsStore';

export function useQuotes(symbols: string[]) {
  const refreshIntervalMs = useSettingsStore((s) => s.refreshIntervalMs);
  const key = [...symbols].sort().join(',');

  return useQuery<Quote[]>({
    queryKey: ['quotes', key],
    queryFn: () => getQuotes(symbols),
    enabled: symbols.length > 0,
    refetchInterval: refreshIntervalMs,
    staleTime: 5000,
  });
}

export function useQuote(symbol: string | undefined) {
  const result = useQuotes(symbol ? [symbol] : []);
  return {
    ...result,
    data: result.data?.[0],
  };
}
