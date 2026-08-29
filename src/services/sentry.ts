import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

const dsn = Constants.expoConfig?.extra?.sentryDsn as string | undefined;

Sentry.init({
  dsn: dsn || undefined,
  enabled: !!dsn,
  tracesSampleRate: 1.0,
  debug: __DEV__,
});

export { Sentry };
