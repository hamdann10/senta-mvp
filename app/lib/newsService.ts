export async function fetchNews(stock: string, days: number = 1) {
  const apiKey = process.env.NEXT_PUBLIC_NEWS_API_KEY;
  const currentDate = new Date();
  const fromDate = new Date(currentDate);
  fromDate.setDate(currentDate.getDate() - days);

  const url = `https://newsapi.org/v2/everything?q=${stock}&from=${fromDate.toISOString().split("T")[0]}&sortBy=publishedAt&language=en&apiKey=${apiKey}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.status !== "ok") throw new Error(data.message || "Failed to fetch news");
    return data.articles;
  } catch (error) {
    console.error("Error fetching news:", error);
    return [];
  }
}
