import { Platform } from 'react-native';
import Constants from 'expo-constants';
import MobileAds, { TestIds } from 'react-native-google-mobile-ads';

MobileAds()
  .initialize()
  .catch(() => {});

// Mirrors the Sentry DSN / IAP pattern: falls back to Google's official public
// test ad unit IDs (always fill, never a real charge) until the user creates
// a real AdMob account and drops their production unit IDs into app.json's
// `extra` field. Never ships real ads with test IDs or vice versa by accident
// since TestIds already resolves to the correct platform automatically.
const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string | undefined>;

const bannerOverride = Platform.select({ android: extra.adBannerIdAndroid, ios: extra.adBannerIdIos });
const interstitialOverride = Platform.select({ android: extra.adInterstitialIdAndroid, ios: extra.adInterstitialIdIos });

export const AD_UNIT_BANNER = bannerOverride || TestIds.BANNER;
export const AD_UNIT_INTERSTITIAL = interstitialOverride || TestIds.INTERSTITIAL;
