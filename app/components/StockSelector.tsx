"use client";

import { useEffect, useState } from "react";
import { auth } from "../firebase/config";
import { getUserStocks } from "../lib/stockService";
import { onAuthStateChanged } from "firebase/auth";

export default function StockSelector({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (stock: string) => void;
}) {
  const [stocks, setStocks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const saved = await getUserStocks(user.uid);
        setStocks(saved);
        if (!selected && saved.length > 0) {
          onSelect(saved[0]); // auto-select first stock
        }
      }
      setLoading(false);
    });
    return () => unsub();
  }, [onSelect, selected]);

  if (loading) {
    return <p className="text-gray-400">Loading stocks...</p>;
  }

  if (stocks.length === 0) {
    return (
      <p className="text-gray-500 text-sm">
        No saved stocks. Add stocks from your profile.
      </p>
    );
  }

  return (
    <div className="mb-6">
      <label className="block text-sm text-gray-400 mb-2">
        Select Stock
      </label>
      <select
        value={selected}
        onChange={(e) => onSelect(e.target.value)}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white"
      >
        {stocks.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </div>
  );
}
