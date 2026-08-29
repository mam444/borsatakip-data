import { useQuote } from './useQuotes';

// Live USD/TRY rate (how many TRY per 1 USD), used to normalize mixed-currency
// portfolios and to convert aggregate totals to the user's display currency.
export function useUsdTryRate() {
  const { data } = useQuote('USDTRY=X');
  return data?.regularMarketPrice;
}
