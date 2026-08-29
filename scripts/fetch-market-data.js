#!/usr/bin/env node

/**
 * Fetch market data from Yahoo Finance and publish as static JSON files
 * Runs every 5 minutes via GitHub Actions
 * Outputs: data/quotes.json, data/charts.json, data/metadata.json
 *
 * Uses the keyless chart endpoint (v8/finance/chart) for both quotes and
 * chart data, since v7/finance/quote now requires a cookie+crumb session
 * (confirmed 401 on the batch quote endpoint — see src/services/yahooFinance.ts
 * for the same issue in the app itself). The chart endpoint's `meta` block
 * carries enough fields (regularMarketPrice, previousClose, etc.) to build a
 * full quote without needing auth.
 */

const fs = require('fs');
const path = require('path');

// Symbol lists (hardcoded to avoid build-time dependencies)
const BIST30 = [
  'THYAO.IS', 'GARAN.IS', 'AKBNK.IS', 'ISCTR.IS', 'YKBNK.IS',
  'KCHOL.IS', 'SAHOL.IS', 'BIMAS.IS', 'ASELS.IS', 'EREGL.IS',
  'TUPRS.IS', 'PGSUS.IS', 'SISE.IS', 'KOZAL.IS', 'TOASO.IS',
];

const GLOBAL_POPULAR = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA',
  'META', 'TSLA', 'JPM', 'V', 'JNJ',
];

const INDICES = ['XU100.IS', 'XU030.IS', '^GSPC', '^IXIC', '^DJI', '^GDAXI'];

const FX_PAIRS = ['USDTRY=X', 'EURTRY=X', 'GBPTRY=X', 'JPYTRY=X', 'CHFTRY=X'];

const CRYPTO = ['BTC-USD', 'ETH-USD'];

const ALL_SYMBOLS = [...BIST30, ...GLOBAL_POPULAR, ...INDICES, ...FX_PAIRS, ...CRYPTO];

const YAHOO_CHART_URL = 'https://query1.finance.yahoo.com/v8/finance/chart';
const CHART_TIMEOUT_MS = 12000;
const REQUEST_DELAY_MS = 300;

/**
 * Fetch a symbol's 1-day/5-minute chart from Yahoo Finance.
 * Returns { points, meta } or null on failure. Never throws.
 */
async function fetchSymbolChart(symbol) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CHART_TIMEOUT_MS);

    const url = `${YAHOO_CHART_URL}/${encodeURIComponent(symbol)}?range=1d&interval=5m`;
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.warn(`Chart fetch failed for ${symbol}: HTTP ${response.status}`);
      return null;
    }

    const data = await response.json();
    const result = data?.chart?.result?.[0];
    if (!result) {
      console.warn(`No chart data for ${symbol}`);
      return null;
    }

    const timestamps = result.timestamp || [];
    const quote = result.indicators?.quote?.[0] || {};
    const adjclose = result.indicators?.adjclose?.[0]?.adjclose || [];

    const points = timestamps
      .map((ts, i) => ({
        timestamp: ts * 1000,
        open: quote.open?.[i] ?? null,
        high: quote.high?.[i] ?? null,
        low: quote.low?.[i] ?? null,
        close: quote.close?.[i] ?? adjclose?.[i] ?? null,
        volume: quote.volume?.[i] ?? null,
      }))
      .filter((p) => typeof p.close === 'number' && Number.isFinite(p.close));

    return { points, meta: result.meta || {} };
  } catch (err) {
    console.warn(`Chart fetch error for ${symbol}: ${err.message}`);
    return null;
  }
}

/**
 * Build a Quote object from chart meta + intraday points (no auth required).
 */
