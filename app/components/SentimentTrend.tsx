"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface SentimentPoint {
  date: string;
  score: number;
}

/**
 * Smooth sentiment data by averaging every N points
 */
function smoothSentiment(data: SentimentPoint[], windowSize = 5) {
  const smoothed: SentimentPoint[] = [];

  for (let i = 0; i < data.length; i += windowSize) {
    const slice = data.slice(i, i + windowSize);
    const avg =
      slice.reduce((sum, d) => sum + d.score, 0) / slice.length;

    smoothed.push({
      date: slice[slice.length - 1].date,
      score: Number(avg.toFixed(2)),
    });
  }

  return smoothed;
}

export default function SentimentTrend({ data }: { data: SentimentPoint[] }) {
  if (!data || data.length === 0) {
    return (
      <p className="text-gray-500 text-sm text-center">
        No sentiment trend data available.
      </p>
    );
  }

  // Smooth the raw sentiment points
  const processedData = smoothSentiment(data, 5);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-6 mb-6 shadow-md">
      <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-center">
        Sentiment Trend Over Time
      </h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={processedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />

          <XAxis
            dataKey="date"
            tick={{ fill: "#9ca3af", fontSize: 12 }}
          />

          <YAxis
            domain={[-1, 1]}
            ticks={[-1, 0, 1]}
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            label={{
              value: "Sentiment Score",
              angle: -90,
              position: "insideLeft",
              fill: "#9ca3af",
            }}
          />

          {/* Neutral baseline */}
          <ReferenceLine y={0} stroke="#555" strokeDasharray="3 3" />

          <Tooltip
            contentStyle={{
              backgroundColor: "#1f2937",
              border: "none",
            }}
            labelStyle={{ color: "#9ca3af" }}
            formatter={(value: number) => value.toFixed(2)}
          />

          <Line
            type="monotone"
            dataKey="score"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <p className="text-center text-xs text-gray-400 mt-2">
        (–1 = negative · 0 = neutral · +1 = positive)
      </p>
    </div>
  );
}
