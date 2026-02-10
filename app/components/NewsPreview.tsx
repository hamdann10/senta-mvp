"use client";

import { useState, useMemo } from "react";
import SentimentSummary from "./SentimentSummary";
import SentimentTrend from "./SentimentTrend";
import dayjs from "dayjs";

interface Article {
  title: string;
  description?: string | null;
  url: string;
  source: string;
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
  const [timeFilter, setTimeFilter] = useState<number>(7);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ---------------- Fetch News (SERVER API) ---------------- */
  const handleFetchNews = async () => {
    setLoading(true);
    setError(null);
    setArticles([]);
    setSentiments([]);

    try {
      console.log("📰 Fetching via API:", { stock, timeFilter });

      const res = await fetch(
        `/api/news?stock=${encodeURIComponent(stock)}&days=${timeFilter}`,
        { cache: "no-store" }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch news");
      }

      const data = await res.json();
      setArticles(data.articles || []);
    } catch (err: any) {
      console.error("❌ News fetch failed:", err);
      setError(err.message || "Failed to fetch news");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Analyze Sentiment ---------------- */
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
      setError(err.message || "Sentiment analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  /* ---------------- Trend Data ---------------- */
  const trendData = useMemo(() => {
    if (!sentiments.length || !articles.length) return [];

    const grouped: Record<string, number[]> = {};

    sentiments.forEach((s) => {
      const article = articles.find((a) => a.title === s.headline);
      if (!article) return;

      const dateKey =
        timeFilter <= 1
          ? dayjs(article.publishedAt).format("HH:mm")
          : dayjs(article.publishedAt).format("MMM D");

      const score =
        s.sentiment === "positive" ? 1 : s.sentiment === "negative" ? -1 : 0;

      grouped[dateKey] = grouped[dateKey] || [];
      grouped[dateKey].push(score);
    });

    return Object.entries(grouped).map(([date, scores]) => ({
      date,
      score: scores.reduce((a, b) => a + b, 0) / scores.length,
    }));
  }, [sentiments, articles, timeFilter]);

  /* ---------------- UI ---------------- */
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={timeFilter}
          onChange={(e) => setTimeFilter(Number(e.target.value))}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200"
        >
          <option value={1}>Last 24 hours</option>
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
        </select>

        <button
          onClick={handleFetchNews}
          disabled={loading}
          className="bg-sky-600 hover:bg-sky-700 px-4 py-2 rounded-lg text-sm"
        >
          {loading ? "Fetching..." : "Fetch News"}
        </button>

        <button
          onClick={analyzeSentiment}
          disabled={analyzing || !articles.length}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm"
        >
          {analyzing ? "Analyzing..." : "Analyze Sentiment"}
        </button>
      </div>

      {error && <p className="text-red-400">{error}</p>}

      {!articles.length && !loading && (
        <p className="text-gray-500">
          Select a time range and click <b>Fetch News</b>.
        </p>
      )}

      {!!articles.length && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SentimentSummary results={sentiments} />
            <SentimentTrend data={trendData} />
          </div>

          {articles.slice(0, 5).map((a, i) => (
            <div
              key={i}
              className="bg-gray-900 border border-gray-800 p-4 rounded-xl"
            >
              <a
                href={a.url}
                target="_blank"
                className="text-blue-400 hover:underline"
              >
                {a.title}
              </a>
              <p className="text-gray-300 text-sm">{a.description}</p>
              <p className="text-gray-500 text-xs">
                {new Date(a.publishedAt).toLocaleString()} · {a.source}
              </p>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