function buildQuoteFromChart(symbol, points, meta) {
  const price = typeof meta.regularMarketPrice === 'number' ? meta.regularMarketPrice : points.at(-1)?.close;
  if (typeof price !== 'number' || !Number.isFinite(price)) return null;

  const previousClose = meta.previousClose ?? meta.chartPreviousClose;
  const change = typeof previousClose === 'number' ? price - previousClose : undefined;
  const changePercent = typeof previousClose === 'number' && previousClose !== 0
    ? (change / previousClose) * 100
    : undefined;

  const highs = points.map((p) => p.high).filter((v) => typeof v === 'number');
  const lows = points.map((p) => p.low).filter((v) => typeof v === 'number');
  const volumes = points.map((p) => p.volume).filter((v) => typeof v === 'number');

  const isRegular = meta.currentTradingPeriod && Date.now() / 1000 < (meta.currentTradingPeriod.regular?.end ?? 0)
    && Date.now() / 1000 > (meta.currentTradingPeriod.regular?.start ?? Infinity);

  return {
    symbol,
    shortName: meta.longName || meta.shortName || symbol,
    regularMarketPrice: price,
    regularMarketChange: change,
    regularMarketChangePercent: changePercent,
    regularMarketPreviousClose: previousClose,
    regularMarketOpen: points[0]?.open,
    regularMarketDayHigh: highs.length ? Math.max(...highs) : undefined,
    regularMarketDayLow: lows.length ? Math.min(...lows) : undefined,
    regularMarketVolume: volumes.length ? volumes.reduce((a, b) => a + b, 0) : undefined,
    currency: meta.currency,
    fullExchangeName: meta.exchangeName || meta.fullExchangeName,
    marketState: isRegular ? 'REGULAR' : 'CLOSED',
    lastUpdated: Date.now(),
    dataStatus: isRegular ? 'realtime' : 'eod',
    dataSource: 'GitHub Actions (Yahoo Finance chart-meta)',
  };
}

async function main() {
  console.log(`[${new Date().toISOString()}] Starting market data fetch...`);

  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const quotes = [];
  const charts = {};
  const failedSymbols = [];

  console.log(`Fetching chart+quote data for ${ALL_SYMBOLS.length} symbols...`);

  for (const symbol of ALL_SYMBOLS) {
    const chartData = await fetchSymbolChart(symbol);

    if (chartData && chartData.points.length > 0) {
      const quote = buildQuoteFromChart(symbol, chartData.points, chartData.meta);
      if (quote) {
        quotes.push(quote);
        charts[symbol] = { '1D': chartData.points };
      } else {
        failedSymbols.push(symbol);
      }
    } else {
      failedSymbols.push(symbol);
    }

    await new Promise((resolve) => setTimeout(resolve, REQUEST_DELAY_MS));
  }

  console.log(`Fetched ${quotes.length} quotes, ${failedSymbols.length} failed: ${failedSymbols.join(', ')}`);

  if (quotes.length === 0) {
    console.error('Fatal: zero symbols succeeded — refusing to publish empty/fake data.');
    process.exit(1);
  }

  const quotesPath = path.join(dataDir, 'quotes.json');
  const chartsPath = path.join(dataDir, 'charts.json');
  const metadataPath = path.join(dataDir, 'metadata.json');

  fs.writeFileSync(quotesPath, JSON.stringify(quotes, null, 2));
  fs.writeFileSync(chartsPath, JSON.stringify(charts, null, 2));

  const metadata = {
    lastUpdated: Date.now(),
    dataSource: 'GitHub Actions + Yahoo Finance (chart-meta)',
    isStale: failedSymbols.length > 0,
    quotesCount: quotes.length,
    chartsCount: Object.keys(charts).length,
    totalSymbols: ALL_SYMBOLS.length,
    failedSymbols,
  };
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

  console.log(`[${new Date().toISOString()}] Market data fetch complete!`);
  console.log(`  - Quotes: ${quotesPath} (${quotes.length}/${ALL_SYMBOLS.length} symbols)`);
  console.log(`  - Charts: ${chartsPath} (${Object.keys(charts).length} symbols)`);
  console.log(`  - Metadata: ${metadataPath}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
