// Keyless financial news via public RSS feeds, parsed client-side.
import { XMLParser } from 'fast-xml-parser';

export type NewsItem = {
  id: string;
  title: string;
  link: string;
  source: string;
  publishedAt: string;
  summary?: string;
};

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });

function toArray<T>(v: T | T[] | undefined): T[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

async function fetchRss(url: string, sourceName: string): Promise<NewsItem[]> {
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const xml = await res.text();
    const json = parser.parse(xml);
    const items = toArray(json?.rss?.channel?.item);
    return items.map((item: any, i: number) => ({
      id: `${sourceName}-${i}-${item.guid?.['#text'] ?? item.guid ?? item.link ?? i}`,
      title: String(item.title ?? '').trim(),
      link: String(item.link ?? ''),
      source: sourceName,
      publishedAt: item.pubDate ?? '',
      summary: item.description ? String(item.description).replace(/<[^>]+>/g, '').trim() : undefined,
    }));
  } catch {
    return [];
  }
}

export async function getMarketNews(): Promise<NewsItem[]> {
  const feeds = [
    { url: 'https://finance.yahoo.com/news/rssindex', source: 'Yahoo Finance' },
    { url: 'https://www.investing.com/rss/news_25.rss', source: 'Investing.com' },
  ];
  const results = await Promise.all(feeds.map((f) => fetchRss(f.url, f.source)));
  return results
    .flat()
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 40);
}

export async function getSymbolNews(symbol: string): Promise<NewsItem[]> {
  const bare = symbol.split('.')[0];
  const url = `https://feeds.finance.yahoo.com/rss/2.0/headline?s=${encodeURIComponent(bare)}&region=US&lang=en-US`;
  return fetchRss(url, 'Yahoo Finance');
}
