// Thin client around Yahoo Finance's unofficial (keyless-for-chart/search) endpoints.
// Covers both global tickers and BIST tickers (".IS" suffix) through one API,
// which is why it was chosen over a paid provider for v1. No SLA/auth guarantee —
// isolated here so it can be swapped for a commercial provider later without
// touching UI code.
//
// IMPORTANT: /v7/finance/quote now requires a session cookie + crumb token
// (confirmed live — unauthenticated calls return 401). getQuotes() below
// authenticates via yahooAuth.ts, retries once on crumb expiry, and as a last
// resort derives a reduced quote from the (still keyless) chart endpoint's
// `meta` block so the app degrades gracefully instead of showing nothing.

import { ChartRange, RANGE_TO_YAHOO } from '../constants/symbols';
import { getCrumbAuth, invalidateCrumbAuth } from './yahooAuth';

const QUOTE_BASE = 'https://query1.finance.yahoo.com/v7/finance/quote';
const QUOTE_BASE_FALLBACK = 'https://query2.finance.yahoo.com/v7/finance/quote';
const CHART_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart';
const SEARCH_BASE = 'https://query1.finance.yahoo.com/v1/finance/search';

const COMMON_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
  Accept: 'application/json',
};

export type Quote = {
  symbol: string;
  shortName?: string;
  longName?: string;
  regularMarketPrice?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
  regularMarketPreviousClose?: number;
  regularMarketOpen?: number;
  regularMarketDayHigh?: number;
  regularMarketDayLow?: number;
  regularMarketVolume?: number;
  marketCap?: number;
  trailingPE?: number;
  forwardPE?: number;
  fiftyTwoWeekLow?: number;
  fiftyTwoWeekHigh?: number;
  fiftyDayAverage?: number;
  twoHundredDayAverage?: number;
  dividendYield?: number;
  averageAnalystRating?: string;
  bid?: number;
  ask?: number;
  currency?: string;
  fullExchangeName?: string;
  marketState?: string;
  dataSource?: 'Twelve Data' | 'Yahoo Finance';
  lastUpdated?: number;
  dataStatus?: 'realtime' | 'delayed' | 'eod' | 'unknown';
};

async function fetchJson(url: string, headers: Record<string, string> = COMMON_HEADERS): Promise<any> {
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const err: any = new Error(`Yahoo Finance request failed: ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

async function getQuotesAuthenticated(symbols: string[], forceRefresh = false): Promise<Quote[]> {
  const auth = await getCrumbAuth(forceRefresh);
  const url = `${QUOTE_BASE}?symbols=${encodeURIComponent(symbols.join(','))}&crumb=${encodeURIComponent(auth.crumb)}`;
  const json = await fetchJson(url, { ...COMMON_HEADERS, Cookie: auth.cookie });
  return json?.quoteResponse?.result ?? [];
}

// Last-resort fallback: derive a reduced quote from the keyless chart endpoint's
// `meta` block. Missing fields (marketCap, PE, dividend yield, analyst rating,
// bid/ask) are simply left undefined — UI already renders "—" for those.
async function getQuotesFromChartMeta(symbols: string[]): Promise<Quote[]> {
  const results = await Promise.all(
    symbols.map(async (symbol) => {
      try {
        const json = await fetchJson(`${CHART_BASE}/${encodeURIComponent(symbol)}?range=5d&interval=1d`);
        const meta = json?.chart?.result?.[0]?.meta;
        if (!meta) return null;
        const change =
          meta.regularMarketPrice !== undefined && meta.previousClose !== undefined
            ? meta.regularMarketPrice - meta.previousClose
            : undefined;
        const changePercent =
          change !== undefined && meta.previousClose ? (change / meta.previousClose) * 100 : undefined;
        const quote: Quote = {
          symbol: meta.symbol ?? symbol,
          shortName: meta.shortName,
          longName: meta.longName,
          regularMarketPrice: meta.regularMarketPrice,
          regularMarketChange: change,
          regularMarketChangePercent: changePercent,
          regularMarketPreviousClose: meta.previousClose ?? meta.chartPreviousClose,
          regularMarketDayHigh: meta.regularMarketDayHigh,
          regularMarketDayLow: meta.regularMarketDayLow,
          regularMarketVolume: meta.regularMarketVolume,
          fiftyTwoWeekLow: meta.fiftyTwoWeekLow,
          fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh,
          currency: meta.currency,
          fullExchangeName: meta.fullExchangeName,
        };
        return quote;
      } catch {
        return null;
      }
    })
  );
  return results.filter((q): q is Quote => q !== null);
}

export async function getQuotes(symbols: string[]): Promise<Quote[]> {
  if (symbols.length === 0) return [];

  try {
    return (await getQuotesAuthenticated(symbols)).map((quote) => ({ ...quote, dataSource: 'Yahoo Finance' as const, dataStatus: 'unknown' as const }));
  } catch (err: any) {
    if (err?.status === 401 || err?.status === 403) {
      invalidateCrumbAuth();
      try {
        return (await getQuotesAuthenticated(symbols, true)).map((quote) => ({ ...quote, dataSource: 'Yahoo Finance' as const, dataStatus: 'unknown' as const }));
      } catch {
        // fall through to further fallbacks below
      }
    }
  }

  try {
    const url = `${QUOTE_BASE_FALLBACK}?symbols=${encodeURIComponent(symbols.join(','))}`;
    const json = await fetchJson(url);
    const result = json?.quoteResponse?.result ?? [];
    if (result.length > 0) return result.map((quote: Quote) => ({ ...quote, dataSource: 'Yahoo Finance' as const, dataStatus: 'unknown' as const }));
  } catch {
    // ignore, try last-resort fallback
  }

  return (await getQuotesFromChartMeta(symbols)).map((quote) => ({ ...quote, dataSource: 'Yahoo Finance' as const, dataStatus: 'unknown' as const }));
}

export type ChartPoint = {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type ChartData = {
  symbol: string;
  currency?: string;
  points: ChartPoint[];
};

export async function getChart(symbol: string, range: ChartRange): Promise<ChartData> {
  const { range: r, interval } = RANGE_TO_YAHOO[range];
  const url = `${CHART_BASE}/${encodeURIComponent(symbol)}?range=${r}&interval=${interval}`;
  const json = await fetchJson(url);
  const result = json?.chart?.result?.[0];
  if (!result) return { symbol, points: [] };

  const timestamps: number[] = result.timestamp ?? [];
  const quote = result.indicators?.quote?.[0] ?? {};
  const points: ChartPoint[] = timestamps
    .map((ts: number, i: number) => ({
      timestamp: ts * 1000,
      open: quote.open?.[i],
      high: quote.high?.[i],
      low: quote.low?.[i],
      close: quote.close?.[i],
      volume: quote.volume?.[i],
    }))
    .filter((p: ChartPoint) => p.close !== null && p.close !== undefined);

  return { symbol, currency: result.meta?.currency, points };
}

export type SearchResultItem = {
  symbol: string;
  shortname?: string;
  longname?: string;
  exchDisp?: string;
  typeDisp?: string;
};

export async function searchSymbols(query: string): Promise<SearchResultItem[]> {
  if (!query.trim()) return [];
  const url = `${SEARCH_BASE}?q=${encodeURIComponent(query)}&quotesCount=20&newsCount=0`;
  const json = await fetchJson(url);
  return (json?.quotes ?? []).filter((q: any) => q.symbol && (q.shortname || q.longname));
}
