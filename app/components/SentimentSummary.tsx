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
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-xl font-semibold mb-4">
          Sentiment Overview
        </h2>
        <p className="text-gray-500 text-sm">
          Run sentiment analysis to see results.
        </p>
      </div>
    );
  }

  /* ===========================
     Count Sentiments
  ============================ */

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

  /* ===========================
     Determine Majority
  ============================ */

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

  const COLORS = ["#22c55e", "#facc15", "#ef4444"];

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
      <h2 className="text-xl font-semibold mb-6">
        Sentiment Overview
      </h2>

      <div className="flex flex-col md:flex-row items-center gap-8">

        {/* Donut Chart */}
        <div className="relative">
          <PieChart width={240} height={240}>
            <Pie
              data={data}
              innerRadius={80}
              outerRadius={110}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>

          {/* Center Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold">
              {majorityPct.toFixed(0)}%
            </div>
            <div className={`text-sm font-semibold mt-1 ${majorityColor}`}>
              {majorityLabel}
            </div>
          </div>
        </div>

        {/* Stats Panel */}
        <div className="space-y-3 text-sm w-full md:w-auto">
          <div className="flex justify-between text-green-400 font-medium">
            <span>Positive</span>
            <span>{positivePct.toFixed(1)}%</span>
          </div>

          <div className="flex justify-between text-yellow-400 font-medium">
            <span>Neutral</span>
            <span>{neutralPct.toFixed(1)}%</span>
          </div>

          <div className="flex justify-between text-red-400 font-medium">
            <span>Negative</span>
            <span>{negativePct.toFixed(1)}%</span>
          </div>

          <div className="border-t border-gray-800 pt-3 mt-4 text-gray-400 text-xs">
            Based on {total} analyzed headlines
          </div>
        </div>
      </div>
    </div>
  );
}
