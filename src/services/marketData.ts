import { ChartRange } from '../constants/symbols';
import {
  ChartData,
  ChartPoint,
  Quote,
  SearchResultItem,
  getChart as getYahooChart,
  getQuotes as getYahooQuotes,
  searchSymbols as searchYahooSymbols,
} from './yahooFinance';

const TWELVE_BASE = 'https://api.twelvedata.com';
const TWELVE_API_KEY = process.env.EXPO_PUBLIC_TWELVE_DATA_API_KEY?.trim();
const MARKET_DATA_PROXY = process.env.EXPO_PUBLIC_MARKET_DATA_PROXY_URL?.trim().replace(/\/$/, '');

const GITHUB_PAGES_BASE = 'https://raw.githubusercontent.com/mam444/borsatakip-data/main/data';
const GITHUB_PAGES_TIMEOUT = 5000;

export const marketDataProvider = MARKET_DATA_PROXY
  ? 'GitHub Pages + Güvenli API proxy + Yahoo fallback'
  : TWELVE_API_KEY
    ? 'GitHub Pages + Twelve Data (geliştirme) + Yahoo fallback'
    : 'GitHub Pages + Yahoo Finance fallback';
export const hasLicensedProvider = Boolean(MARKET_DATA_PROXY || TWELVE_API_KEY);

const TWELVE_CHART_CONFIG: Record<ChartRange, { interval: string; outputsize: number }> = {
  '1D': { interval: '5min', outputsize: 160 },
  '1W': { interval: '15min', outputsize: 260 },
  '1M': { interval: '1h', outputsize: 240 },
  '6M': { interval: '1day', outputsize: 190 },
  '1Y': { interval: '1day', outputsize: 370 },
  '5Y': { interval: '1week', outputsize: 270 },
  ALL: { interval: '1month', outputsize: 5000 },
};

function toTwelveSymbol(symbol: string): string | null {
  if (symbol.startsWith('^')) return null;
  if (symbol.endsWith('.IS')) return `${symbol.slice(0, -3)}:BIST`;
  if (symbol.endsWith('=X') && symbol.length >= 8) {
    const pair = symbol.slice(0, -2);
    return `${pair.slice(0, 3)}/${pair.slice(3)}`;
  }
  if (symbol.endsWith('-USD')) return `${symbol.slice(0, -4)}/USD`;
  const commodityMap: Record<string, string> = {
    'GC=F': 'XAU/USD',
    'SI=F': 'XAG/USD',
    'CL=F': 'WTI/USD',
    'BZ=F': 'BRENT/USD',
  };
  return commodityMap[symbol] ?? symbol;
}

function inferredStatus(originalSymbol: string, response: any): Quote['dataStatus'] {
  if (response?.is_market_open && response?.last_quote_at) return 'realtime';
  if (originalSymbol.endsWith('.IS')) return 'eod';
  return response?.timestamp ? 'delayed' : 'unknown';
}

function parseTwelveQuote(originalSymbol: string, value: any): Quote | null {
  if (!value || value.status === 'error' || value.code) return null;
  const close = Number(value.close ?? value.price);
  if (!Number.isFinite(close)) return null;
  const number = (candidate: unknown) => {
    const parsed = Number(candidate);
    return Number.isFinite(parsed) ? parsed : undefined;
  };
  return {
    symbol: originalSymbol,
    shortName: value.name ?? originalSymbol,
    longName: value.name,
    regularMarketPrice: close,
    regularMarketChange: number(value.change),
    regularMarketChangePercent: number(value.percent_change),
    regularMarketPreviousClose: number(value.previous_close),
    regularMarketOpen: number(value.open),
    regularMarketDayHigh: number(value.high),
    regularMarketDayLow: number(value.low),
    regularMarketVolume: number(value.volume),
    fiftyTwoWeekLow: number(value.fifty_two_week?.low),
    fiftyTwoWeekHigh: number(value.fifty_two_week?.high),
    currency: value.currency,
    fullExchangeName: value.exchange,
    marketState: value.is_market_open ? 'REGULAR' : 'CLOSED',
    dataSource: 'Twelve Data',
    lastUpdated: number(value.last_quote_at ?? value.timestamp),
    dataStatus: inferredStatus(originalSymbol, value),
  };
}

async function fetchGitHubPages(filename: string): Promise<any> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), GITHUB_PAGES_TIMEOUT);
    const response = await fetch(`${GITHUB_PAGES_BASE}/${filename}`, { signal: controller.signal });
    clearTimeout(timeout);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  } catch (err) {
    // Silently fail — fallback chain will handle it
    return null;
  }
}

async function getQuotesFromGitHubPages(symbols: string[]): Promise<Quote[]> {
  const allQuotes = await fetchGitHubPages('quotes.json');
  if (!allQuotes || !Array.isArray(allQuotes)) return [];
  const symbolSet = new Set(symbols);
  return allQuotes.filter((q: any) => symbolSet.has(q.symbol));
}

