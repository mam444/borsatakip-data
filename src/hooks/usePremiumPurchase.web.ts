// Web build of usePremiumPurchase. Metro resolves this file instead of
// usePremiumPurchase.ts automatically when bundling for the "web" platform
// (the ".web.ts" filename convention) — this keeps 'react-native-iap' (a
// native-only Nitro module; Play Billing has no web equivalent) out of the
// web bundle entirely, instead of just failing at runtime. Constants are
// duplicated (not re-exported from the native file) so nothing here ever
// imports react-native-iap, even transitively.
export type PlanId = 'weekly' | 'monthly' | 'lifetime';

export const PLAN_SKUS: Record<PlanId, string> = {
  weekly: 'borsatakip_vip_weekly',
  monthly: 'borsatakip_vip_monthly',
  lifetime: 'borsatakip_vip_lifetime',
};

export const SUGGESTED_PRICES: Record<PlanId, string> = {
  weekly: '₺39,99',
  monthly: '₺99,99',
  lifetime: '₺299,99',
};

export function usePremiumPurchase() {
  return {
    connected: false,
    planProduct: (_plan: PlanId) => undefined,
    planDisplayPrice: (plan: PlanId) => SUGGESTED_PRICES[plan],
    purchase: async (_plan: PlanId) => {
      throw new Error('in_app_purchases_not_supported_on_web');
    },
    restore: async () => {
      throw new Error('in_app_purchases_not_supported_on_web');
    },
    error: null as string | null,
  };
}
