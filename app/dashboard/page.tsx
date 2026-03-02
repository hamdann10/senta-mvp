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

        {/* 🔷 HEADER */}
        <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur sticky top-0 z-20">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Market Sentiment Dashboard
            </h1>
            <p className="mt-2 text-sm text-gray-400 max-w-2xl">
              AI-powered sentiment insights, correlation analysis, and alert tracking
              for Indian equities.
            </p>
          </div>
        </header>

        {/* 🔷 MAIN CONTENT */}
        <main className="max-w-6xl mx-auto px-6 py-12 space-y-12">

          {/* 🔹 STOCK CONTROL SECTION */}
          <section className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500">
                Control Panel
              </p>
              <h2 className="text-xl font-semibold mt-1">
                Stock Selection
              </h2>
            </div>

            <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 shadow-md hover:shadow-lg transition">
              <StockSelector
                selected={selectedStock}
                onSelect={setSelectedStock}
              />

             
            </div>
          </section>

          {/* 🔹 NEWS + SENTIMENT */}
          <section className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500">
                Analysis
              </p>
              <h2 className="text-xl font-semibold mt-1">
                Sentiment Overview
              </h2>
            </div>

            <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 shadow-md hover:shadow-lg transition">
              <NewsPreview stock={selectedStock} />
            </div>
          </section>

          {/* 🔹 CORRELATION */}
          <section className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500">
                Advanced Metrics
              </p>
              <h2 className="text-xl font-semibold mt-1">
                Sentiment vs Price Correlation
              </h2>
            </div>

            <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 shadow-md hover:shadow-lg transition">
              <CorrelationCard stock={selectedStock} />
            </div>
          </section>

        </main>
      </div>
    </AuthGuard>
  );
}