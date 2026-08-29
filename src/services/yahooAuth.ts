// Yahoo tightened /v7/finance/quote to require a session cookie + "crumb" token
// (confirmed live: unauthenticated requests now return 401). This module fetches
// and caches that cookie/crumb pair in memory, refreshing once on expiry.
// Chart and search endpoints remain keyless and are unaffected.

const COMMON_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
};

type CrumbAuth = { cookie: string; crumb: string };

let cached: CrumbAuth | null = null;
let inFlight: Promise<CrumbAuth> | null = null;

function extractCookie(res: Response): string {
  const getSetCookie = (res.headers as any).getSetCookie?.bind(res.headers);
  const cookies: string[] = getSetCookie ? getSetCookie() : [];
  if (cookies.length > 0) {
    return cookies.map((c) => c.split(';')[0]).join('; ');
  }
  const single = res.headers.get('set-cookie');
  return single ? single.split(';')[0] : '';
}

async function fetchCrumbAuth(): Promise<CrumbAuth> {
  const cookieRes = await fetch('https://fc.yahoo.com', { headers: COMMON_HEADERS, redirect: 'manual' as any });
  const cookie = extractCookie(cookieRes);

  const crumbRes = await fetch('https://query2.finance.yahoo.com/v1/test/getcrumb', {
    headers: { ...COMMON_HEADERS, Cookie: cookie },
  });
  const crumb = (await crumbRes.text()).trim();

  if (!crumb || crumb.includes('<html')) {
    throw new Error('Failed to obtain Yahoo Finance crumb');
  }
  return { cookie, crumb };
}

export async function getCrumbAuth(forceRefresh = false): Promise<CrumbAuth> {
  if (cached && !forceRefresh) return cached;
  if (inFlight && !forceRefresh) return inFlight;

  inFlight = fetchCrumbAuth()
    .then((auth) => {
      cached = auth;
      inFlight = null;
      return auth;
    })
    .catch((err) => {
      inFlight = null;
      throw err;
    });

  return inFlight;
}

export function invalidateCrumbAuth() {
  cached = null;
}
