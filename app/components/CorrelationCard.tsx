"use client";

import { useEffect, useState } from "react";

type Props = {
  stock: string;
};

export default function CorrelationCard({ stock }: Props) {
  const [correlation, setCorrelation] = useState<number | null>(null);
  const [interpretation, setInterpretation] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchCorrelation() {
      setLoading(true);
      try {
        const res = await fetch(`/api/correlation?stock=${stock}`);
        const data = await res.json();

        setCorrelation(data.correlation);
        setInterpretation(data.interpretation);
      } catch (err) {
        console.error("Failed to fetch correlation");
      }
      setLoading(false);
    }

    fetchCorrelation();
  }, [stock]);

  function getColorClasses(value: number) {
    if (value > 0.5)
      return "bg-green-500/10 text-green-400 border-green-500/30";
    if (value < -0.5)
      return "bg-red-500/10 text-red-400 border-red-500/30";
    return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
  }

  function getStrengthLabel(value: number) {
    const abs = Math.abs(value);
    if (abs > 0.7) return "Strong";
    if (abs > 0.4) return "Moderate";
    return "Weak";
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h3 className="text-lg font-semibold">
          Sentiment–Price Correlation
        </h3>
        <p className="text-sm text-gray-400 mt-1">
          7-day relationship between aggregated sentiment score and stock price movement.
        </p>
      </div>

      {/* CONTENT */}
      <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 shadow-md">

        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-10 w-24 bg-gray-800 rounded-lg"></div>
            <div className="h-4 w-2/3 bg-gray-800 rounded"></div>
          </div>
        ) : correlation === null ? (
          <div className="text-gray-400 text-sm">
            No correlation data available for the selected period.
          </div>
        ) : (
          <div className="space-y-5">

            {/* VALUE + STRENGTH */}
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold tracking-tight">
                {correlation.toFixed(2)}
              </div>

              <div
                className={`px-3 py-1 rounded-full text-xs font-medium border ${getColorClasses(
                  correlation
                )}`}
              >
                {getStrengthLabel(correlation)} Correlation
              </div>
            </div>

            {/* VISUAL BAR SCALE */}
            <div className="relative h-2 w-full bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`absolute top-0 h-full ${
                  correlation > 0
                    ? "bg-green-500"
                    : "bg-red-500"
                }`}
                style={{
                  width: `${Math.min(Math.abs(correlation) * 100, 100)}%`,
                }}
              />
            </div>

            {/* INTERPRETATION */}
            <div className="text-sm text-gray-400 leading-relaxed">
              {interpretation}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}