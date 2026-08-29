#!/usr/bin/env node

/**
 * Fetch market data from Yahoo Finance and publish as static JSON files
 * Runs every 5 minutes via GitHub Actions
 * Outputs: data/quotes.json, data/charts.json, data/metadata.json
 */

const fs = require('fs');
const path = require('path');

// Symbol lists (hardcoded to avoid build-time dependencies)
const BIST30 = [
  { symbol: 'THYAO.IS', name: 'Türk Hava Yolları' },
  { symbol: 'GARAN.IS', name: 'Garanti BBVA' },
  { symbol: 'AKBNK.IS', name: 'Akbank' },
  { symbol: 'ISCTR.IS', name: 'İş Bankası (C)' },
  { symbol: 'YKBNK.IS', name: 'Yapı Kredi Bankası' },
  { symbol: 'KCHOL.IS', name: 'Koç Holding' },
  { symbol: 'SAHOL.IS', name: 'Sabancı Holding' },
  { symbol: 'BIMAS.IS', name: 'BİM Mağazalar' },
  { symbol: 'ASELS.IS', name: 'Aselsan' },
  { symbol: 'EREGL.IS', name: 'Ereğli Demir Çelik' },
  { symbol: 'TUPRS.IS', name: 'Tüpraş' },
  { symbol: 'PGSUS.IS', name: 'Pegasus' },
  { symbol: 'SISE.IS', name: 'Şişecam' },
  { symbol: 'KOZAL.IS', name: 'Koza Altın' },
  { symbol: 'TOASO.IS', name: 'Tofaş Oto' },
];

const GLOBAL_POPULAR = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corp.' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.' },
  { symbol: 'META', name: 'Meta Platforms' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'JPM', name: 'JPMorgan Chase' },
  { symbol: 'V', name: 'Visa Inc.' },
  { symbol: 'JNJ', name: 'Johnson & Johnson' },
];

const INDICES = [
  'XU100.IS',
  'XU030.IS',
  '^GSPC',
  '^IXIC',
  '^DJI',
  '^GDAXI',
];

const FX_PAIRS = [
  'USDTRY=X',
  'EURTRY=X',
  'GBPTRY=X',
  'JPYTRY=X',
  'CHFTRY=X',
];

const CRYPTO = [
  'BTC-USD',
  'ETH-USD',
];

const ALL_SYMBOLS = [
  ...BIST30.map(s => s.symbol),
  ...GLOBAL_POPULAR.map(s => s.symbol),
  ...INDICES,
  ...FX_PAIRS,
  ...CRYPTO,
];

// Yahoo Finance endpoints
const YAHOO_QUOTE_URL = 'https://query1.finance.yahoo.com/v7/finance/quote';
const YAHOO_CHART_URL = 'https://query1.finance.yahoo.com/v8/finance/chart';
const YAHOO_FALLBACK_URL = 'https://query2.finance.yahoo.com/v7/finance/quote';

// Timeout settings
const QUOTE_TIMEOUT_MS = 15000;
const CHART_TIMEOUT_MS = 10000;

/**
 * Fetch quotes from Yahoo Finance with fallback
 */
async function fetchQuotes(symbols, attempt = 0) {
  if (attempt > 2) {
    console.warn(`Failed to fetch quotes after ${attempt} attempts`);
    return {};
  }

  const url = attempt === 0 ? YAHOO_QUOTE_URL : YAHOO_FALLBACK_URL;
  const symbolStr = symbols.slice(0, 10).join(','); // Batch up to 10

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), QUOTE_TIMEOUT_MS);

    const response = await fetch(`${url}?symbols=${encodeURIComponent(symbolStr)}`, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.warn(`Quote fetch failed (${url}): ${response.status}`);
      if (response.status === 401 && attempt === 0) {
        return fetchQuotes(symbols, 1); // Retry with fallback
      }
      return {};
    }

    const data = await response.json();
    return data.quoteResponse?.result || {};
  } catch (err) {
    console.warn(`Quote fetch error (${url}): ${err.message}`);
    if (attempt < 2) {
      return fetchQuotes(symbols, attempt + 1);
    }
    return {};
  }
}

/**
 * Fetch 1D chart data (intraday, 5-minute interval)
 */
