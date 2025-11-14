"use client";

import { useEffect, useState } from "react";
import { auth } from "../firebase/config";
import { addUserStock, getUserStocks, removeUserStock } from "../lib/stockService";
import { onAuthStateChanged } from "firebase/auth";

export default function SavedStocks({ onSelect }: { onSelect: (stock: string) => void }) {
  const [uid, setUid] = useState<string | null>(null);
  const [stocks, setStocks] = useState<string[]>([]);
  const [newStock, setNewStock] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        const saved = await getUserStocks(user.uid);
        setStocks(saved);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleAdd = async () => {
    if (!uid || !newStock.trim()) return;
    try {
      await addUserStock(uid, newStock.toUpperCase());
      const updated = await getUserStocks(uid);
      setStocks(updated);
      setNewStock("");
      setError("");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRemove = async (stock: string) => {
    if (!uid) return;
    await removeUserStock(uid, stock);
    const updated = await getUserStocks(uid);
    setStocks(updated);
  };

  if (loading) return <p className="text-gray-400">Loading saved stocks...</p>;

  return (
    <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl mb-6">
      <h2 className="text-2xl font-semibold mb-4">Your Saved Stocks</h2>

      <div className="flex flex-wrap gap-2 mb-4">
        {stocks.length === 0 ? (
          <p className="text-gray-500 text-sm">No saved stocks yet.</p>
        ) : (
          stocks.map((s) => (
            <div
              key={s}
              className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-lg"
            >
              <button
                onClick={() => onSelect(s)}
                className="text-blue-400 hover:underline"
              >
                {s}
              </button>
              <button
                onClick={() => handleRemove(s)}
                className="text-red-400 hover:text-red-500"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={newStock}
          onChange={(e) => setNewStock(e.target.value)}
          placeholder="Enter stock symbol (e.g., TCS)"
          className="flex-1 p-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
        />
        <button
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
        >
          Add
        </button>
      </div>

      {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
    </div>
  );
}
