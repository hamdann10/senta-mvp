// app/api/index-sentiment/route.ts
import { NextResponse } from "next/server";

const NEWSAPI_KEY = process.env.NEWSAPI_KEY;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
const CACHE_TTL_MS = Number(process.env.CACHE_TTL_MS ?? 45000);

type Aggregate = {
  index: string;
  total: number;
  positive: number;
  negative: number;
  neutral: number;
  score: number;
  lastUpdated: number;
  headlines: string[];
  raw?: any;
};

const cache: Record<string, { data: Aggregate; expiresAt: number }> = {};

async function fetchNews(query: string, pageSize = 15) {
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
    query
  )}&language=en&pageSize=${pageSize}&sortBy=publishedAt`;
  const res = await fetch(url, {
    headers: { "X-Api-Key": NEWSAPI_KEY ?? "" },
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`NewsAPI error: ${res.status} ${txt}`);
  }
  const json = await res.json();
  return (json.articles || []).map((a: any) => ({
    title: a.title ?? "",
    description: a.description ?? "",
    publishedAt: a.publishedAt ?? null,
  }));
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const indexParam = (url.searchParams.get("index") || "nifty50").toLowerCase();
    const cacheKey = `index-sentiment:${indexParam}`;
    const now = Date.now();

    // Return cached if available
    if (cache[cacheKey] && cache[cacheKey].expiresAt > now) {
      return NextResponse.json({ fromCache: true, ...cache[cacheKey].data });
    }

    // Map index to query phrase
    const queries: Record<string, string> = {
      nifty50: "NIFTY 50 OR Nifty OR NSE Nifty OR Nifty 50 index",
      sensex: "SENSEX OR BSE Sensex OR BSE 30",
    };
    const q = queries[indexParam] ?? queries["nifty50"];

    // 1) Fetch news headlines
    const articles = await fetchNews(q, 20);
    const headlines = articles.map((a) => `${a.title} ${a.description}`.trim()).filter(Boolean);

    if (headlines.length === 0) {
      const empty: Aggregate = {
        index: indexParam,
        total: 0,
        positive: 0,
        negative: 0,
        neutral: 100,
        score: 0,
        lastUpdated: Date.now(),
        headlines: [],
      };
      cache[cacheKey] = { data: empty, expiresAt: now + CACHE_TTL_MS };
      return NextResponse.json({ fromCache: false, ...empty });
    }

    // 2) Call your existing FinBERT route to classify headlines
    // Use absolute URL so it works from server runtime
    const finbertRes = await fetch(`${BASE_URL}/api/sentiment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ headlines }),
    });

    if (!finbertRes.ok) {
      const txt = await finbertRes.text().catch(() => "");
      throw new Error(`FinBERT endpoint failed: ${finbertRes.status} ${txt}`);
    }

    const finJson = await finbertRes.json();
    const results = finJson.results ?? finJson?.results ?? [];

    // 3) Aggregate results
    let pos = 0,
      neg = 0,
      neu = 0;

    results.forEach((r: any) => {
      const s = String(r.sentiment || "").toLowerCase();
      if (s.includes("pos")) pos++;
      else if (s.includes("neg")) neg++;
      else neu++;
    });

    const total = pos + neg + neu || 1;
    const score = Number(((pos - neg) / total).toFixed(3));

    const aggregate: Aggregate = {
      index: indexParam,
      total,
      positive: Math.round((pos / total) * 100),
      negative: Math.round((neg / total) * 100),
      neutral: Math.round((neu / total) * 100),
      score,
      lastUpdated: Date.now(),
      headlines,
      raw: results,
    };

    // cache
    cache[cacheKey] = { data: aggregate, expiresAt: now + CACHE_TTL_MS };

    return NextResponse.json({ fromCache: false, ...aggregate });
  } catch (err: any) {
    console.error("/api/index-sentiment error:", err);
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