async function fetchChart(symbol) {
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
      console.warn(`Chart fetch failed for ${symbol}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const result = data.chart?.result?.[0];

    if (!result) {
      console.warn(`No chart data for ${symbol}`);
      return null;
    }

    const timestamps = result.timestamp || [];
    const quotes = result.indicators?.quote?.[0] || {};
    const adjclose = result.indicators?.adjclose?.[0]?.adjclose || [];

    const points = timestamps.map((ts, i) => ({
      timestamp: ts * 1000, // Convert to ms
      open: quotes.open?.[i],
      high: quotes.high?.[i],
      low: quotes.low?.[i],
      close: quotes.close?.[i] || adjclose?.[i],
      volume: quotes.volume?.[i],
    })).filter(p => p.close);

    return { points, meta: { currency: result.meta?.currency } };
  } catch (err) {
    console.warn(`Chart fetch error for ${symbol}: ${err.message}`);
    return null;
  }
}

/**
 * Convert quote object to our Quote type
 */
function normalizeQuote(original) {
  if (!original || !original.symbol) return null;

  return {
    symbol: original.symbol,
    shortName: original.shortName || original.symbol,
    regularMarketPrice: original.regularMarketPrice,
    regularMarketChange: original.regularMarketChange,
    regularMarketChangePercent: original.regularMarketChangePercent,
    regularMarketOpen: original.regularMarketOpen,
    regularMarketDayHigh: original.regularMarketDayHigh,
    regularMarketDayLow: original.regularMarketDayLow,
    regularMarketVolume: original.regularMarketVolume,
    fiftyTwoWeekLow: original.fiftyTwoWeekLow,
    fiftyTwoWeekHigh: original.fiftyTwoWeekHigh,
    currency: original.currency,
    fullExchangeName: original.fullExchangeName || original.exchange,
    marketState: original.marketState || 'CLOSED',
    lastUpdated: Date.now(),
    dataStatus: original.marketState === 'REGULAR' ? 'realtime' : 'eod',
    dataSource: 'GitHub Actions (Yahoo Finance)',
  };
}

/**
 * Main function
 */
async function main() {
  console.log(`[${new Date().toISOString()}] Starting market data fetch...`);

  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const quotes = [];
  const charts = {};
  const failedSymbols = [];

  // Fetch quotes (batch by 10)
  console.log(`Fetching quotes for ${ALL_SYMBOLS.length} symbols...`);
  for (let i = 0; i < ALL_SYMBOLS.length; i += 10) {
    const batch = ALL_SYMBOLS.slice(i, i + 10);
    const results = await fetchQuotes(batch);

    for (const sym of batch) {
      const result = results.find(r => r.symbol === sym);
      if (result) {
        const normalized = normalizeQuote(result);
        if (normalized) {
          quotes.push(normalized);
        }
      } else {
        failedSymbols.push(sym);
      }
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`Fetched ${quotes.length} quotes, ${failedSymbols.length} failed`);

  // Fetch 1D charts for top symbols (sample: first 20)
  console.log(`Fetching 1D charts for sample symbols...`);
  const topSymbols = ALL_SYMBOLS.slice(0, 20);
  for (const symbol of topSymbols) {
    const chartData = await fetchChart(symbol);
    if (chartData) {
      charts[symbol] = {
        '1D': chartData.points,
      };
    }
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  // Write files
  const quotesPath = path.join(dataDir, 'quotes.json');
  const chartsPath = path.join(dataDir, 'charts.json');
  const metadataPath = path.join(dataDir, 'metadata.json');

  fs.writeFileSync(quotesPath, JSON.stringify(quotes, null, 2));
  fs.writeFileSync(chartsPath, JSON.stringify(charts, null, 2));

  const metadata = {
    lastUpdated: Date.now(),
    dataSource: 'GitHub Actions + Yahoo Finance',
    isStale: failedSymbols.length > 0,
    quotesCount: quotes.length,
    chartsCount: Object.keys(charts).length,
    failedSymbols,
  };
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

  console.log(`[${new Date().toISOString()}] Market data fetch complete!`);
  console.log(`  - Quotes: ${quotesPath} (${quotes.length} symbols)`);
  console.log(`  - Charts: ${chartsPath} (${Object.keys(charts).length} symbols)`);
  console.log(`  - Metadata: ${metadataPath}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
