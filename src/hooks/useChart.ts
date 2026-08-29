import { useQuery } from '@tanstack/react-query';
import { getChart } from '../services/marketData';
import { ChartRange } from '../constants/symbols';

export function useChart(symbol: string | undefined, range: ChartRange) {
  return useQuery({
    queryKey: ['chart', symbol, range],
    queryFn: () => getChart(symbol as string, range),
    enabled: !!symbol,
    staleTime: 30_000,
  });
}
