# BorsaTakip ücretsiz veri Worker’ı

Bu Worker, Yahoo Finance chart/search uçlarını tek bir önbellekli API altında toplar. Uygulama doğrudan dış servise gitmek yerine `EXPO_PUBLIC_MARKET_DATA_PROXY_URL` ile bu Worker’ı kullanabilir.

## Kurulum

```bash
npm install -g wrangler
wrangler login
wrangler deploy
```

Deploy sonrası Expo ortam değişkenine Worker adresini verin:

```text
EXPO_PUBLIC_MARKET_DATA_PROXY_URL=https://borsatakip-market-worker.<hesap>.workers.dev
```

Worker her 5 dakikada varsayılan sembolleri ısıtır; istek sonuçları fiyatlarda 30 saniye, grafiklerde 60 saniye önbelleklenir. Uygulama tarafındaki mevcut `marketData.ts` bu `/quote`, `/time_series` ve `/symbol_search` biçimleriyle uyumludur.

Bu ücretsiz katman yatırım tavsiyesi veya lisanslı borsa verisi değildir. Yahoo uçları değişebilir; BIST/KAP canlı ve ticari kullanım için resmi veri lisansı gerekir.
