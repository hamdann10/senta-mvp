import { XMLParser } from "fast-xml-parser";

export type NewsArticle = {
  title: string;
  link: string;
  pubDate: string;
};

export async function fetchRSSNews(
  stock: string,
  days: number
): Promise<NewsArticle[]> {
  try {
    const url = `https://news.google.com/rss/search?q=${stock}&hl=en-IN&gl=IN&ceid=IN:en`;

    const res = await fetch(url);
    const xml = await res.text();

    const parser = new XMLParser();
    const json = parser.parse(xml);

    const items = json?.rss?.channel?.item;

    if (!items) return [];

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const articles = items
      .map((item: any) => ({
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
      }))
      .filter((article: NewsArticle) => {
        const published = new Date(article.pubDate);
        return published >= cutoff;
      });

    return articles.slice(0, 10); // limit to avoid API overload

  } catch (error) {
    console.error("RSS fetch failed:", error);
    return [];
  }
}