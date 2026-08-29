import type { Portfolio } from '../store/usePortfolioStore';

export function portfoliosToCsv(portfolios: Portfolio[]): string {
  const header = 'Portföy,Sembol,Tür,Adet,Fiyat,Komisyon,Tarih,Not';
  const rows = portfolios.flatMap((p) =>
    p.transactions.map((tx) =>
      [
        p.name,
        tx.symbol,
        tx.type === 'buy' ? 'Alış' : 'Satış',
        tx.quantity,
        tx.price,
        tx.fees,
        tx.date.slice(0, 10),
        tx.note ?? '',
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(',')
    )
  );
  return [header, ...rows].join('\n');
}
