// app/lib/newsService.ts

const FINANCIAL_TERMS = [
  "stock",
  "stocks",
  "share",
  "shares",
  "market",
  "markets",
  "investor",
  "investors",
  "earnings",
  "results",
  "profit",
  "loss",
  "revenue",
  "quarter",
  "q1",
  "q2",
  "q3",
  "q4",
  "nse",
  "bse",
  "exchange",
  "price",
  "valuation",
  "dividend",
  "ipo",
  "buy",
  "sell",
  "trading",
  "rally",
  "fall",
  "surge",
  "plunge",
];

/**
 * Checks whether a news article is financially relevant
 * to a given stock (generic, scalable logic)
 */
function isMarketRelevant(article: any, stock: string): boolean {
  const text = `${article.title} ${article.description || ""}`.toLowerCase();
  const stockLower = stock.toLowerCase();

  const mentionsStock = text.includes(stockLower);
  const hasFinancialContext = FINANCIAL_TERMS.some(term =>
    text.includes(term)
  );

  return mentionsStock && hasFinancialContext;
}

export async function fetchNews(stock: string, days: number = 1) {
  const apiKey = process.env.NEXT_PUBLIC_NEWS_API_KEY;

  const currentDate = new Date();
  const fromDate = new Date(currentDate);
  fromDate.setDate(currentDate.getDate() - days);

  const url = `https://newsapi.org/v2/everything?q="${stock}"&from=${
    fromDate.toISOString().split("T")[0]
  }&sortBy=publishedAt&language=en&pageSize=50&apiKey=${apiKey}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== "ok") {
      throw new Error(data.message || "Failed to fetch news");
    }

    const articles = data.articles || [];

    // 🔍 FILTER OUT NON-MARKET / GENERIC ARTICLES
    const relevantArticles = articles.filter((article: any) =>
      isMarketRelevant(article, stock)
    );

    console.log(
      `📰 News filtered for ${stock}: ${relevantArticles.length}/${articles.length} relevant`
    );

    return relevantArticles;
  } catch (error) {
    console.error("❌ Error fetching news:", error);
    return [];
  }
}
