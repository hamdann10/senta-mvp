"use client";

import React, { useEffect, useState } from "react";
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
import { onAuthStateChanged, signOut, type User as FirebaseUser } from "firebase/auth";
import { Trash, Plus, LogOut } from "lucide-react";

/**
 * Dark-themed Profile + Watchlist page
 * - Matches the site's dark palette and spacing
 * - Keeps Firestore logic unchanged
 * - Uses fallback avatar at local path
 */

const ALL_STOCKS = [
  "TCS",
  "INFY",
  "RELIANCE",
  "HDFCBANK",
  "ICICIBANK",
  "LT",
  "HINDUNILVR",
  "BHARTIARTL",
  "ITC",
  "ASIANPAINT",
  "SBIN",
  "KOTAKBANK",
  "AXISBANK",
  "SBILIFE",
  "MARUTI",
];

// fallback avatar saved in your project's public or local path
const FALLBACK_AVATAR = "/mnt/data/babcd84a-51da-4384-8ea1-64b131a4e58c.png";

export default function ProfilePage() {
  const router = useRouter();

  // auth + user
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  // watchlist state
  const [savedStocks, setSavedStocks] = useState<string[]>([]);
  const [selected, setSelected] = useState<string>(ALL_STOCKS[0]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // settings (local only for now)
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(false);

  // listen for auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setUserId(u?.uid ?? null);
      setDisplayName(u?.displayName ?? null);
      setEmail(u?.email ?? null);
    });
    return () => unsub();
  }, []);

  // load user's savedStocks
  useEffect(() => {
    async function load() {
      setMsg(null);
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
          const list: string[] = Array.isArray(data?.savedStocks) ? data.savedStocks : [];
          setSavedStocks(list);
        } else {
          await setDoc(ref, { createdAt: serverTimestamp(), savedStocks: [] });
          setSavedStocks([]);
        }
      } catch (err) {
        console.error("Failed to load saved stocks", err);
        setMsg("Failed to load saved stocks. Check console.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId]);

  function initialsFromUser(u: FirebaseUser | null) {
    if (!u) return "U";
    const name = (u.displayName || u.email || "").trim();
    if (!name) return "U";
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  const requireLogin = () => {
    setMsg("Please sign in to edit your watchlist. Redirecting to login...");
    setTimeout(() => router.push("/login"), 900);
  };

  const addStock = async (symbol: string) => {
    setMsg(null);
    if (!userId) {
      requireLogin();
      return;
    }
    if (savedStocks.includes(symbol)) {
      setMsg("Already in your watchlist.");
      return;
    }
    if (savedStocks.length >= 5) {
      setMsg("You can save up to 5 stocks only.");
      return;
    }

    setLoading(true);
    try {
      const ref = doc(db, "users", userId);
      await updateDoc(ref, { savedStocks: arrayUnion(symbol) });
      setSavedStocks((s) => [...s, symbol]);
      setMsg(`${symbol} added to watchlist.`);
    } catch (err: any) {
      // fallback create doc if needed
      if (String(err).toLowerCase().includes("no document") || err?.code === "not-found") {
        try {
          const ref = doc(db, "users", userId);
          await setDoc(ref, { savedStocks: [symbol], createdAt: serverTimestamp() });
          setSavedStocks([symbol]);
          setMsg(`${symbol} added to watchlist.`);
        } catch (e) {
          console.error(e);
          setMsg("Failed to save stock.");
        }
      } else {
        console.error(err);
        setMsg("Failed to save stock. Check console.");
      }
    } finally {
      setLoading(false);
    }
  };

  const removeStock = async (symbol: string) => {
    if (!userId) {
      requireLogin();
      return;
    }
    setLoading(true);
    setMsg(null);
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

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setMsg("Signed out");
      router.push("/");
    } catch (err) {
      console.error("logout failed", err);
      setMsg("Logout failed. Check console.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pt-24 pb-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            {user?.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.photoURL} alt="avatar" className="w-14 h-14 rounded-full object-cover shadow-sm ring-1 ring-white/10" />
            ) : (
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center font-semibold text-lg text-white shadow-sm ring-1 ring-white/10"
                style={{ background: "linear-gradient(135deg,#06b6d4 0%,#7c3aed 100%)" }}
                aria-hidden
              >
                {initialsFromUser(user)}
              </div>
            )}

            <div>
              <div className="text-lg font-semibold">{displayName ?? "Anonymous User"}</div>
              <div className="text-sm text-slate-400">{email ?? "Not signed in"}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/")}
              className="hidden sm:inline-block px-4 py-2 rounded-lg border border-slate-700 text-sm text-slate-200 bg-slate-800/40"
            >
              Home
            </button>

            {user ? (
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700"
              >
                <LogOut size={16} /> Logout
              </button>
            ) : (
              <button
                onClick={() => router.push("/login")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700"
              >
                Login
              </button>
            )}
          </div>
        </div>

        {/* Card */}
        <div className="bg-slate-800/60 rounded-2xl shadow-md p-6 border border-slate-700">
          {/* Add stock */}
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-300">Add stock to watchlist</label>
              <div className="mt-2 flex gap-2">
                <select
                  value={selected}
                  onChange={(e) => setSelected(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 bg-slate-900 text-slate-100 border-slate-700"
                >
                  {ALL_STOCKS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => addStock(selected)}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  <Plus size={16} /> Add
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-2">Save up to 5 stocks. We use Firestore to persist your watchlist.</p>
            </div>

            <div className="md:w-56 flex-shrink-0">
              <div className="text-sm font-medium text-slate-300">Watchlist size</div>
              <div className="mt-1 inline-flex items-center gap-2 text-sm">
                <div className="px-3 py-1 rounded-xl bg-slate-900 text-slate-100 font-semibold">{savedStocks.length}</div>
                <div className="text-xs text-slate-400">/ 5</div>
              </div>
            </div>
          </div>

          {/* message */}
          {msg && (
            <div className="mt-4 p-3 rounded-md bg-amber-900/10 text-amber-300 text-sm border border-amber-900/20">
              {msg}
            </div>
          )}

          {/* Saved Stocks list */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-slate-200 mb-3">Saved Stocks</h3>

            {loading && savedStocks.length === 0 ? (
              <div className="text-sm text-slate-400">Loading...</div>
            ) : savedStocks.length === 0 ? (
              <div className="text-sm text-slate-400">No saved stocks yet. Add one above.</div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {savedStocks.map((s) => (
                  <div
                    key={s}
                    className="flex items-center gap-3 px-3 py-2 bg-slate-900 border border-slate-700 rounded-full shadow-sm"
                  >
                    <div className="font-medium text-slate-100">{s}</div>
                    <button
                      onClick={() => removeStock(s)}
                      disabled={loading}
                      aria-label={`Remove ${s}`}
                      className="p-1 rounded-full hover:bg-rose-800/30 transition disabled:opacity-60"
                      title="Remove"
                    >
                      <Trash size={14} className="text-rose-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="mt-8 border-t pt-6">
            <h4 className="text-sm font-semibold text-slate-200">Settings</h4>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center justify-between gap-3 p-3 bg-slate-900 border rounded-lg border-slate-700">
                <div>
                  <div className="text-sm font-medium text-slate-200">Email Alerts</div>
                  <div className="text-xs text-slate-400">Receive a daily sentiment summary via email</div>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                />
              </label>

              <label className="flex items-center justify-between gap-3 p-3 bg-slate-900 border rounded-lg border-slate-700">
                <div>
                  <div className="text-sm font-medium text-slate-200">Push Notifications</div>
                  <div className="text-xs text-slate-400">Enable push alerts (requires setup)</div>
                </div>
                <input
                  type="checkbox"
                  checked={pushNotifications}
                  onChange={(e) => setPushNotifications(e.target.checked)}
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
