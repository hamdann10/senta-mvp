"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface SentimentPoint {
  date: string;
  score: number;
}

export default function SentimentTrend({ data }: { data: SentimentPoint[] }) {
  if (!data || data.length === 0)
    return (
      <p className="text-gray-500 text-sm text-center">
        No sentiment trend data available.
      </p>
    );

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-6 mb-6 shadow-md">
      <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-center">
        Sentiment Trend Over Time
      </h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="date" tick={{ fill: "#9ca3af", fontSize: 12 }} />
          <YAxis
            domain={[-1, 1]}
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            label={{
              value: "Sentiment Score",
              angle: -90,
              position: "insideLeft",
              fill: "#9ca3af",
            }}
          />
          <Tooltip
            contentStyle={{ backgroundColor: "#1f2937", border: "none" }}
            labelStyle={{ color: "#9ca3af" }}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: "#3b82f6" }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <p className="text-center text-xs text-gray-400 mt-2">
        (–1 = negative ·  0 = neutral ·  +1 = positive)
      </p>
    </div>
  );
}
