import { fetchRSSNews } from "../../../lib/rssNewsService";

export async function GET() {
  const STOCKS = ["RELIANCE", "TCS", "INFY"];
  const DAYS = [1, 7, 30];

  for (const stock of STOCKS) {
    for (const days of DAYS) {
      const articles = await fetchRSSNews(stock, days);

      console.log(
        `CRON → ${stock} ${days}d → ${articles.length} articles`
      );

      // ⛔ No FinBERT yet
      // ⛔ No DB yet
    }
  }

  return Response.json({ status: "ok" });
}
