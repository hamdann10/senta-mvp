"use client";
import AuthGuard from "../components/AuthGuard";
import NewsPreview from "../components/NewsPreview";

export default function DashboardPage() {
  const stock = "Reliance"; // temporary default

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-950 text-white p-6">
        <h1 className="text-3xl font-bold mb-6">Market Sentiment Dashboard</h1>
        <p className="text-gray-400 mb-4">Latest news for <span className="text-blue-400">{stock}</span></p>

        <NewsPreview stock={stock} />
      </div>
    </AuthGuard>
  );
}
