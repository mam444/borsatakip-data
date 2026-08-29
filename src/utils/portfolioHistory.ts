import type { Transaction } from '../store/usePortfolioStore';
import type { ChartPoint } from '../services/yahooFinance';

// Quantity actually held for one symbol as of a given time, replaying that
// symbol's own buy/sell transactions in order (not the current quantity
// projected backward) — so the resulting value series reflects real position
// sizing over time, not just today's holding applied retroactively.
function quantityAsOf(transactions: Transaction[], timestampMs: number): number {
  let qty = 0;
  for (const tx of transactions) {
    if (new Date(tx.date).getTime() > timestampMs) break;
    qty += tx.type === 'buy' ? tx.quantity : -tx.quantity;
  }
  return Math.max(0, qty);
}

// Finds the latest chart point at or before `timestampMs` (points assumed sorted ascending).
function closeAtOrBefore(points: ChartPoint[], timestampMs: number): number | undefined {
  let result: number | undefined;
  for (const p of points) {
    if (p.timestamp > timestampMs) break;
    result = p.close;
  }
  return result;
}

export type PortfolioHistoryPoint = { timestamp: number; value: number };

export function computePortfolioHistory(
  transactionsBySymbol: Record<string, Transaction[]>,
  chartsBySymbol: Record<string, { points: ChartPoint[]; currency?: string }>,
  usdTryRate: number | undefined
): PortfolioHistoryPoint[] {
  const symbols = Object.keys(chartsBySymbol);
  if (symbols.length === 0) return [];

  // Use the symbol with the most data points as the reference timeline —
  // other symbols' nearest prior close is looked up against it.
  const referenceSymbol = symbols.reduce((best, s) =>
    (chartsBySymbol[s]?.points.length ?? 0) > (chartsBySymbol[best]?.points.length ?? 0) ? s : best
  , symbols[0]);
  const referenceTimestamps = chartsBySymbol[referenceSymbol].points.map((p) => p.timestamp);

  return referenceTimestamps.map((ts) => {
    let value = 0;
    for (const symbol of symbols) {
      const qty = quantityAsOf(transactionsBySymbol[symbol] ?? [], ts);
      if (qty <= 0) continue;
      const close = closeAtOrBefore(chartsBySymbol[symbol].points, ts);
      if (close === undefined) continue;
      const currency = chartsBySymbol[symbol].currency;
      const valueNative = qty * close;
      value += currency === 'USD' && usdTryRate ? valueNative * usdTryRate : valueNative;
    }
    return { timestamp: ts, value };
  });
}
