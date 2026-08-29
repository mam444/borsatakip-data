import { useQuery } from '@tanstack/react-query';
import { getMarketNews, getSymbolNews } from '../services/news';

export function useMarketNews() {
  return useQuery({
    queryKey: ['news', 'market'],
    queryFn: getMarketNews,
    staleTime: 5 * 60_000,
  });
}

export function useSymbolNews(symbol: string | undefined) {
  return useQuery({
    queryKey: ['news', 'symbol', symbol],
    queryFn: () => getSymbolNews(symbol as string),
    enabled: !!symbol,
    staleTime: 5 * 60_000,
  });
}
