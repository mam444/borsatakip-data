// Curated symbol universes used to power Markets/Home "gainers, losers, most active"
// screens without needing a paid screener API. Yahoo Finance tickers.

export type SymbolMeta = {
  symbol: string;
  name: string;
  exchange: string;
  sector?: string;
};

export const BIST30: SymbolMeta[] = [
  { symbol: 'THYAO.IS', name: 'Türk Hava Yolları', exchange: 'BIST', sector: 'Ulaştırma' },
  { symbol: 'GARAN.IS', name: 'Garanti BBVA', exchange: 'BIST', sector: 'Bankacılık' },
  { symbol: 'AKBNK.IS', name: 'Akbank', exchange: 'BIST', sector: 'Bankacılık' },
  { symbol: 'ISCTR.IS', name: 'İş Bankası (C)', exchange: 'BIST', sector: 'Bankacılık' },
  { symbol: 'YKBNK.IS', name: 'Yapı Kredi Bankası', exchange: 'BIST', sector: 'Bankacılık' },
  { symbol: 'KCHOL.IS', name: 'Koç Holding', exchange: 'BIST', sector: 'Holding' },
  { symbol: 'SAHOL.IS', name: 'Sabancı Holding', exchange: 'BIST', sector: 'Holding' },
  { symbol: 'BIMAS.IS', name: 'BİM Mağazalar', exchange: 'BIST', sector: 'Perakende' },
  { symbol: 'ASELS.IS', name: 'Aselsan', exchange: 'BIST', sector: 'Savunma' },
  { symbol: 'EREGL.IS', name: 'Ereğli Demir Çelik', exchange: 'BIST', sector: 'Metal' },
  { symbol: 'TUPRS.IS', name: 'Tüpraş', exchange: 'BIST', sector: 'Enerji' },
  { symbol: 'PGSUS.IS', name: 'Pegasus', exchange: 'BIST', sector: 'Ulaştırma' },
  { symbol: 'SISE.IS', name: 'Şişecam', exchange: 'BIST', sector: 'Sanayi' },
  { symbol: 'KOZAL.IS', name: 'Koza Altın', exchange: 'BIST', sector: 'Madencilik' },
  { symbol: 'TOASO.IS', name: 'Tofaş Oto', exchange: 'BIST', sector: 'Otomotiv' },
  { symbol: 'FROTO.IS', name: 'Ford Otosan', exchange: 'BIST', sector: 'Otomotiv' },
  { symbol: 'TCELL.IS', name: 'Turkcell', exchange: 'BIST', sector: 'Telekom' },
  { symbol: 'HEKTS.IS', name: 'Hektaş', exchange: 'BIST', sector: 'Kimya' },
  { symbol: 'PETKM.IS', name: 'Petkim', exchange: 'BIST', sector: 'Kimya' },
  { symbol: 'ENKAI.IS', name: 'Enka İnşaat', exchange: 'BIST', sector: 'İnşaat' },
  { symbol: 'MGROS.IS', name: 'Migros', exchange: 'BIST', sector: 'Perakende' },
  { symbol: 'VESTL.IS', name: 'Vestel', exchange: 'BIST', sector: 'Dayanıklı Tüketim' },
  { symbol: 'KONTR.IS', name: 'Kontrolmatik', exchange: 'BIST', sector: 'Teknoloji' },
  { symbol: 'ODAS.IS', name: 'Odaş Elektrik', exchange: 'BIST', sector: 'Enerji' },
  { symbol: 'ARCLK.IS', name: 'Arçelik', exchange: 'BIST', sector: 'Dayanıklı Tüketim' },
  { symbol: 'SASA.IS', name: 'Sasa Polyester', exchange: 'BIST', sector: 'Kimya' },
  { symbol: 'TAVHL.IS', name: 'TAV Havalimanları', exchange: 'BIST', sector: 'Ulaştırma' },
  { symbol: 'DOHOL.IS', name: 'Doğan Holding', exchange: 'BIST', sector: 'Holding' },
  { symbol: 'ALARK.IS', name: 'Alarko Holding', exchange: 'BIST', sector: 'Holding' },
  { symbol: 'OYAKC.IS', name: 'Oyak Çimento', exchange: 'BIST', sector: 'İnşaat' },
  { symbol: 'TTKOM.IS', name: 'Türk Telekom', exchange: 'BIST', sector: 'Telekom' },
  { symbol: 'ULKER.IS', name: 'Ülker Bisküvi', exchange: 'BIST', sector: 'Gıda' },
  { symbol: 'AKSA.IS', name: 'Aksa', exchange: 'BIST', sector: 'Kimya' },
  { symbol: 'CCOLA.IS', name: 'Coca-Cola İçecek', exchange: 'BIST', sector: 'Tüketim' },
  { symbol: 'KRDMD.IS', name: 'Kardemir (D)', exchange: 'BIST', sector: 'Metal' },
  { symbol: 'SOKM.IS', name: 'Şok Marketler', exchange: 'BIST', sector: 'Perakende' },
];

