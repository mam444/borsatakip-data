import type { DisplayCurrency } from '../store/useSettingsStore';

// Portfolio/home aggregate totals are always computed in TRY internally
// (see src/utils/portfolioMath.ts). This converts that base amount to
// whatever currency the user picked in Settings for display purposes only.
export function convertFromTRY(amountTRY: number, target: DisplayCurrency, usdTryRate: number | undefined): number {
  if (target === 'TRY') return amountTRY;
  if (!usdTryRate) return amountTRY;
  return amountTRY / usdTryRate;
}

export function currencySymbol(target: DisplayCurrency): string {
  return target === 'TRY' ? '₺' : '$';
}
