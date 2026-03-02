"use client";

import React, { useEffect, useState } from "react";
import StockSearch from "@/app/components/StockSearch";
import { db, auth } from "../firebase/config";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import {
  onAuthStateChanged,
  signOut,
  type User as FirebaseUser,
} from "firebase/auth";
import { Trash, LogOut } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();

  /* ================= AUTH ================= */

  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  /* ================= WATCHLIST ================= */

  const [savedStocks, setSavedStocks] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  /* ================= AUTH LISTENER ================= */

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setUserId(u?.uid ?? null);
      setDisplayName(u?.displayName ?? null);
      setEmail(u?.email ?? null);
    });
    return () => unsub();
  }, []);

  /* ================= LOAD USER DATA ================= */

  useEffect(() => {
    async function load() {
      if (!userId) {
        setSavedStocks([]);
        return;
      }

      setLoading(true);
      try {
        const ref = doc(db, "users", userId);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();
          setSavedStocks(Array.isArray(data.savedStocks) ? data.savedStocks : []);
        } else {
          await setDoc(ref, {
            createdAt: serverTimestamp(),
            savedStocks: [],
          });
        }
      } catch (err) {
        console.error(err);
        setMessage("Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [userId]);

  /* ================= HELPERS ================= */

  const requireLogin = () => {
    setMessage("Please sign in to manage your profile.");
    setTimeout(() => router.push("/login"), 800);
  };

  const addStock = async (symbol: string) => {
    setMessage(null);

    if (!userId) return requireLogin();

    if (savedStocks.includes(symbol)) {
      setMessage("Stock already added.");
      return;
    }

    if (savedStocks.length >= 2) {
      setMessage("Maximum 2 stocks allowed.");
      return;
    }

    setLoading(true);
    try {
      const ref = doc(db, "users", userId);
      await updateDoc(ref, { savedStocks: arrayUnion(symbol) });
      setSavedStocks((s) => [...s, symbol]);
      setMessage(`${symbol} added successfully.`);
    } catch (err) {
      console.error(err);
      setMessage("Failed to add stock.");
    } finally {
      setLoading(false);
    }
  };

  const removeStock = async (symbol: string) => {
    if (!userId) return requireLogin();

    setLoading(true);
    try {
      const ref = doc(db, "users", userId);
      await updateDoc(ref, { savedStocks: arrayRemove(symbol) });
      setSavedStocks((s) => s.filter((x) => x !== symbol));
      setMessage(`${symbol} removed.`);
    } catch (err) {
      console.error(err);
      setMessage("Failed to remove stock.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-950 to-gray-900 text-white pt-28 pb-16 px-6">
      <div className="max-w-5xl mx-auto space-y-12">

        {/* ================= HEADER ================= */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Account Settings
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Manage your monitored stocks and preferences.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>

        {/* ================= PROFILE CARD ================= */}
        <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 shadow-md space-y-2">
          <div className="text-lg font-medium">
            {displayName ?? "User"}
          </div>
          <div className="text-sm text-gray-400">
            {email}
          </div>
        </div>

        {/* ================= WATCHLIST ================= */}
        <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-8 shadow-md space-y-8">

          {/* Section Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                Monitored Stocks
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Add up to 2 Indian stocks for sentiment tracking.
              </p>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {savedStocks.length} / 2 used
            </span>
          </div>

          {/* Search */}
          <StockSearch
            disabled={loading || savedStocks.length >= 2}
            onSelect={(stock) => addStock(stock.symbol)}
          />

          {/* Empty State */}
          {savedStocks.length === 0 ? (
            <div className="border border-dashed border-gray-700 rounded-xl p-8 text-center text-gray-400 text-sm">
              No stocks added yet. Search and add your first stock.
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {savedStocks.map((s) => (
                <div
                  key={s}
                  className="flex items-center gap-3 px-4 py-2 rounded-full bg-gray-800/70 border border-gray-700 hover:border-gray-600 transition"
                >
                  <span className="font-medium text-gray-200">
                    {s}
                  </span>

                  <button
                    onClick={() => removeStock(s)}
                    className="text-red-400 hover:text-red-300 transition"
                  >
                    <Trash size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Message Feedback */}
          {message && (
            <div className="text-sm text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg">
              {message}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}