"use client";
import Loader from "./Loader";
import { useEffect, useState } from "react";
import { fetchNews } from "../lib/newsService";
import SentimentSummary from "./SentimentSummary";

interface Article {
  title: string;
  description: string;
  url: string;
  source: { name: string };
  publishedAt: string;
}

interface SentimentResult {
  headline: string;
  sentiment: string;
  confidence: number;
}

export default function NewsPreview({ stock }: { stock: string }) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [sentiments, setSentiments] = useState<SentimentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [timeFilter, setTimeFilter] = useState<number>(1); // default: 24h
  const [refreshing, setRefreshing] = useState(false);

  // ✅ Fetch stock-related news
  const loadNews = async (days = timeFilter) => {
    setLoading(true);
    const fetchedNews = await fetchNews(stock, days);
    setArticles(fetchedNews);
    setLoading(false);
  };

  useEffect(() => {
    loadNews();
  }, [stock, timeFilter]);

  // ✅ Analyze sentiment using FinBERT API
  const analyzeSentiment = async () => {
    if (articles.length === 0) return;
    setAnalyzing(true);

    const headlines = articles.map((a) => a.title);
    const res = await fetch("/api/sentiment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ headlines }),
    });

    const data = await res.json();
    setSentiments(data.results || []);
    setAnalyzing(false);
  };

  // ✅ Manual refresh (refetch + reanalyze)
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNews();
    await analyzeSentiment();
    setRefreshing(false);
  };

if (loading) return <Loader text="Fetching latest news..." />;
  if (!articles.length) return <p className="text-gray-500">No news found for {stock}.</p>;

  return (
    <div className="space-y-6">
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h2 className="text-2xl font-semibold">Latest News Headlines</h2>

        <div className="flex gap-3 items-center">
          {/* Time Filter Dropdown */}
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(Number(e.target.value))}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200"
          >
            <option value={1}>Last 24h</option>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
          </select>

          {/* Analyze Button */}
          <button
            onClick={analyzeSentiment}
            disabled={analyzing}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition"
          >
            {analyzing ? <Loader text="Analyzing sentiment..." /> : "Analyze Sentiment"}
          </button>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition"
          >
            {refreshing ? <Loader text="refreshing..." /> : "🔄 Refresh"}
          </button>
        </div>
      </div>

      {/* --- SUMMARY + CHART --- */}
      <SentimentSummary results={sentiments} />

      {/* --- ARTICLES LIST --- */}
      {articles.slice(0, 5).map((article, index) => {
        const sentiment = sentiments.find((s) => s.headline === article.title);
        return (
          <div
            key={index}
            className="bg-gray-900 border border-gray-800 p-4 rounded-xl space-y-2"
          >
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline font-medium"
            >
              {article.title}
            </a>
            <p className="text-gray-300 text-sm">{article.description}</p>
            <p className="text-gray-500 text-xs">
              {new Date(article.publishedAt).toLocaleString()} - {article.source.name}
            </p>

            {sentiment && (
              <p
                className={`text-sm font-semibold mt-2 ${
                  sentiment.sentiment === "positive"
                    ? "text-green-400"
                    : sentiment.sentiment === "negative"
                    ? "text-red-400"
                    : "text-yellow-400"
                }`}
              >
                Sentiment: {sentiment.sentiment} ({(sentiment.confidence * 100).toFixed(1)}%)
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
