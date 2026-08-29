import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchSymbols } from '../services/marketData';

export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

export function useSearch(query: string) {
  const debounced = useDebouncedValue(query.trim(), 350);
  return useQuery({
    queryKey: ['search', debounced],
    queryFn: () => searchSymbols(debounced),
    enabled: debounced.length > 0,
    staleTime: 60_000,
  });
}
