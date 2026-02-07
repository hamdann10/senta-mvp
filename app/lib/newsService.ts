// app/lib/newsService.ts

interface Article {
  title: string;
  description: string;
  url: string;
  source: { name: string };
  publishedAt: string;
}

const FINANCE_SITES = [
  "moneycontrol.com",
  "economictimes.indiatimes.com",
  "business-standard.com",
  "livemint.com",
  "financialexpress.com",
];

export async function fetchNews(stock: string, days: number = 1): Promise<Article[]> {
  const apiKey = process.env.NEXT_PUBLIC_GNEWS_API_KEY;

  if (!apiKey) {
    console.error("❌ GNEWS API KEY MISSING");
    return [];
  }

  // 🔥 Finance-focused query
  const baseQuery = `"${stock}" AND (stock OR shares OR earnings OR results OR NSE OR BSE)`;

  // 🔥 Restrict to Indian finance sites (NO scraping)
  const siteFilter = FINANCE_SITES.map(site => `site:${site}`).join(" OR ");

  const finalQuery = `${baseQuery} (${siteFilter})`;

  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);

  const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(
    finalQuery
  )}&lang=en&country=in&from=${fromDate.toISOString()}&max=20&token=${apiKey}`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();

    if (!data.articles || !Array.isArray(data.articles)) {
      console.warn("⚠️ No articles from GNews:", data);
      return [];
    }

    console.log(
      `📰 GNews (${stock}): ${data.articles.length} articles fetched`
    );

    return data.articles.map((a: any) => ({
      title: a.title,
      description: a.description || "",
      url: a.url,
      source: a.source,
      publishedAt: a.publishedAt,
    }));
  } catch (error) {
    console.error("❌ GNews fetch failed:", error);
    return [];
  }
}
