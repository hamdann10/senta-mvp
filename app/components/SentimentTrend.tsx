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
  Area,
  AreaChart,
} from "recharts";

interface SentimentPoint {
  date: string;
  score: number; // range: -1 to +1
}

export default function SentimentTrend({
  data,
}: {
  data: SentimentPoint[];
}) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Sentiment Trend</h2>
        <p className="text-gray-500 text-sm text-center py-8">
          No sentiment trend data available.
        </p>
      </div>
    );
  }

  // Calculate trend stats
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
      : "#facc15";

  const arrowIcon = trendDirection > 0 ? "↑" : trendDirection < 0 ? "↓" : "→";

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-6 shadow-lg">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white mb-2">
          Sentiment Trend Over Time
        </h2>
        <div className="flex items-center gap-3">
          <div
            className={`text-3xl font-bold ${trendColor}`}
          >
            {latestScore.toFixed(2)}
          </div>
          <div className="flex flex-col">
            <span className={`text-sm font-semibold ${trendColor}`}>
              {trendLabel}
            </span>
            <span className="text-xs text-gray-400">
              {arrowIcon} {Math.abs(trendDirection).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-gray-950/50 rounded-lg p-4 mb-6">
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={lineColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="2 2"
              stroke="#1f2937"
              vertical={false}
              opacity={0.3}
            />

            <XAxis
              dataKey="date"
              tick={{ fill: "#9ca3af", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              stroke="none"
            />

            <YAxis
              domain={[-1, 1]}
              ticks={[-1, -0.5, 0, 0.5, 1]}
              tick={{ fill: "#9ca3af", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              stroke="none"
            />

            {/* Sentiment zones */}
            <ReferenceLine
              y={0}
              stroke="#374151"
              strokeDasharray="4 4"
              opacity={0.5}
            />
            <ReferenceLine y={0.5} stroke="#22c55e" strokeDasharray="2 2" opacity={0.1} />
            <ReferenceLine y={-0.5} stroke="#ef4444" strokeDasharray="2 2" opacity={0.1} />

            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                border: "1px solid #1e293b",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
              }}
              labelStyle={{ color: "#e2e8f0" }}
              formatter={(value: number) => {
                const sentiment =
                  value > 0.1
                    ? "🟢 Bullish"
                    : value < -0.1
                    ? "🔴 Bearish"
                    : "🟡 Neutral";
                return [
                  <span key="value" className="font-semibold">
                    {sentiment} ({value.toFixed(2)})
                  </span>,
                  "Sentiment",
                ];
              }}
              cursor={{ stroke: "#475569", opacity: 0.3 }}
            />

            <Area
              type="monotone"
              dataKey="score"
              stroke={lineColor}
              fill="url(#colorGradient)"
              strokeWidth={3}
              dot={{
                fill: lineColor,
                r: 4,
                opacity: 0.8,
              }}
              activeDot={{
                fill: lineColor,
                r: 7,
                opacity: 1,
                filter: `drop-shadow(0 0 8px ${lineColor})`,
              }}
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Stats Footer */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-gray-800/50 rounded-lg p-2">
          <p className="text-xs text-gray-400 mb-1">Highest</p>
          <p className={`font-semibold ${highestScore > 0 ? "text-green-400" : "text-gray-400"}`}>
            {highestScore.toFixed(2)}
          </p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-2">
          <p className="text-xs text-gray-400 mb-1">Current</p>
          <p className={`font-semibold ${trendColor}`}>
            {latestScore.toFixed(2)}
          </p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-2">
          <p className="text-xs text-gray-400 mb-1">Lowest</p>
          <p className={`font-semibold ${lowestScore < 0 ? "text-red-400" : "text-gray-400"}`}>
            {lowestScore.toFixed(2)}
          </p>
        </div>
      </div>

      <p className="text-center text-xs text-gray-500 mt-4">
        🔴 Bearish (-1) · 🟡 Neutral (0) · 🟢 Bullish (+1)
      </p>
    </div>
  );
}
