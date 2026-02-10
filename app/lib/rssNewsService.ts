import { XMLParser } from "fast-xml-parser";

/* =======================
   Types
======================= */
export interface Article {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  impactScore: number;
}

/* =======================
   Utils
======================= */
function cleanHTML(input: string): string {
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function extractLink(item: any): string {
  if (typeof item.link === "string") return item.link;
  if (item.link?.["@_href"]) return item.link["@_href"];
  return "";
}

/* =======================
   Google News RSS (PRIMARY)
======================= */
function getGoogleNewsFeed(stock: string) {
  const query = `"${stock}" stock OR "${stock}" shares OR "${stock}" earnings`;
  return `https://news.google.com/rss/search?q=${encodeURIComponent(
    query
  )}&hl=en-IN&gl=IN&ceid=IN:en`;
}

/* =======================
   Indian Finance RSS (SECONDARY)
======================= */
const BASE_RSS_FEEDS = [
  "https://www.moneycontrol.com/rss/marketreports.xml",
  "https://www.moneycontrol.com/rss/results.xml",
  "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms",
  "https://www.livemint.com/rss/markets",
  "https://www.business-standard.com/rss/markets-106.rss",
];

/* =======================
   Company Aliases
======================= */
const STOCK_ALIASES: Record<string, string[]> = {
  RELIANCE: ["reliance", "ril", "jio", "reliance retail"],
  TCS: ["tcs", "tata consultancy"],
  INFY: ["infosys", "infy"],
  HDFCBANK: ["hdfc bank", "hdfc"],
};

/* =======================
   Sector Exposure
======================= */
const STOCK_SECTOR_MAP: Record<string, string[]> = {
  RELIANCE: ["oil", "gas", "crude", "energy", "telecom", "retail"],
  TCS: ["it", "software", "technology"],
  INFY: ["it", "software", "technology"],
  HDFCBANK: ["bank", "credit", "loan", "interest rate"],
};

/* =======================
   Impact Scoring
======================= */
function scoreImpact(text: string, stock: string): number {
  let score = 0;
  const t = text.toLowerCase();

  const aliases = STOCK_ALIASES[stock] || [stock.toLowerCase()];
  const sectors = STOCK_SECTOR_MAP[stock] || [];

  // Direct company news
  if (aliases.some(a => t.includes(a))) score += 50;

  // Corporate actions
  if (t.match(/earnings|results|profit|loss|guidance|margin|acquisition|merger|dividend|stake/))
    score += 30;

  // Sector impact
  if (sectors.some(s => t.includes(s))) score += 20;

  // Index context (only if company mentioned)
  if (score >= 50 && t.match(/sensex|nifty|benchmark|indices/))
    score += 10;

  // Macro (weakest)
  if (t.match(/rbi|interest rate|inflation|crude|fed|government policy/))
    score += 8;

  return score;
}

/* =======================
   Time Decay
======================= */
function applyTimeDecay(publishedAt: number, days: number): number {
  const ageHours = (Date.now() - publishedAt) / 36e5;

  if (days === 1) return Math.max(0.75, 1 - ageHours / 24);
  if (days === 7) return Math.max(0.55, 1 - ageHours / (24 * 7));
  return Math.max(0.35, 1 - ageHours / (24 * 30));
}

/* =======================
   RSS Fetch (FINAL)
======================= */
export async function fetchRSSNews(
  stock: string,
  days: number
): Promise<Article[]> {
  const parser = new XMLParser({ ignoreAttributes: false });
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

  const MIN_IMPACT =
    days === 1 ? 35 :
    days === 7 ? 22 :
    15;

  const feeds = [
    getGoogleNewsFeed(stock),
    ...BASE_RSS_FEEDS,
  ];

  const collected: Article[] = [];

  for (const feed of feeds) {
    try {
      const res = await fetch(feed, { cache: "no-store" });
      const xml = await res.text();
      const json = parser.parse(xml);

      const items =
        json?.rss?.channel?.item ||
        json?.feed?.entry ||
        [];

      for (const item of items) {
        const published = new Date(
          item.pubDate || item.published || ""
        ).getTime();

        if (!published || published < cutoff) continue;

        const title = cleanHTML(item.title || "");
        const description = cleanHTML(item.description || item.summary || "");
        const text = `${title} ${description}`;

        let impactScore = scoreImpact(text, stock);
        if (impactScore < MIN_IMPACT) continue;

        impactScore *= applyTimeDecay(published, days);

        collected.push({
          title,
          description,
          url: extractLink(item),
          source: feed.includes("google")
            ? "Google News"
            : cleanHTML(item.source?.title || feed),
          publishedAt: new Date(published).toISOString(),
          impactScore: Number(impactScore.toFixed(2)),
        });
      }
    } catch {
      console.warn("RSS failed:", feed);
    }
  }

  collected.sort((a, b) => b.impactScore - a.impactScore);

  const final = collected.slice(0, 25);

  console.log(
    `📰 FINAL (${stock}, ${days}d): ${final.length} articles | minImpact=${MIN_IMPACT}`
  );

  return final;
}
