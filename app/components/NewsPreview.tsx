"use client";

import { useEffect, useState } from "react";
import { fetchNews } from "../lib/newsService";

export default function NewsPreview({ stock }: { stock: string }) {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNews = async () => {
      setLoading(true);
      const fetchedNews = await fetchNews(stock, 1);
      setArticles(fetchedNews);
      setLoading(false);
    };
    loadNews();
  }, [stock]);

  if (loading) return <p className="text-gray-400">Fetching latest news...</p>;
  if (!articles.length) return <p className="text-gray-500">No news found for {stock}.</p>;

  return (
    <div className="space-y-4">
      {articles.slice(0, 5).map((article, index) => (
        <div key={index} className="bg-gray-800 p-4 rounded-xl">
          <a href={article.url} target="_blank" rel="noopener noreferrer">
            <h3 className="font-semibold text-lg text-blue-400 hover:underline">{article.title}</h3>
          </a>
          <p className="text-gray-300 text-sm">{article.description}</p>
          <p className="text-gray-500 text-xs mt-1">
            {new Date(article.publishedAt).toLocaleString()} - {article.source.name}
          </p>
        </div>
      ))}
    </div>
  );
}
