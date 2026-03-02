"use client";

import AuthGuard from "../components/AuthGuard";
import NewsPreview from "../components/NewsPreview";
import StockSelector from "../components/StockSelector";
import CorrelationCard from "../components/CorrelationCard";
import { useState } from "react";

export default function DashboardPage() {
  const [selectedStock, setSelectedStock] = useState("RELIANCE");

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-950 to-gray-900 text-white">

        {/* 🔥 HEADER SECTION */}
        <div className="border-b border-gray-800 bg-gray-950/80 backdrop-blur sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Market Sentiment Dashboard
            </h1>
          </div>
        </div>

        {/* 🔥 MAIN CONTENT */}
        <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">

          {/* 📌 STOCK SELECTOR CARD */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg">
            <h2 className="text-lg font-semibold mb-4 text-gray-300">
              Select Stock
            </h2>

            <StockSelector
              selected={selectedStock}
              onSelect={setSelectedStock}
            />

            <div className="mt-4 text-gray-400">
              Tracking sentiment for{" "}
              <span className="text-blue-400 font-semibold">
                {selectedStock}
              </span>
            </div>
          </div>

          {/* 📊 NEWS + SENTIMENT SECTION */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg">
            <NewsPreview stock={selectedStock} />
          </div>
          {/* 📈 CORRELATION SECTION */}
          <CorrelationCard stock={selectedStock} />
        </div>
      </div>
    </AuthGuard>
  );
}
