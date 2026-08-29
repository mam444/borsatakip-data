# BorsaTakip

Premium stock market tracking app for BIST (Turkish) and global markets, built with Expo + React Native + TypeScript, targeting the Google Play Store.

## Features

- **Home dashboard** — portfolio summary, index strip, watchlist preview, market movers, latest news
- **Watchlist** — multiple lists, swipe-to-delete, live sparklines
- **Portfolio** — multiple portfolios, buy/sell transactions, realized/unrealized P&L, allocation donut chart
- **Markets** — indices, currencies & commodities, gainers/losers/most active, sector heatmap
- **Stock detail** — interactive line/candlestick chart (1D–ALL), key stats, 52-week range, per-symbol news
- **Price alerts** — target price notifications (foreground-checked)
- **Search** — BIST + global symbol search, with recent-search history
- **Settings** — theme (dark/light/system), language (TR/EN), currency (with live conversion), refresh interval
- **Real company logos** — curated TradingView logo CDN mapping (`src/constants/logos.ts`), with automatic fallback to a colored-initials avatar for unmapped symbols
- **BorsaTakip VIP** — one-time in-app purchase unlocking unlimited watchlists/portfolios/alerts, 5s refresh, and advanced per-stock stats (dividend yield, analyst rating, 50/200-day average, bid/ask)

## Data source

Quotes, charts, and search use Yahoo Finance's endpoints — see `src/services/yahooFinance.ts`. The `/v7/finance/quote` endpoint now requires a session cookie + crumb token (Yahoo tightened this; confirmed live during development), so `getQuotes()` authenticates via `src/services/yahooAuth.ts`, retries once on crumb expiry, and as a last resort derives a reduced quote from the still-keyless `chart` endpoint so the app degrades gracefully instead of breaking. This has no SLA and may change again; it was chosen because it's the only free source covering both BIST (`.IS` suffix tickers) and global markets in one API. News uses public RSS feeds (`src/services/news.ts`).

If you later want a commercial-grade data source, only `src/services/yahooFinance.ts` needs to change — hooks and UI consume it through `src/hooks/useQuotes.ts`, `useChart.ts`, and `useSearch.ts`.

**Note on the web preview**: `npx expo start --web` will not show live prices — Yahoo Finance's endpoints don't send CORS headers, so browsers block the requests (this is a browser-only restriction). The Android app is unaffected since native apps aren't subject to CORS. Use Expo Go on a device or an Android emulator to see real data.

## In-app purchase (VIP)

Wired with `react-native-iap` (OpenIAP/Nitro API) against SKU `borsatakip_vip_lifetime` — see `src/hooks/usePremiumPurchase.ts` and `app/premium.tsx`. **This can only complete a real purchase in a Play Store release build, on a real device, with that SKU configured in Play Console** — it cannot be exercised in Expo Go or a bare JS environment, and the UI shows an "unavailable" state rather than crashing when the store isn't reachable. Before shipping:

1. Create a one-time (non-consumable) in-app product in Play Console with product ID `borsatakip_vip_lifetime` (or change the SKU in `usePremiumPurchase.ts` to match one you create).
2. Build with EAS (`eas build`) and install that build via internal testing — Expo Go cannot load the native billing module.
3. Free-tier limits are centralized in `src/store/usePremiumStore.ts` (`FREE_LIMITS`) if you want to tune them.

## Development

```bash
npm install
npx expo start
```

Press `a` for Android (emulator or a device with Expo Go / a dev build), `w` for web.

## Building for Android / Play Store

This project uses [EAS Build](https://docs.expo.dev/build/introduction/). You'll need your own free Expo account and, to publish, a Google Play Developer account ($25 one-time).

```bash
npm install -g eas-cli
eas login
eas build:configure          # first time only
eas build --platform android --profile production
```

When the build finishes, download the `.aab` and upload it via the [Play Console](https://play.google.com/console), or use:

```bash
eas submit --platform android
```

Before your first real release:

1. Replace `assets/icon.png`, `assets/android-icon-foreground.png`, `assets/android-icon-background.png`, `assets/android-icon-monochrome.png` with real branding (current files are Expo's default placeholders).
2. Review `app.json` — `android.package` is set to `com.borsatakip.app`; change it if you want a different application id (cannot be changed after the first Play Store upload).
3. Bump `expo.version` / Android `versionCode` per Play Store release requirements.

## Project structure

See inline comments in `src/services/yahooFinance.ts` and the app router tree under `app/` (Expo Router, file-based). State lives in `src/store/*` (Zustand + AsyncStorage persistence); no backend is required.
