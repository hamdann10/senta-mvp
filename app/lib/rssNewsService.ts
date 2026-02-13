import { XMLParser } from "fast-xml-parser";
import { STOCK_PROFILES } from "@/app/data/stockProfiles";
import { buildStockProfile } from "@/app/lib/profileBuilder";
import { scoreImpact } from "@/app/lib/impactScorer";

/* ======================= TYPES ======================= */

export interface Article {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  impactScore: number;
}

/* ======================= UTILS ======================= */

function cleanHTML(input: string = ""): string {
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

/* ======================= GOOGLE NEWS QUERY ======================= */

function getGoogleNewsFeed(profile: any) {
  const aliasQuery = profile.aliases
    .map((a: string) => `"${a}"`)
    .join(" OR ");

  const query = `(${aliasQuery}) AND (stock OR shares OR earnings OR results OR profit OR loss OR guidance OR dividend OR acquisition OR merger OR target OR rating OR approval)`;

  return `https://news.google.com/rss/search?q=${encodeURIComponent(
    query
  )}&hl=en-IN&gl=IN&ceid=IN:en`;
}

/* ======================= TIME DECAY ======================= */

function applyTimeDecay(publishedAt: number, days: number): number {
  const ageHours = (Date.now() - publishedAt) / 36e5;

  if (days === 1) return Math.max(0.85, 1 - ageHours / 24);
  if (days === 7) return Math.max(0.65, 1 - ageHours / (24 * 7));
  return Math.max(0.45, 1 - ageHours / (24 * 30));
}

/* ======================= CORE FETCH ======================= */

export async function fetchRSSNews(
  stock: string,
  days: number
): Promise<Article[]> {

  const parser = new XMLParser({ ignoreAttributes: false });
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

  // 🔥 HYBRID PROFILE SYSTEM
  const manualProfile = STOCK_PROFILES[stock];
  const autoProfile = buildStockProfile(stock);
  const profile = manualProfile || autoProfile;

  if (!profile) {
    console.warn(`Stock ${stock} not found in NSE list`);
    return [];
  }

  const MIN_IMPACT =
    days === 1 ? 45 :
    days === 7 ? 30 :
    20;

  const feed = getGoogleNewsFeed(profile);

  const collected: Article[] = [];
  const seenUrls = new Set<string>();

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

      // ⛔ STRICT TIME FILTER
      if (!published || isNaN(published) || published < cutoff) continue;

      const title = cleanHTML(item.title || "");
      const description = cleanHTML(item.description || item.summary || "");
      const url = extractLink(item);

      if (!url || seenUrls.has(url)) continue;
      seenUrls.add(url);

      const text = `${title} ${description}`.toLowerCase();

      /* ======================= STRICT COMPANY MATCH ======================= */

      const mentionsCompany = profile.aliases.some((alias: string) =>
        text.includes(alias.toLowerCase())
      );

      if (!mentionsCompany) continue;

      /* ======================= IMPACT RELEVANCE FILTER ======================= */

      const financialSignals =
        /earnings|results|profit|loss|guidance|dividend|acquisition|merger|stake|margin|rating|upgrade|downgrade|target|revenue|quarter|q[1-4]|approval|order|contract|deal|lawsuit|penalty|regulatory|usfda|sebi|rbi/.test(
          text
        );

      const keywordSignals =
        profile.keywords?.some((k: string) =>
          text.includes(k.toLowerCase())
        );

      if (!financialSignals && !keywordSignals) continue;

      /* ======================= IMPACT SCORING ======================= */

      let impactScore = scoreImpact(text, stock);

      if (impactScore < MIN_IMPACT) continue;

      impactScore *= applyTimeDecay(published, days);

      collected.push({
        title,
        description,
        url,
        source: "Google News",
        publishedAt: new Date(published).toISOString(),
        impactScore: Number(impactScore.toFixed(2)),
      });
    }

  } catch (err) {
    console.error("RSS fetch failed:", err);
  }

  collected.sort((a, b) => b.impactScore - a.impactScore);

  console.log(
    `📰 FINAL (${stock}, ${days}d): ${collected.length} strict impact articles`
  );

  return collected.slice(0, 20);
}
