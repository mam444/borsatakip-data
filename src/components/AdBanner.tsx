import React, { useState } from 'react';
import { View } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { AD_UNIT_BANNER } from '../services/ads';
import { usePremiumStore } from '../store/usePremiumStore';
import { useTheme } from '../theme/ThemeProvider';

type Props = {
  style?: object;
};

// VIP users never see ads. Renders nothing until the ad actually loads so it
// never reserves blank space — same graceful-degradation pattern used for
// quotes/logos elsewhere in the app.
export function AdBanner({ style }: Props) {
  const isPremium = usePremiumStore((s) => s.isPremium);
  const { colors, radius } = useTheme();
  const [loaded, setLoaded] = useState(false);

  if (isPremium) return null;

  return (
    <View
      style={[
        {
          alignItems: 'center',
          overflow: 'hidden',
          borderRadius: radius.md,
          backgroundColor: loaded ? colors.bgCard : 'transparent',
        },
        style,
      ]}
    >
      <BannerAd
        unitId={AD_UNIT_BANNER}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        onAdLoaded={() => setLoaded(true)}
        onAdFailedToLoad={() => setLoaded(false)}
      />
    </View>
  );
}
