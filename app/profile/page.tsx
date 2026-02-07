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
import { Trash, Plus, LogOut } from "lucide-react";

/**
 * Profile + Watchlist page
 * - Max 2 stocks (used for background monitoring)
 * - Email from Firebase Auth
 * - WhatsApp number stored for future alerts
 */

export default function ProfilePage() {
  const router = useRouter();

  // auth
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  // watchlist
  const [savedStocks, setSavedStocks] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // whatsapp
  const [whatsapp, setWhatsapp] = useState("");
  const [whatsappMsg, setWhatsappMsg] = useState("");

  /* ================= AUTH ================= */

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
        setWhatsapp("");
        return;
      }

      setLoading(true);
      try {
        const ref = doc(db, "users", userId);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();
          setSavedStocks(Array.isArray(data.savedStocks) ? data.savedStocks : []);
          setWhatsapp(data.whatsapp ?? "");
        } else {
          await setDoc(ref, {
            createdAt: serverTimestamp(),
            savedStocks: [],
          });
        }
      } catch (err) {
        console.error(err);
        setMsg("Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [userId]);

  /* ================= HELPERS ================= */

  const requireLogin = () => {
    setMsg("Please sign in to manage your profile.");
    setTimeout(() => router.push("/login"), 900);
  };

  const addStock = async (symbol: string) => {
    setMsg(null);

    if (!userId) return requireLogin();

    if (savedStocks.includes(symbol)) {
      setMsg("Stock already added.");
      return;
    }

    if (savedStocks.length >= 2) {
      setMsg("You can monitor only 2 stocks (used for alerts).");
      return;
    }

    setLoading(true);
    try {
      const ref = doc(db, "users", userId);
      await updateDoc(ref, { savedStocks: arrayUnion(symbol) });
      setSavedStocks((s) => [...s, symbol]);
      setMsg(`${symbol} added.`);
    } catch (err) {
      console.error(err);
      setMsg("Failed to add stock.");
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
      setMsg(`${symbol} removed.`);
    } catch (err) {
      console.error(err);
      setMsg("Failed to remove stock.");
    } finally {
      setLoading(false);
    }
  };

  const saveWhatsapp = async () => {
    if (!userId || !whatsapp.trim()) return;

    try {
      const ref = doc(db, "users", userId);
      await updateDoc(ref, { whatsapp });
      setWhatsappMsg("WhatsApp number saved successfully.");
    } catch (err) {
      console.error(err);
      setWhatsappMsg("Failed to save WhatsApp number.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-xl font-semibold">
              {displayName ?? "User"}
            </div>
            <div className="text-sm text-slate-400">{email}</div>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>

        <div className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700">

          {/* WhatsApp */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-2">Alert Contact</h2>
            <p className="text-xs text-slate-400 mb-3">
              Used for WhatsApp sentiment alerts (email comes from login).
            </p>

            <div className="flex gap-2">
              <input
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+91XXXXXXXXXX"
                className="flex-1 p-2 bg-slate-900 border border-slate-700 rounded-lg"
              />
              <button
                onClick={saveWhatsapp}
                className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg"
              >
                Save
              </button>
            </div>

            {whatsappMsg && (
              <p className="text-sm text-emerald-400 mt-2">{whatsappMsg}</p>
            )}
          </div>

          {/* Add stock */}
          <div>
            <h2 className="text-lg font-semibold mb-2">
              Monitored Stocks (Max 2)
            </h2>

            <StockSearch
              disabled={loading || savedStocks.length >= 2}
              onSelect={(stock) => addStock(stock.symbol)}
            />

            <p className="text-xs text-slate-400 mt-2 mb-4">
              Search and add any Indian stock. These stocks are monitored automatically for alerts.
            </p>

            {/* Saved stocks */}
            <div className="flex flex-wrap gap-3">
              {savedStocks.map((s) => (
                <div
                  key={s}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-700 rounded-full"
                >
                  <span>{s}</span>
                  <button onClick={() => removeStock(s)}>
                    <Trash size={14} className="text-rose-400" />
                  </button>
                </div>
              ))}
            </div>

            {msg && (
              <div className="mt-4 text-sm text-amber-300">{msg}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
