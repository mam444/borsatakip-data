export function formatPrice(value: number | null | undefined, currency?: string): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  const decimals = Math.abs(value) < 10 ? 4 : Math.abs(value) < 1000 ? 2 : 2;
  const formatted = value.toLocaleString('tr-TR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return currency ? `${formatted} ${currency}` : formatted;
}

export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export function formatSignedPrice(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  const sign = value > 0 ? '+' : '';
  return `${sign}${formatPrice(value)}`;
}

export function compactNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000_000) return `${(value / 1_000_000_000_000).toFixed(2)}T`;
  if (abs >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(2)}K`;
  return value.toString();
}

export function formatDate(iso: string, locale: string = 'tr-TR'): string {
  try {
    return new Date(iso).toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

export function formatDateTime(iso: string, locale: string = 'tr-TR'): string {
  try {
    return new Date(iso).toLocaleString(locale, {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function changeColorKey(value: number | null | undefined): 'positive' | 'negative' | 'neutral' {
  if (value === null || value === undefined || Number.isNaN(value) || value === 0) return 'neutral';
  return value > 0 ? 'positive' : 'negative';
}
