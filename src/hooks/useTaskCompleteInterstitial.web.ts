// Interstitial ads are intentionally disabled in the browser preview because
// react-native-google-mobile-ads only provides Android/iOS native modules.
export function useTaskCompleteInterstitial() {
  return {
    showIfReady: (_after?: () => void) => {
      _after?.();
    },
  };
}
