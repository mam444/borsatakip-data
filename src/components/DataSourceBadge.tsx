import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { hasLicensedProvider, marketDataProvider } from '../services/marketData';
import { Text } from './Text';

export function DataSourceBadge() {
  const { colors, radius, spacing } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, padding: spacing.sm, borderRadius: radius.md, backgroundColor: hasLicensedProvider ? colors.positiveSoft : colors.bgCard, borderWidth: 1, borderColor: hasLicensedProvider ? colors.positive + '44' : colors.border }}>
      <View style={{ width: 32, height: 32, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: hasLicensedProvider ? colors.positiveSoft : colors.bgCardAlt }}>
        <Ionicons name={hasLicensedProvider ? 'radio' : 'cloud-outline'} size={16} color={hasLicensedProvider ? colors.positive : colors.textTertiary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="caption" weight="bold">{hasLicensedProvider ? 'Çoklu piyasa API bağlantısı' : 'Yedek veri bağlantısı'}</Text>
        <Text variant="label" color="tertiary" numberOfLines={1}>{marketDataProvider}</Text>
      </View>
      <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: hasLicensedProvider ? colors.positive : colors.gold }} />
    </View>
  );
}
