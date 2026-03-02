"use client";

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
} from "recharts";

interface SentimentPoint {
  date: string;
  score: number; // -1 to +1
}

export default function SentimentTrend({
  data,
}: {
  data: SentimentPoint[];
}) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 shadow-md">
        <h3 className="text-lg font-semibold">Sentiment Trend</h3>
        <p className="text-gray-400 text-sm mt-2">
          No sentiment trend data available.
        </p>
      </div>
    );
  }

  // 🔥 SIMPLE FIX FOR SINGLE DATA POINT
  let chartData = [...data];

  if (data.length === 1) {
    const first = data[0];

    chartData = [
      {
        date: new Date(
          new Date(first.date).getTime() - 24 * 60 * 60 * 1000
        ).toISOString(),
        score: first.score,
      },
      first,
    ];
  }

  const latestScore = data[data.length - 1]?.score ?? 0;
  const firstScore = data[0]?.score ?? 0;
  const trendDirection = latestScore - firstScore;
  const highestScore = Math.max(...data.map((d) => d.score));
  const lowestScore = Math.min(...data.map((d) => d.score));

  const trendLabel =
    latestScore > 0.1
      ? "Bullish"
      : latestScore < -0.1
      ? "Bearish"
      : "Neutral";

  const trendColor =
    latestScore > 0.1
      ? "text-green-400"
      : latestScore < -0.1
      ? "text-red-400"
      : "text-yellow-400";

  const lineColor =
    latestScore > 0.1
      ? "#22c55e"
      : latestScore < -0.1
      ? "#ef4444"
      : "#eab308";

  const arrowIcon =
    trendDirection > 0 ? "↑" : trendDirection < 0 ? "↓" : "→";

  return (
    <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 shadow-md space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold">Sentiment Trend</h3>
        <p className="text-sm text-gray-400 mt-1">
          Time-based sentiment score progression
        </p>
      </div>

      {/* KPI Row */}
      <div className="flex items-center gap-6">
        <div className={`text-4xl font-bold tracking-tight ${trendColor}`}>
          {latestScore.toFixed(2)}
        </div>

        <div className="flex flex-col">
          <span className={`text-sm font-medium ${trendColor}`}>
            {trendLabel}
          </span>
          <span className="text-xs text-gray-400">
            {arrowIcon} {Math.abs(trendDirection).toFixed(2)} vs start
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-gray-950/40 rounded-xl p-4">
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={lineColor} stopOpacity={0.25} />
                <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="2 2"
              stroke="#1f2937"
              vertical={false}
              opacity={0.25}
            />

            <XAxis
              dataKey="date"
              tick={{ fill: "#9ca3af", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              domain={[-1, 1]}
              ticks={[-1, -0.5, 0, 0.5, 1]}
              tick={{ fill: "#9ca3af", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />

            <ReferenceLine
              y={0}
              stroke="#374151"
              strokeDasharray="4 4"
              opacity={0.5}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "#111827",
                border: "1px solid #374151",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              labelStyle={{ color: "#e5e7eb" }}
              formatter={(value: number) => [
                value.toFixed(2),
                "Sentiment Score",
              ]}
              cursor={{ stroke: "#475569", opacity: 0.3 }}
            />

            <Area
              type="monotone"
              dataKey="score"
              stroke={lineColor}
              fill="url(#trendGradient)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{
                r: 6,
                stroke: lineColor,
                fill: lineColor,
              }}
              animationDuration={700}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Stats Footer */}
      <div className="grid grid-cols-3 gap-4 text-center text-sm">
        <div className="bg-gray-800/40 rounded-xl p-3">
          <p className="text-gray-400 text-xs mb-1">Highest</p>
          <p
            className={`font-semibold ${
              highestScore > 0 ? "text-green-400" : "text-gray-300"
            }`}
          >
            {highestScore.toFixed(2)}
          </p>
        </div>

        <div className="bg-gray-800/40 rounded-xl p-3">
          <p className="text-gray-400 text-xs mb-1">Current</p>
          <p className={`font-semibold ${trendColor}`}>
            {latestScore.toFixed(2)}
          </p>
        </div>

        <div className="bg-gray-800/40 rounded-xl p-3">
          <p className="text-gray-400 text-xs mb-1">Lowest</p>
          <p
            className={`font-semibold ${
              lowestScore < 0 ? "text-red-400" : "text-gray-300"
            }`}
          >
            {lowestScore.toFixed(2)}
          </p>
        </div>
      </div>

      <p className="text-xs text-gray-500 text-center">
        Scale: -1 (Bearish) → 0 (Neutral) → +1 (Bullish)
      </p>
    </div>
  );
}