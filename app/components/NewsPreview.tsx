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
}

export default function NewsPreview({ stock }: { stock: string }) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [sentiments, setSentiments] = useState<SentimentResult[]>([]);
  const [timeFilter, setTimeFilter] = useState<number>(7);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  /* ---------------- Fetch News ---------------- */
  const handleFetchNews = async () => {
    setLoading(true);
    setError(null);
    setArticles([]);
    setSentiments([]);
    setHasFetched(true);

    try {
      const res = await fetch(
        `/api/news?stock=${encodeURIComponent(stock)}&days=${timeFilter}`,
        { cache: "no-store" }
      );

      if (!res.ok) throw new Error("Failed to fetch news");

      const data = await res.json();
      setArticles(data.articles || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch news");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Analyze Sentiment ---------------- */
  /* ---------------- Analyze Sentiment ---------------- */
  const analyzeSentiment = async () => {
    if (!articles.length) return;

    setAnalyzing(true);
    setError(null);

    try {
      // Analyze ALL articles
      const headlines = articles.map((a) => a.title);
      console.log("Sending headlines count:", headlines.length, headlines);

      const res = await fetch("/api/sentiment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ headlines }),
      });

      const data = await res.json();
      console.log("Received sentiments count:", data.results?.length, data.results);

      setSentiments(data.results || []);
    } catch (err: any) {
      setError(err.message || "Sentiment analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };
  /* ---------------- Map Sentiments by Index (Preserve Order) ---------------- */
  const sentimentsByIndex = useMemo(() => {
    return sentiments.reduce((acc, s, idx) => {
      acc[idx] = s.sentiment;
      return acc;
    }, {} as Record<number, string>);
  }, [sentiments]);

  /* ---------------- Get only first 5 sentiments for display & summary & trend ---------------- */
  const displaySentiments = useMemo(() => {
    return sentiments.slice(0, 5);
  }, [sentiments]);

  /* ---------------- Trend Logic (using first 5 articles & sentiments) ---------------- */
  const trendData = useMemo(() => {
    if (!displaySentiments.length || !articles.length) return [];

    const bucketMap: Record<string, { count: number; score: number }> = {};

    articles.slice(0, 5).forEach((article, idx) => {
      const sentiment = displaySentiments[idx]?.sentiment;
      if (!sentiment) return;

      const bucketKey =
        timeFilter === 1
          ? dayjs(article.publishedAt).format("YYYY-MM-DD HH:00")
          : dayjs(article.publishedAt).format("YYYY-MM-DD");

      const sentimentScore =
        sentiment === "positive"
          ? 1
          : sentiment === "negative"
          ? -1
          : 0;

      if (!bucketMap[bucketKey]) {
        bucketMap[bucketKey] = { count: 0, score: 0 };
      }

      bucketMap[bucketKey].count += 1;
      bucketMap[bucketKey].score += sentimentScore;
    });

    return Object.entries(bucketMap)
      .map(([date, values]) => ({
        date,
        score: values.score / values.count,
      }))
      .sort((a, b) => dayjs(a.date).unix() - dayjs(b.date).unix());
  }, [displaySentiments, articles, timeFilter]);

  const getTimeframeLabel = () => {
    if (timeFilter === 1) return "24 hours";
    if (timeFilter === 7) return "7 days";
    return "30 days";
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="space-y-6">

      {/* Controls */}
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

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {!hasFetched && (
        <p className="text-gray-500 text-sm">
          Select a time range and click <b>Fetch News</b>.
        </p>
      )}

      {hasFetched && !loading && articles.length === 0 && (
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl text-gray-400">
          <p className="text-lg font-medium text-gray-300 mb-2">
            No impactful financial news found
          </p>
          <p>
            No major earnings or market-moving events affecting{" "}
            <span className="text-blue-400 font-semibold">{stock}</span>{" "}
            in the last{" "}
            <span className="text-blue-400 font-semibold">
              {getTimeframeLabel()}
            </span>.
          </p>
        </div>
      )}

      {!!articles.length && (
        <>
          {sentiments.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SentimentSummary results={displaySentiments} />
              <SentimentTrend data={trendData} />
            </div>
          )}

          <div className="space-y-4">
            {articles.slice(0, 5).map((a, idx) => {
              const sentiment = sentiments[idx]?.sentiment;

              const badgeColor =
                sentiment === "positive"
                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                  : sentiment === "negative"
                  ? "bg-red-500/20 text-red-400 border-red-500/30"
                  : sentiment === "neutral"
                  ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                  : "bg-gray-700 text-gray-400 border-gray-600";

              const badgeLabel =
                sentiment === "positive"
                  ? "Bullish"
                  : sentiment === "negative"
                  ? "Bearish"
                  : sentiment === "neutral"
                  ? "Neutral"
                  : "Not analyzed";

              return (
                <div
                  key={a.url}
                  className="bg-gray-900 border border-gray-800 p-4 rounded-xl hover:border-gray-700 transition"
                >
                  <div className="flex justify-between items-start gap-3">
                    <a
                      href={a.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline font-medium"
                    >
                      {a.title}
                    </a>

                    {sentiment && (
                      <span
                        className={`text-xs px-3 py-1 rounded-full border ${badgeColor}`}
                      >
                        {badgeLabel}
                      </span>
                    )}
                  </div>

                  <p className="text-gray-300 text-sm mt-2">
                    {a.description}
                  </p>

                  <p className="text-gray-500 text-xs mt-2">
                    {dayjs(a.publishedAt).format("MMM D, YYYY HH:mm")} ·{" "}
                    {a.source}
                  </p>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
