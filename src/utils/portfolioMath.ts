import { Transaction } from '../store/usePortfolioStore';

export type Holding = {
  symbol: string;
  quantity: number;
  avgCost: number;
  totalCost: number;
  realizedPL: number;
  totalFees: number;
};

// Weighted-average cost basis method (simpler and more common for retail portfolio
// trackers than FIFO lot matching, and sufficient for a personal tracking app).
export function computeHoldings(transactions: Transaction[]): Holding[] {
  const bySymbol = new Map<string, Holding>();

  const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  for (const tx of sorted) {
    let h = bySymbol.get(tx.symbol);
    if (!h) {
      h = { symbol: tx.symbol, quantity: 0, avgCost: 0, totalCost: 0, realizedPL: 0, totalFees: 0 };
      bySymbol.set(tx.symbol, h);
    }
    h.totalFees += tx.fees ?? 0;

    if (tx.type === 'buy') {
      const newTotalCost = h.totalCost + tx.quantity * tx.price + (tx.fees ?? 0);
      const newQuantity = h.quantity + tx.quantity;
      h.totalCost = newTotalCost;
      h.quantity = newQuantity;
      h.avgCost = newQuantity > 0 ? newTotalCost / newQuantity : 0;
    } else {
      const sellQty = Math.min(tx.quantity, h.quantity);
      const costOfSold = sellQty * h.avgCost;
      const proceeds = sellQty * tx.price - (tx.fees ?? 0);
      h.realizedPL += proceeds - costOfSold;
      h.quantity -= sellQty;
      h.totalCost = h.quantity * h.avgCost;
    }
  }

  return Array.from(bySymbol.values()).filter((h) => h.quantity > 1e-9 || h.realizedPL !== 0);
}

export type HoldingWithMarket = Holding & {
  price?: number;
  currency?: string;
  marketValue?: number;
  marketValueBase?: number;
  unrealizedPL?: number;
  unrealizedPLPercent?: number;
  dayChangePercent?: number;
};

// Transaction prices are assumed entered in the stock's own native currency
// (e.g. a THYAO.IS buy is TRY, an AAPL buy is USD) — that's what a user actually
// sees and types when placing a real trade. To sum a portfolio that mixes BIST
// and US holdings correctly, every holding is converted to a common base
// currency (TRY) using the live USD/TRY rate before totals are added up;
// non-USD/TRY currencies pass through unconverted (rare for this app's universe).
export function attachMarketData(
  holdings: Holding[],
  quotesBySymbol: Map<string, { price?: number; changePercent?: number; currency?: string }>,
  usdTryRate: number | undefined
): HoldingWithMarket[] {
  return holdings.map((h) => {
    const q = quotesBySymbol.get(h.symbol);
    const price = q?.price;
    const currency = q?.currency;
    const marketValue = price !== undefined ? price * h.quantity : undefined;

    const toBase = (amount: number) => (currency === 'USD' && usdTryRate ? amount * usdTryRate : amount);

    const marketValueBase = marketValue !== undefined ? toBase(marketValue) : undefined;
    const costBase = toBase(h.avgCost * h.quantity);
    const unrealizedPL = marketValueBase !== undefined ? marketValueBase - costBase : undefined;
    const unrealizedPLPercent = unrealizedPL !== undefined && costBase > 0 ? (unrealizedPL / costBase) * 100 : undefined;

    return {
      ...h,
      price,
      currency,
      marketValue,
      marketValueBase,
      unrealizedPL,
      unrealizedPLPercent,
      dayChangePercent: q?.changePercent,
    };
  });
}

export function summarizePortfolio(holdings: HoldingWithMarket[], usdTryRate: number | undefined) {
  let totalValue = 0;
  let totalCost = 0;
  let totalUnrealizedPL = 0;
  let totalRealizedPL = 0;
  let dayChangeValue = 0;

  for (const h of holdings) {
    const toBase = (amount: number) => (h.currency === 'USD' && usdTryRate ? amount * usdTryRate : amount);
    totalValue += h.marketValueBase ?? 0;
    totalCost += toBase(h.avgCost * h.quantity);
    totalUnrealizedPL += h.unrealizedPL ?? 0;
    totalRealizedPL += toBase(h.realizedPL);
    if (h.dayChangePercent !== undefined && h.marketValueBase !== undefined) {
      // approximate previous-day value from current value and % change
      const prevValue = h.marketValueBase / (1 + h.dayChangePercent / 100);
      dayChangeValue += h.marketValueBase - prevValue;
    }
  }

  const totalPL = totalUnrealizedPL + totalRealizedPL;
  const totalPLPercent = totalCost > 0 ? (totalUnrealizedPL / totalCost) * 100 : 0;
  const dayChangePercent = totalValue - dayChangeValue > 0 ? (dayChangeValue / (totalValue - dayChangeValue)) * 100 : 0;

  return {
    totalValue,
    totalCost,
    totalUnrealizedPL,
    totalRealizedPL,
    totalPL,
    totalPLPercent,
    dayChangeValue,
    dayChangePercent,
  };
}
