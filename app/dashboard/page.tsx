"use client";
import AuthGuard from "../components/AuthGuard";
import SavedStocks from "../components/SavedStocks";
import NewsPreview from "../components/NewsPreview";
import { useState } from "react";

export default function DashboardPage() {
  const [selectedStock, setSelectedStock] = useState("RELIANCE");

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-950 text-white p-6">
        <h1 className="text-3xl font-bold mb-6">Market Sentiment Dashboard</h1>

        {/* Saved Stocks Section */}
        <SavedStocks onSelect={(stock) => setSelectedStock(stock)} />

        {/* Selected Stock News & Sentiment */}
        <p className="text-gray-400 mb-4">
          Latest sentiment for{" "}
          <span className="text-blue-400 font-semibold">{selectedStock}</span>
        </p>

        <NewsPreview stock={selectedStock} />
      </div>
    </AuthGuard>
  );
}
