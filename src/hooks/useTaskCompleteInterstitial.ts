import { useEffect, useRef } from 'react';
import { useInterstitialAd } from 'react-native-google-mobile-ads';
import { AD_UNIT_INTERSTITIAL } from '../services/ads';
import { usePremiumStore } from '../store/usePremiumStore';

// Session-wide cap so free users see at most one interstitial per app open
// across all "task complete" moments (e.g. saving an alert) — avoids
// stacking multiple ads if someone completes several actions in one visit.
let shownThisSession = false;

// Call `showIfReady()` right after a natural task-completion point (an alert
// saved, a transaction logged) — never mid-task or on a timer, so it never
// interrupts something the user is still doing.
export function useTaskCompleteInterstitial() {
  const isPremium = usePremiumStore((s) => s.isPremium);
  const { isLoaded, load, show } = useInterstitialAd(isPremium ? null : AD_UNIT_INTERSTITIAL);
  const loadedRef = useRef(isLoaded);
  loadedRef.current = isLoaded;

  useEffect(() => {
    if (!isPremium) load();
  }, [isPremium, load]);

  const showIfReady = () => {
    if (isPremium || shownThisSession || !loadedRef.current) return;
    shownThisSession = true;
    show();
  };

  return { showIfReady };
}
