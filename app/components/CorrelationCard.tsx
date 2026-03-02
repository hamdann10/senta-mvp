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
        const res = await fetch(
          `/api/correlation?stock=${stock}`
        );
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

  function getColor(value: number | null) {
    if (value === null) return "bg-gray-700";
    if (value > 0.5) return "bg-green-600";
    if (value < -0.5) return "bg-red-600";
    return "bg-yellow-600";
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg">
      <h2 className="text-lg font-semibold mb-4 text-gray-300">
        Sentiment-Price Correlation (7 Days)
      </h2>

      {loading ? (
        <p className="text-gray-400">Calculating...</p>
      ) : correlation === null ? (
        <p className="text-gray-400">No data available</p>
      ) : (
        <div className="space-y-4">
          <div
            className={`inline-block px-4 py-2 rounded-xl text-white font-semibold ${getColor(
              correlation
            )}`}
          >
            {correlation.toFixed(2)}
          </div>

          <div className="text-gray-400">
            {interpretation}
          </div>
        </div>
      )}
    </div>
  );
}