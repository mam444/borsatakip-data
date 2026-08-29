// Real company logos, sourced from TradingView's public logo CDN
// (s3-symbol-logo.tradingview.com — the same asset host TradingView's own charts
// use). There's no official keyless "logo by ticker" API, so each entry below was
// individually verified (HTTP 200 + real SVG content) rather than guessed at
// runtime. Symbols with no verified slug simply fall back to SymbolAvatar's
// colored-initials rendering — same graceful-degradation pattern used for the
// quote API fallback chain.

const LOGO_BASE = 'https://s3-symbol-logo.tradingview.com/';

export const SYMBOL_LOGOS: Record<string, string> = {
  // BIST30
  'THYAO.IS': 'turk-hava-yollari.svg',
  'GARAN.IS': 'garanti.svg',
  'AKBNK.IS': 'akbank.svg',
  'ISCTR.IS': 'is-bankasi.svg',
  'KCHOL.IS': 'koc.svg',
  'SAHOL.IS': 'sabanci-holding.svg',
  'ASELS.IS': 'aselsan.svg',
  'TUPRS.IS': 'tupras.svg',
  'PGSUS.IS': 'pegasus.svg',
  'SISE.IS': 'sisecam.svg',
  'KOZAL.IS': 'koza-altin.svg',
  'FROTO.IS': 'ford-otosan.svg',
  'TCELL.IS': 'turkcell.svg',
  'HEKTS.IS': 'hektas.svg',
  'PETKM.IS': 'petkim.svg',
  'ENKAI.IS': 'enka-insaat.svg',
  'MGROS.IS': 'migros-ticaret.svg',
  'VESTL.IS': 'vestel.svg',
  'KONTR.IS': 'kontrolmatik-teknoloji.svg',
  'ODAS.IS': 'odas.svg',
  'ARCLK.IS': 'arcelik.svg',
  'SASA.IS': 'sasa-polyester.svg',
  'TAVHL.IS': 'tav-havalimanlari.svg',
  'DOHOL.IS': 'dogan-holding.svg',
  'ALARK.IS': 'alarko-holding.svg',
  'OYAKC.IS': 'oyak-cimento.svg',

  // Global popular
  AAPL: 'apple--big.svg',
  MSFT: 'microsoft--big.svg',
  GOOGL: 'alphabet--big.svg',
  AMZN: 'amazon--big.svg',
  NVDA: 'nvidia--big.svg',
  META: 'meta-platforms--big.svg',
  TSLA: 'tesla--big.svg',
  AVGO: 'broadcom--big.svg',
  NFLX: 'netflix--big.svg',
  JPM: 'jpmorgan-chase--big.svg',
  V: 'visa--big.svg',
  MA: 'mastercard--big.svg',
  JNJ: 'johnson-and-johnson--big.svg',
  WMT: 'walmart--big.svg',
  DIS: 'walt-disney--big.svg',
  KO: 'coca-cola--big.svg',
  PEP: 'pepsico--big.svg',
  INTC: 'intel--big.svg',
  AMD: 'advanced-micro-devices--big.svg',
  BA: 'boeing--big.svg',
};

export function getLogoUrl(symbol: string): string | undefined {
  const file = SYMBOL_LOGOS[symbol];
  return file ? `${LOGO_BASE}${file}` : undefined;
}
