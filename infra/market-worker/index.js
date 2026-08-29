const YAHOO_CHART = 'https://query1.finance.yahoo.com/v8/finance/chart/';
const YAHOO_SEARCH = 'https://query1.finance.yahoo.com/v1/finance/search';
const HEADERS = { 'User-Agent': 'BorsaTakip/1.0', Accept: 'application/json' };
const DEFAULT_SYMBOLS = ['^XU100', '^GSPC', 'THYAO.IS', 'AKBNK.IS', 'AAPL', 'BTC-USD', 'USDTRY=X'];

function originalSymbol(symbol) {
  if (symbol.endsWith(':BIST')) return `${symbol.slice(0, -5)}.IS`;
  if (symbol.includes('/')) return `${symbol.replace('/', '')}=X`;
  if (symbol.endsWith('/USD')) return `${symbol.slice(0, -4)}-USD`;
  return ({ 'XAU/USD': 'GC=F', 'XAG/USD': 'SI=F', 'WTI/USD': 'CL=F', 'BRENT/USD': 'BZ=F' })[symbol] || symbol;
}

async function yahooChart(symbol, range = '1d', interval = '1d') {
  const response = await fetch(`${YAHOO_CHART}${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`, { headers: HEADERS });
  if (!response.ok) throw new Error(`Yahoo ${response.status}`);
  return response.json();
}

function quoteFromChart(symbol, payload) {
  const result = payload?.chart?.result?.[0];
  const meta = result?.meta;
  if (!meta?.regularMarketPrice && !meta?.chartPreviousClose) return null;
  const previous = meta.previousClose ?? meta.chartPreviousClose;
  const change = meta.regularMarketPrice != null && previous != null ? meta.regularMarketPrice - previous : undefined;
  return {
    name: meta.shortName || meta.longName || symbol,
    close: meta.regularMarketPrice ?? previous,
    price: meta.regularMarketPrice ?? previous,
    change,
    percent_change: change != null && previous ? (change / previous) * 100 : undefined,
    previous_close: previous,
    open: meta.regularMarketOpen,
    high: meta.regularMarketDayHigh,
    low: meta.regularMarketDayLow,
    volume: meta.regularMarketVolume,
    currency: meta.currency,
    exchange: meta.fullExchangeName,
    timestamp: meta.regularMarketTime,
    is_market_open: meta.marketState === 'REGULAR',
    last_quote_at: meta.regularMarketTime,
  };
}

async function cachedJson(request, ttlSeconds, loader) {
  const cache = caches.default;
  const cached = await cache.match(request);
  if (cached) return cached;
  const body = JSON.stringify(await loader());
  const response = new Response(body, { headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': `public, max-age=${ttlSeconds}` } });
  await cache.put(request, response.clone());
  return response;
}

async function handle(request) {
  const url = new URL(request.url);
  if (request.method !== 'GET') return new Response('Method Not Allowed', { status: 405 });
  const cors = { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET,OPTIONS' };
  if (url.pathname === '/health') return new Response(JSON.stringify({ ok: true, service: 'borsatakip-market-worker' }), { headers: { ...cors, 'content-type': 'application/json' } });

  if (url.pathname === '/quote') {
    const symbols = (url.searchParams.get('symbol') || '').split(',').filter(Boolean).slice(0, 40);
    if (!symbols.length) return new Response(JSON.stringify({ error: 'symbol is required' }), { status: 400, headers: { ...cors, 'content-type': 'application/json' } });
    const response = await cachedJson(new Request(url.toString()), 30, async () => {
      const entries = await Promise.all(symbols.map(async (mapped) => [mapped, quoteFromChart(originalSymbol(mapped), await yahooChart(originalSymbol(mapped))) ]));
      return Object.fromEntries(entries.filter(([, value]) => value));
    });
    return new Response(response.body, { status: response.status, headers: { ...Object.fromEntries(response.headers), ...cors } });
  }

  if (url.pathname === '/time_series') {
    const mapped = url.searchParams.get('symbol');
    if (!mapped) return new Response(JSON.stringify({ error: 'symbol is required' }), { status: 400, headers: { ...cors, 'content-type': 'application/json' } });
    const symbol = originalSymbol(mapped);
    const range = url.searchParams.get('range') || '1mo';
    const interval = url.searchParams.get('interval') || '1d';
    const response = await cachedJson(new Request(url.toString()), 60, async () => {
      const payload = await yahooChart(symbol, range, interval);
      const result = payload?.chart?.result?.[0];
      const timestamps = result?.timestamp || [];
      const values = timestamps.map((timestamp, i) => ({
        datetime: new Date(timestamp * 1000).toISOString(),
        open: result.indicators.quote[0].open?.[i], high: result.indicators.quote[0].high?.[i],
        low: result.indicators.quote[0].low?.[i], close: result.indicators.quote[0].close?.[i], volume: result.indicators.quote[0].volume?.[i] || 0,
      })).filter((item) => item.close != null);
      return { meta: { currency: result?.meta?.currency }, values };
    });
    return new Response(response.body, { status: response.status, headers: { ...Object.fromEntries(response.headers), ...cors } });
  }

  if (url.pathname === '/symbol_search') {
    const query = url.searchParams.get('symbol') || '';
    const response = await fetch(`${YAHOO_SEARCH}?q=${encodeURIComponent(query)}&quotesCount=40&newsCount=0`, { headers: HEADERS });
    const json = await response.json();
    return new Response(JSON.stringify({ data: (json.quotes || []).map((item) => ({ symbol: item.symbol, instrument_name: item.longname || item.shortname, exchange: item.exchDisp, instrument_type: item.quoteType })) }), { headers: { ...cors, 'content-type': 'application/json' } });
  }
  return new Response('Not Found', { status: 404, headers: cors });
}

export default {
  fetch(request) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET,OPTIONS' } });
    return handle(request).catch((error) => new Response(JSON.stringify({ error: error.message }), { status: 502, headers: { 'access-control-allow-origin': '*', 'content-type': 'application/json' } }));
  },
  async scheduled(event, env, ctx) {
    const symbols = (env.WARM_SYMBOLS || DEFAULT_SYMBOLS).split(',').map((item) => item.trim()).filter(Boolean);
    ctx.waitUntil(handle(new Request(`https://worker.internal/quote?symbol=${encodeURIComponent(symbols.join(','))}`)));
  },
};
