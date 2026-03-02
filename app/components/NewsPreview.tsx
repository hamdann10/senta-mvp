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
    <div className="space-y-10">

      {/* ================= CONTROLS ================= */}
      <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 space-y-4">

        <div>
          <h3 className="text-lg font-semibold">News & Sentiment Analysis</h3>
          <p className="text-sm text-gray-400 mt-1">
            Fetch financial headlines and analyze sentiment impact.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 items-center">

          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(Number(e.target.value))}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={1}>Last 24 hours</option>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
          </select>

          <button
            onClick={handleFetchNews}
            disabled={loading}
            className="bg-sky-600 hover:bg-sky-700 disabled:opacity-50 px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            {loading ? "Fetching..." : "Fetch News"}
          </button>

          <button
            onClick={analyzeSentiment}
            disabled={analyzing || !articles.length}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            {analyzing ? "Analyzing..." : "Analyze Sentiment"}
          </button>
        </div>
      </div>

      {/* ================= ERROR ================= */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* ================= INITIAL EMPTY STATE ================= */}
      {!hasFetched && (
        <div className="bg-gray-900/50 border border-dashed border-gray-700 p-10 rounded-2xl text-center">
          <p className="text-gray-400">
            Select a timeframe and click{" "}
            <span className="text-blue-400 font-medium">Fetch News</span> to begin analysis.
          </p>
        </div>
      )}

      {/* ================= LOADING SKELETON ================= */}
      {loading && (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-gray-900 border border-gray-800 p-5 rounded-xl space-y-3"
            >
              <div className="h-4 w-3/4 bg-gray-800 rounded"></div>
              <div className="h-3 w-full bg-gray-800 rounded"></div>
              <div className="h-3 w-1/3 bg-gray-800 rounded"></div>
            </div>
          ))}
        </div>
      )}

      {/* ================= NO NEWS ================= */}
      {hasFetched && !loading && articles.length === 0 && (
        <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl text-center">
          <h4 className="text-lg font-semibold text-gray-200 mb-2">
            No Market-Moving News Found
          </h4>
          <p className="text-gray-400 text-sm">
            No significant events affecting{" "}
            <span className="text-blue-400 font-medium">{stock}</span>{" "}
            in the last{" "}
            <span className="text-blue-400 font-medium">
              {getTimeframeLabel()}
            </span>.
          </p>
        </div>
      )}

      {/* ================= RESULTS ================= */}
      {!!articles.length && !loading && (
        <div className="space-y-10">

          {/* ===== SUMMARY + TREND ===== */}
          {sentiments.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SentimentSummary results={displaySentiments} />
              <SentimentTrend data={trendData} />
            </div>
          )}

          {/* ===== HEADLINES ===== */}
          <div className="space-y-5">
            <div>
              <h4 className="text-lg font-semibold">Top Headlines</h4>
              <p className="text-sm text-gray-400 mt-1">
                Showing latest 5 articles with sentiment classification.
              </p>
            </div>

            {articles.slice(0, 5).map((a, idx) => {
              const sentiment = sentiments[idx]?.sentiment;

              const badgeColor =
                sentiment === "positive"
                  ? "bg-green-500/10 text-green-400 border-green-500/30"
                  : sentiment === "negative"
                    ? "bg-red-500/10 text-red-400 border-red-500/30"
                    : sentiment === "neutral"
                      ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                      : "bg-gray-700/30 text-gray-400 border-gray-600";

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
                  className="bg-gray-900/80 border border-gray-800 p-5 rounded-2xl hover:border-gray-700 transition"
                >
                  <div className="flex justify-between items-start gap-4">

                    <div className="space-y-2">
                      <a
                        href={a.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline font-medium leading-snug"
                      >
                        {a.title}
                      </a>

                      <p className="text-gray-300 text-sm">
                        {a.description}
                      </p>

                      <p className="text-gray-500 text-xs">
                        {dayjs(a.publishedAt).format("MMM D, YYYY HH:mm")} ·{" "}
                        {a.source}
                      </p>
                    </div>

                    <span
                      className={`text-xs px-3 py-1 rounded-full border whitespace-nowrap ${badgeColor}`}
                    >
                      {badgeLabel}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}