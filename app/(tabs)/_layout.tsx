import React from 'react';
import { Tabs } from 'expo-router/js-tabs';
import { TabBar } from '../../src/components/TabBar';

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props: any) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="markets" />
      <Tabs.Screen name="portfolio" />
      <Tabs.Screen name="watchlist" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="search" options={{ href: null }} />
    </Tabs>
  );
}