export const GLOBAL_POPULAR: SymbolMeta[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', sector: 'Teknoloji' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', exchange: 'NASDAQ', sector: 'Teknoloji' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ', sector: 'Teknoloji' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', exchange: 'NASDAQ', sector: 'Perakende' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', exchange: 'NASDAQ', sector: 'Teknoloji' },
  { symbol: 'META', name: 'Meta Platforms', exchange: 'NASDAQ', sector: 'Teknoloji' },
  { symbol: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ', sector: 'Otomotiv' },
  { symbol: 'AVGO', name: 'Broadcom Inc.', exchange: 'NASDAQ', sector: 'Teknoloji' },
  { symbol: 'NFLX', name: 'Netflix Inc.', exchange: 'NASDAQ', sector: 'Medya' },
  { symbol: 'JPM', name: 'JPMorgan Chase', exchange: 'NYSE', sector: 'Bankacılık' },
  { symbol: 'V', name: 'Visa Inc.', exchange: 'NYSE', sector: 'Finans' },
  { symbol: 'MA', name: 'Mastercard Inc.', exchange: 'NYSE', sector: 'Finans' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', exchange: 'NYSE', sector: 'Sağlık' },
  { symbol: 'WMT', name: 'Walmart Inc.', exchange: 'NYSE', sector: 'Perakende' },
  { symbol: 'DIS', name: 'Walt Disney Co.', exchange: 'NYSE', sector: 'Medya' },
  { symbol: 'KO', name: 'Coca-Cola Co.', exchange: 'NYSE', sector: 'Tüketim' },
  { symbol: 'PEP', name: 'PepsiCo Inc.', exchange: 'NASDAQ', sector: 'Tüketim' },
  { symbol: 'INTC', name: 'Intel Corp.', exchange: 'NASDAQ', sector: 'Teknoloji' },
  { symbol: 'AMD', name: 'Advanced Micro Devices', exchange: 'NASDAQ', sector: 'Teknoloji' },
  { symbol: 'BA', name: 'Boeing Co.', exchange: 'NYSE', sector: 'Havacılık' },
  { symbol: 'VALE', name: 'Vale S.A.', exchange: 'OTHER', sector: 'Madencilik' },
  { symbol: 'PBR', name: 'Petrobras', exchange: 'OTHER', sector: 'Enerji' },
  { symbol: 'AMX', name: 'América Móvil', exchange: 'OTHER', sector: 'Telekom' },
  { symbol: 'SHEL.L', name: 'Shell plc', exchange: 'LSE', sector: 'Enerji' },
  { symbol: 'AZN.L', name: 'AstraZeneca', exchange: 'LSE', sector: 'Sağlık' },
  { symbol: 'SAP.DE', name: 'SAP SE', exchange: 'XETRA', sector: 'Teknoloji' },
  { symbol: 'SIE.DE', name: 'Siemens AG', exchange: 'XETRA', sector: 'Sanayi' },
  { symbol: 'ASML.AS', name: 'ASML Holding', exchange: 'EURONEXT', sector: 'Teknoloji' },
  { symbol: 'NESN.SW', name: 'Nestlé', exchange: 'SIX', sector: 'Tüketim' },
  { symbol: '7203.T', name: 'Toyota Motor', exchange: 'TOKYO', sector: 'Otomotiv' },
  { symbol: '6758.T', name: 'Sony Group', exchange: 'TOKYO', sector: 'Teknoloji' },
  { symbol: 'TSM', name: 'TSMC ADR', exchange: 'NYSE', sector: 'Teknoloji' },
  { symbol: 'BABA', name: 'Alibaba ADR', exchange: 'NYSE', sector: 'Perakende' },
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries', exchange: 'NSE', sector: 'Enerji' },
  { symbol: 'INFY.NS', name: 'Infosys', exchange: 'NSE', sector: 'Teknoloji' },
  { symbol: 'BHP.AX', name: 'BHP Group', exchange: 'ASX', sector: 'Madencilik' },
  { symbol: 'SHOP.TO', name: 'Shopify', exchange: 'TSX', sector: 'Teknoloji' },
];

export const ALL_SYMBOLS: SymbolMeta[] = [...BIST30, ...GLOBAL_POPULAR];

export type IndexMeta = { symbol: string; name: string; shortName: string; flag: string };

export const INDICES: IndexMeta[] = [
  { symbol: 'XU100.IS', name: 'BIST 100', shortName: 'BIST100', flag: '🇹🇷' },
  { symbol: 'XU030.IS', name: 'BIST 30', shortName: 'BIST30', flag: '🇹🇷' },
  { symbol: '^GSPC', name: 'S&P 500', shortName: 'S&P 500', flag: '🇺🇸' },
  { symbol: '^IXIC', name: 'Nasdaq Composite', shortName: 'Nasdaq', flag: '🇺🇸' },
  { symbol: '^DJI', name: 'Dow Jones', shortName: 'Dow', flag: '🇺🇸' },
  { symbol: '^GDAXI', name: 'DAX', shortName: 'DAX', flag: '🇩🇪' },
  { symbol: '^FCHI', name: 'CAC 40', shortName: 'CAC40', flag: '🇫🇷' },
  { symbol: '^FTSE', name: 'FTSE 100', shortName: 'FTSE100', flag: '🇬🇧' },
  { symbol: '^N225', name: 'Nikkei 225', shortName: 'Nikkei', flag: '🇯🇵' },
  { symbol: '^HSI', name: 'Hang Seng', shortName: 'HangSeng', flag: '🇭🇰' },
  { symbol: '^KS11', name: 'Kospi', shortName: 'Kospi', flag: '🇰🇷' },
  { symbol: '^BVSP', name: 'Bovespa', shortName: 'Bovespa', flag: '🇧🇷' },
  { symbol: '^MXX', name: 'S&P/BMV IPC', shortName: 'IPC Mex.', flag: '🇲🇽' },
  { symbol: '^STOXX50E', name: 'EURO STOXX 50', shortName: 'Euro Stoxx', flag: '🇪🇺' },
  { symbol: '^AEX', name: 'AEX', shortName: 'AEX', flag: '🇳🇱' },
  { symbol: '^IBEX', name: 'IBEX 35', shortName: 'IBEX', flag: '🇪🇸' },
  { symbol: 'FTSEMIB.MI', name: 'FTSE MIB', shortName: 'FTSE MIB', flag: '🇮🇹' },
  { symbol: '^SSMI', name: 'Swiss Market Index', shortName: 'SMI', flag: '🇨🇭' },
  { symbol: '^AXJO', name: 'S&P/ASX 200', shortName: 'ASX 200', flag: '🇦🇺' },
  { symbol: '^BSESN', name: 'BSE Sensex', shortName: 'Sensex', flag: '🇮🇳' },
  { symbol: '^NSEI', name: 'Nifty 50', shortName: 'Nifty 50', flag: '🇮🇳' },
  { symbol: '000001.SS', name: 'Shanghai Composite', shortName: 'Shanghai', flag: '🇨🇳' },
  { symbol: '^TWII', name: 'Taiwan Weighted', shortName: 'Taiwan', flag: '🇹🇼' },
  { symbol: '^STI', name: 'Straits Times', shortName: 'Singapore', flag: '🇸🇬' },
  { symbol: '^GSPTSE', name: 'S&P/TSX Composite', shortName: 'TSX', flag: '🇨🇦' },
];

export type FxMeta = { symbol: string; name: string; shortName: string; icon: string };

export const FOREX: FxMeta[] = [
  { symbol: 'USDTRY=X', name: 'Dolar/TL', shortName: 'USD/TRY', icon: '🇺🇸' },
  { symbol: 'EURTRY=X', name: 'Euro/TL', shortName: 'EUR/TRY', icon: '🇪🇺' },
  { symbol: 'GBPTRY=X', name: 'Sterlin/TL', shortName: 'GBP/TRY', icon: '🇬🇧' },
  { symbol: 'JPYTRY=X', name: 'Yen/TL', shortName: 'JPY/TRY', icon: '🇯🇵' },
  { symbol: 'CHFTRY=X', name: 'İsviçre Frangı/TL', shortName: 'CHF/TRY', icon: '🇨🇭' },
  { symbol: 'CADTRY=X', name: 'Kanada Doları/TL', shortName: 'CAD/TRY', icon: '🇨🇦' },
  { symbol: 'AUDTRY=X', name: 'Avustralya Doları/TL', shortName: 'AUD/TRY', icon: '🇦🇺' },
  { symbol: 'EURUSD=X', name: 'Euro/Dolar', shortName: 'EUR/USD', icon: '🇪🇺' },
  { symbol: 'GBPUSD=X', name: 'Sterlin/Dolar', shortName: 'GBP/USD', icon: '🇬🇧' },
  { symbol: 'USDJPY=X', name: 'Dolar/Yen', shortName: 'USD/JPY', icon: '🇯🇵' },
  { symbol: 'USDCHF=X', name: 'Dolar/Frank', shortName: 'USD/CHF', icon: '🇨🇭' },
  { symbol: 'AUDUSD=X', name: 'Avustralya Doları/Dolar', shortName: 'AUD/USD', icon: '🇦🇺' },
  { symbol: 'USDCAD=X', name: 'Dolar/Kanada Doları', shortName: 'USD/CAD', icon: '🇨🇦' },
  { symbol: 'USDCNY=X', name: 'Dolar/Yuan', shortName: 'USD/CNY', icon: '🇨🇳' },
];

export const COMMODITIES: FxMeta[] = [
  { symbol: 'GC=F', name: 'Altın (Ons)', shortName: 'Gold', icon: '🪙' },
  { symbol: 'SI=F', name: 'Gümüş (Ons)', shortName: 'Silver', icon: '⚪' },
  { symbol: 'CL=F', name: 'WTI Ham Petrol', shortName: 'WTI', icon: '🛢️' },
  { symbol: 'BZ=F', name: 'Brent Petrol', shortName: 'Brent', icon: '🛢️' },
  { symbol: 'NG=F', name: 'Doğalgaz', shortName: 'Nat. Gas', icon: '🔥' },
  { symbol: 'HG=F', name: 'Bakır', shortName: 'Copper', icon: '🟠' },
  { symbol: 'PL=F', name: 'Platin', shortName: 'Platinum', icon: '⚪' },
  { symbol: 'ZC=F', name: 'Mısır', shortName: 'Corn', icon: '🌽' },
  { symbol: 'ZW=F', name: 'Buğday', shortName: 'Wheat', icon: '🌾' },
  { symbol: 'KC=F', name: 'Kahve', shortName: 'Coffee', icon: '☕' },
];

export const CRYPTO: FxMeta[] = [
  { symbol: 'BTC-USD', name: 'Bitcoin', shortName: 'BTC', icon: '₿' },
  { symbol: 'ETH-USD', name: 'Ethereum', shortName: 'ETH', icon: 'Ξ' },
  { symbol: 'SOL-USD', name: 'Solana', shortName: 'SOL', icon: '◎' },
  { symbol: 'BNB-USD', name: 'BNB', shortName: 'BNB', icon: '◆' },
  { symbol: 'XRP-USD', name: 'XRP', shortName: 'XRP', icon: '✕' },
  { symbol: 'ADA-USD', name: 'Cardano', shortName: 'ADA', icon: '◉' },
  { symbol: 'DOGE-USD', name: 'Dogecoin', shortName: 'DOGE', icon: 'Ð' },
  { symbol: 'AVAX-USD', name: 'Avalanche', shortName: 'AVAX', icon: '▲' },
  { symbol: 'LINK-USD', name: 'Chainlink', shortName: 'LINK', icon: '⬡' },
  { symbol: 'DOT-USD', name: 'Polkadot', shortName: 'DOT', icon: '●' },
];

export const FUNDS: FxMeta[] = [
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF', shortName: 'SPY', icon: 'S' },
  { symbol: 'QQQ', name: 'Invesco QQQ ETF', shortName: 'QQQ', icon: 'Q' },
  { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', shortName: 'VTI', icon: 'V' },
  { symbol: 'IWM', name: 'iShares Russell 2000 ETF', shortName: 'IWM', icon: 'I' },
  { symbol: 'EEM', name: 'iShares Emerging Markets ETF', shortName: 'EEM', icon: 'E' },
  { symbol: 'VGK', name: 'Vanguard FTSE Europe ETF', shortName: 'VGK', icon: 'V' },
  { symbol: 'TUR', name: 'iShares MSCI Turkey ETF', shortName: 'TUR', icon: 'T' },
  { symbol: 'GLD', name: 'SPDR Gold Shares', shortName: 'GLD', icon: 'G' },
  { symbol: 'TLT', name: 'iShares 20+ Year Treasury Bond ETF', shortName: 'TLT', icon: 'T' },
  { symbol: 'BND', name: 'Vanguard Total Bond Market ETF', shortName: 'BND', icon: 'B' },
];

export const FX_AND_COMMODITIES: FxMeta[] = [...FOREX, ...COMMODITIES, ...CRYPTO, ...FUNDS];

export const CHART_RANGES = ['1D', '1W', '1M', '6M', '1Y', '5Y', 'ALL'] as const;
export type ChartRange = (typeof CHART_RANGES)[number];

export const RANGE_TO_YAHOO: Record<ChartRange, { range: string; interval: string }> = {
  '1D': { range: '1d', interval: '5m' },
  '1W': { range: '5d', interval: '15m' },
  '1M': { range: '1mo', interval: '1d' },
  '6M': { range: '6mo', interval: '1d' },
  '1Y': { range: '1y', interval: '1wk' },
  '5Y': { range: '5y', interval: '1wk' },
  ALL: { range: 'max', interval: '1mo' },
};
