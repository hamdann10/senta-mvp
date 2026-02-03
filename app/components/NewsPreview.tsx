"use client";

import { useEffect, useState, useMemo } from "react";
import { fetchNews } from "../lib/newsService";
import SentimentSummary from "./SentimentSummary";
import SentimentTrend from "./SentimentTrend";
import dayjs from "dayjs";

interface Article {
  title: string;
  description?: string | null;
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
  // --- Hooks: ALWAYS declared first (never inside conditionals) ---
  const [articles, setArticles] = useState<Article[]>([]);
  const [sentiments, setSentiments] = useState<SentimentResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [timeFilter, setTimeFilter] = useState<number>(1); // 1 | 7 | 30
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // load news (unconditional hook usage)
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetched = await fetchNews(stock, timeFilter);
        if (!mounted) return;
        setArticles(fetched);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || "Failed to fetch news");
        setArticles([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [stock, timeFilter]);

  // analyze sentiment function (stable reference, doesn't call hooks)
  const analyzeSentiment = async () => {
    if (!articles.length) return;
    setAnalyzing(true);
    setError(null);
    try {
      const headlines = articles.map((a) => a.title);
      const res = await fetch("/api/sentiment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ headlines }),
      });
      const data = await res.json();
      setSentiments(data.results || []);
    } catch (err: any) {
      setError(err?.message || "Sentiment analysis failed");
      setSentiments([]);
    } finally {
      setAnalyzing(false);
    }
  };

  // refresh: re-fetch news and then analyze (keeps hooks outside)
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const fetched = await fetchNews(stock, timeFilter);
      setArticles(fetched);
      // optionally auto-run analysis (comment out if you want manual)
      // await analyzeSentiment();
    } catch (err: any) {
      setError(err?.message || "Refresh failed");
    } finally {
      setRefreshing(false);
    }
  };

  // --- useMemo: also declared unconditionally ---
  const trendData = useMemo(() => {
    if (!sentiments.length || !articles.length) return [];

    const combined = sentiments
      .map((s) => {
        const article = articles.find((a) => a.title === s.headline);
        if (!article) return null;
        const dateKey =
          timeFilter <= 1
            ? dayjs(article.publishedAt).format("HH:mm")
            : dayjs(article.publishedAt).format("MMM D");
        const score = s.sentiment === "positive" ? 1 : s.sentiment === "negative" ? -1 : 0;
        return { date: dateKey, score };
      })
      .filter(Boolean) as { date: string; score: number }[];

    const grouped: Record<string, number[]> = {};
    combined.forEach((p) => {
      grouped[p.date] = grouped[p.date] || [];
      grouped[p.date].push(p.score);
    });

    const trend = Object.entries(grouped).map(([date, scores]) => ({
      date,
      score: scores.reduce((a, b) => a + b, 0) / scores.length,
    }));

    if (timeFilter <= 1) {
      return trend.sort((a, b) => (a.date > b.date ? 1 : -1));
    }
    return trend.sort((a, b) => {
      // parse "MMM D" safely
      const da = dayjs(a.date, "MMM D");
      const db = dayjs(b.date, "MMM D");
      return da.isAfter(db) ? 1 : -1;
    });
  }, [sentiments, articles, timeFilter]);

  // --- UI: do early returns AFTER hooks are declared ---
  if (loading) {
    return <p className="text-gray-400">Fetching latest news...</p>;
  }

  if (error) {
    return <p className="text-red-400">Error: {error}</p>;
  }

  if (!articles.length) {
    return <p className="text-gray-500">No news found for {stock}.</p>;
  }

  // --- Main render (hooks already declared above) ---
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h2 className="text-2xl font-semibold">Latest News Headlines</h2>

        <div className="flex gap-3 items-center">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(Number(e.target.value))}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200"
          >
            <option value={1}>Last 24h</option>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
          </select>

          <button
            onClick={analyzeSentiment}
            disabled={analyzing}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition"
          >
            {analyzing ? "Analyzing..." : "Analyze Sentiment"}
          </button>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition"
          >
            {refreshing ? "Refreshing..." : "🔄 Refresh"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SentimentSummary results={sentiments} />
        <SentimentTrend data={trendData} />
      </div>

      {articles.slice(0, 5).map((article, index) => {
        const sentiment = sentiments.find((s) => s.headline === article.title);
        return (
          <div key={index} className="bg-gray-900 border border-gray-800 p-4 rounded-xl space-y-2">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline font-medium"
            >
              {article.title}
            </a>
            <p className="text-gray-300 text-sm">{article.description}</p>
            <p className="text-gray-500 text-xs mt-1">
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