async function getChartFromGitHubPages(symbol: string, range: ChartRange): Promise<ChartData | null> {
  const allCharts = await fetchGitHubPages('charts.json');
  if (!allCharts || !allCharts[symbol]) return null;
  const points = allCharts[symbol][range];
  if (!points) return null;
  return { symbol, points };
}

async function fetchTwelve(path: string, params: Record<string, string | number>) {
  const entries = Object.fromEntries(Object.entries(params).map(([key, value]) => [key, String(value)]));
  const query = new URLSearchParams(MARKET_DATA_PROXY ? entries : { ...entries, apikey: TWELVE_API_KEY as string });
  const response = await fetch(`${MARKET_DATA_PROXY ?? TWELVE_BASE}${path}?${query}`);
  if (!response.ok) throw new Error(`Twelve Data request failed: ${response.status}`);
  const json = await response.json();
  if (json?.status === 'error' || json?.code) throw new Error(json?.message ?? 'Twelve Data error');
  return json;
}

export async function getQuotes(symbols: string[]): Promise<Quote[]> {
  if (symbols.length === 0) return [];

  const collected = new Map<string, Quote>();

  // Layer 1: Try GitHub Pages
  try {
    const gitHubQuotes = await getQuotesFromGitHubPages(symbols);
    gitHubQuotes.forEach((quote) => collected.set(quote.symbol, quote));
  } catch {
    // Silently continue to next layer
  }

  // Layer 2: Try Twelve Data / proxy (if env var set)
  const missing = symbols.filter((symbol) => !collected.has(symbol));
  if (missing.length > 0 && hasLicensedProvider) {
    const mapped = missing
      .map((original) => ({ original, twelve: toTwelveSymbol(original) }))
      .filter((item): item is { original: string; twelve: string } => Boolean(item.twelve));

    if (mapped.length > 0) {
      try {
        const json = await fetchTwelve('/quote', { symbol: mapped.map((item) => item.twelve).join(',') });
        for (const item of mapped) {
          const raw = mapped.length === 1 ? json : json[item.twelve] ?? json[item.original];
          const quote = parseTwelveQuote(item.original, raw);
          if (quote) collected.set(item.original, quote);
        }
      } catch {
        // Entitlement, symbol and quota failures fall through to the next layer.
      }
    }
  }

  // Layer 3: Fallback to direct Yahoo Finance
  const stillMissing = symbols.filter((symbol) => !collected.has(symbol));
  if (stillMissing.length > 0) {
    const fallback = await getYahooQuotes(stillMissing);
    fallback.forEach((quote) => collected.set(quote.symbol, quote));
  }

  return symbols.map((symbol) => collected.get(symbol)).filter((quote): quote is Quote => Boolean(quote));
}

export async function getChart(symbol: string, range: ChartRange): Promise<ChartData> {
  // Layer 1: Try GitHub Pages
  try {
    const chart = await getChartFromGitHubPages(symbol, range);
    if (chart) return chart;
  } catch {
    // Continue to next layer
  }

  // Layer 2: Try Twelve Data / proxy (if available)
  const mapped = toTwelveSymbol(symbol);
  if (hasLicensedProvider && mapped) {
    try {
      const config = TWELVE_CHART_CONFIG[range];
      const json = await fetchTwelve('/time_series', {
        symbol: mapped,
        interval: config.interval,
        outputsize: config.outputsize,
        order: 'ASC',
        timezone: 'UTC',
      });
      const points: ChartPoint[] = (json.values ?? [])
        .map((value: any) => ({
          timestamp: Date.parse(value.datetime.endsWith('Z') ? value.datetime : `${value.datetime}Z`),
          open: Number(value.open),
          high: Number(value.high),
          low: Number(value.low),
          close: Number(value.close),
          volume: Number(value.volume ?? 0),
        }))
        .filter((point: ChartPoint) => Number.isFinite(point.timestamp) && Number.isFinite(point.close));
      if (points.length > 0) return { symbol, currency: json.meta?.currency, points };
    } catch {
      // Use Yahoo for unavailable intervals, symbols or exhausted provider quota.
    }
  }

  // Layer 3: Fallback to direct Yahoo Finance
  return getYahooChart(symbol, range);
}

export async function searchSymbols(query: string): Promise<SearchResultItem[]> {
  if (!hasLicensedProvider) return searchYahooSymbols(query);
  try {
    const [twelve, yahoo] = await Promise.all([
      fetchTwelve('/symbol_search', { symbol: query, outputsize: 40 }),
      searchYahooSymbols(query).catch(() => []),
    ]);
    const twelveResults: SearchResultItem[] = (twelve.data ?? []).map((item: any) => ({
      symbol: item.symbol,
      shortname: item.instrument_name,
      longname: item.instrument_name,
      exchDisp: item.exchange ?? item.country,
      typeDisp: item.instrument_type,
    }));
    const seen = new Set<string>();
    return [...twelveResults, ...yahoo].filter((item) => {
      const key = `${item.symbol}:${item.exchDisp ?? ''}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  } catch {
    return searchYahooSymbols(query);
  }
}

export type { Quote, ChartData, ChartPoint, SearchResultItem };
