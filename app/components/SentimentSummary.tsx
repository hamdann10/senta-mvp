"use client";

import { PieChart, Pie, Cell, Tooltip } from "recharts";

interface SentimentResult {
  sentiment: string;
}

export default function SentimentSummary({
  results,
}: {
  results: SentimentResult[];
}) {
  const total = results.length;

  if (total === 0) {
    return (
      <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 shadow-md">
        <h3 className="text-lg font-semibold">Sentiment Overview</h3>
        <p className="text-gray-400 text-sm mt-2">
          Run sentiment analysis to generate distribution insights.
        </p>
      </div>
    );
  }

  /* ================= Count Sentiments ================= */

  let positive = 0;
  let negative = 0;
  let neutral = 0;

  results.forEach((r) => {
    if (r.sentiment === "positive") positive++;
    else if (r.sentiment === "negative") negative++;
    else neutral++;
  });

  const positivePct = (positive / total) * 100;
  const negativePct = (negative / total) * 100;
  const neutralPct = (neutral / total) * 100;

  /* ================= Majority Logic ================= */

  let majorityLabel = "Neutral";
  let majorityPct = neutralPct;
  let majorityColor = "text-yellow-400";

  if (positive > neutral && positive > negative) {
    majorityLabel = "Bullish";
    majorityPct = positivePct;
    majorityColor = "text-green-400";
  } else if (negative > neutral && negative > positive) {
    majorityLabel = "Bearish";
    majorityPct = negativePct;
    majorityColor = "text-red-400";
  }

  const data = [
    { name: "Positive", value: positive },
    { name: "Neutral", value: neutral },
    { name: "Negative", value: negative },
  ];

  const COLORS = ["#22c55e", "#eab308", "#ef4444"];

  return (
    <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 shadow-md space-y-6">

      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold">Sentiment Distribution</h3>
        <p className="text-sm text-gray-400 mt-1">
          Classification of analyzed headlines
        </p>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-10">

        {/* Donut Chart */}
        <div className="relative">
          <PieChart width={220} height={220}>
            <Pie
              data={data}
              innerRadius={70}
              outerRadius={95}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#111827",
                border: "1px solid #374151",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
          </PieChart>

          {/* Center KPI */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold tracking-tight">
              {majorityPct.toFixed(0)}%
            </div>
            <div className={`text-sm font-medium mt-1 ${majorityColor}`}>
              {majorityLabel}
            </div>
          </div>
        </div>

        {/* Stats Panel */}
        <div className="w-full space-y-4 text-sm">

          {[
            { label: "Positive", pct: positivePct, color: "bg-green-500" },
            { label: "Neutral", pct: neutralPct, color: "bg-yellow-500" },
            { label: "Negative", pct: negativePct, color: "bg-red-500" },
          ].map((item) => (
            <div key={item.label} className="space-y-1">
              <div className="flex justify-between text-gray-300">
                <span>{item.label}</span>
                <span>{item.pct.toFixed(1)}%</span>
              </div>
              <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${item.color}`}
                  style={{ width: `${item.pct}%` }}
                />
              </div>
            </div>
          ))}

          <div className="border-t border-gray-800 pt-3 mt-4 text-gray-500 text-xs">
            Based on {total} analyzed headlines
          </div>
        </div>
      </div>
    </div>
  );
}