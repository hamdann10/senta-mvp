"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface SentimentResult {
  sentiment: string;
  confidence: number;
}

export default function SentimentSummary({
  results,
}: {
  results: SentimentResult[];
}) {
  if (!results || results.length === 0) return null;

  // Count sentiment distribution
  const sentimentCounts = results.reduce(
    (acc, { sentiment }) => {
      if (sentiment === "positive") acc.positive++;
      else if (sentiment === "negative") acc.negative++;
      else acc.neutral++;
      return acc;
    },
    { positive: 0, neutral: 0, negative: 0 }
  );

  const total = results.length;
  const data = [
    { name: "Positive", value: sentimentCounts.positive },
    { name: "Neutral", value: sentimentCounts.neutral },
    { name: "Negative", value: sentimentCounts.negative },
  ];

  const COLORS = ["#22c55e", "#eab308", "#ef4444"]; // green, yellow, red

  const positivePct = ((sentimentCounts.positive / total) * 100).toFixed(1);
  const neutralPct = ((sentimentCounts.neutral / total) * 100).toFixed(1);
  const negativePct = ((sentimentCounts.negative / total) * 100).toFixed(1);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6 shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-center">Sentiment Overview</h2>

      <div className="flex flex-col md:flex-row justify-center items-center gap-8">
        {/* Pie Chart */}
        <div className="w-full md:w-1/2 h-64">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Text */}
        <div className="text-center md:text-left space-y-2">
          <p className="text-green-400 text-lg font-semibold">
            Positive: {positivePct}%
          </p>
          <p className="text-yellow-400 text-lg font-semibold">
            Neutral: {neutralPct}%
          </p>
          <p className="text-red-400 text-lg font-semibold">
            Negative: {negativePct}%
          </p>

          <div className="mt-4">
            <p className="text-gray-300 text-sm italic">
              Based on {total} analyzed headlines
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
