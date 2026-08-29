import { useEffect, useCallback, useState } from 'react';
import { useIAP } from 'react-native-iap';
import { usePremiumStore } from '../store/usePremiumStore';

// Three VIP plans wired against react-native-iap's OpenIAP hook API: two
// auto-renewing subscriptions (weekly/monthly) and one non-consumable lifetime
// unlock. IMPORTANT: purchases can only actually complete in a Play Store
// release build with these SKUs configured as real products/subscriptions in
// Play Console, on a real device — not in Expo Go or a bare dev environment.
// The hook degrades gracefully (connected stays false, purchase() rejects with
// a clear error) rather than crashing when the store isn't reachable.
export type PlanId = 'weekly' | 'monthly' | 'lifetime';

export const PLAN_SKUS: Record<PlanId, string> = {
  weekly: 'borsatakip_vip_weekly',
  monthly: 'borsatakip_vip_monthly',
  lifetime: 'borsatakip_vip_lifetime',
};

const SUBSCRIPTION_SKUS = [PLAN_SKUS.weekly, PLAN_SKUS.monthly];
const IN_APP_SKUS = [PLAN_SKUS.lifetime];

// Shown until the real store price loads (or when running outside a Play
// Store build) — a reasonable placeholder that mirrors what you'd configure
// as the actual base price in Play Console.
export const SUGGESTED_PRICES: Record<PlanId, string> = {
  weekly: '₺39,99',
  monthly: '₺99,99',
  lifetime: '₺299,99',
};

export function usePremiumPurchase() {
  const setPremium = usePremiumStore((s) => s.setPremium);
  const [error, setError] = useState<string | null>(null);

  const {
    connected,
    products,
    subscriptions,
    fetchProducts,
    requestPurchase,
    finishTransaction,
    restorePurchases,
    availablePurchases,
    getAvailablePurchases,
  } = useIAP({
    onPurchaseSuccess: (purchase) => {
      setPremium(purchase.productId || PLAN_SKUS.lifetime);
      finishTransaction({ purchase, isConsumable: false }).catch(() => {});
    },
    onPurchaseError: (err) => setError(err.message),
    onError: (err) => setError(err.message),
  });

  useEffect(() => {
    if (!connected) return;
    fetchProducts({ skus: IN_APP_SKUS, type: 'in-app' }).catch(() => {});
    fetchProducts({ skus: SUBSCRIPTION_SKUS, type: 'subs' }).catch(() => {});
    getAvailablePurchases().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected]);

  useEffect(() => {
    if (availablePurchases.some((p) => Object.values(PLAN_SKUS).includes(p.productId))) {
      setPremium(availablePurchases[0].productId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availablePurchases]);

  const planProduct = useCallback(
    (plan: PlanId) => {
      if (plan === 'lifetime') return products.find((p) => p.id === PLAN_SKUS.lifetime);
      return subscriptions.find((p) => p.id === PLAN_SKUS[plan]);
    },
    [products, subscriptions]
  );

  const planDisplayPrice = useCallback(
    (plan: PlanId): string => {
      const product = planProduct(plan);
      if (!product) return SUGGESTED_PRICES[plan];
      if (plan === 'lifetime') return product.displayPrice;
      const sub = product as ReturnType<typeof subscriptions.find>;
      return sub?.subscriptionOffers?.[0]?.displayPrice ?? product.displayPrice ?? SUGGESTED_PRICES[plan];
    },
    [planProduct]
  );

  const purchase = useCallback(
    async (plan: PlanId) => {
      if (!connected) {
        throw new Error('store_not_connected');
      }
      setError(null);
      const sku = PLAN_SKUS[plan];

      if (plan === 'lifetime') {
        await requestPurchase({ request: { google: { skus: [sku] } }, type: 'in-app' });
        return;
      }

      const sub = subscriptions.find((p) => p.id === sku);
      const offerToken = sub?.subscriptionOffers?.[0]?.offerTokenAndroid;
      if (!offerToken) {
        throw new Error('offer_not_available');
      }
      await requestPurchase({
        request: { google: { skus: [sku], subscriptionOffers: [{ sku, offerToken }] } },
        type: 'subs',
      });
    },
    [connected, requestPurchase, subscriptions]
  );

  const restore = useCallback(async () => {
    setError(null);
    await restorePurchases();
  }, [restorePurchases]);

  return { connected, planProduct, planDisplayPrice, purchase, restore, error };
}
