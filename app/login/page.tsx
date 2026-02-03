// app/login/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      // ✅ Redirect to Home after successful login
      router.push("/");
    } catch (err: any) {
      console.error("Login failed", err);
      if (err?.code === "auth/user-not-found") setError("No account found for this email.");
      else if (err?.code === "auth/wrong-password") setError("Incorrect password.");
      else setError(err?.message ?? "Login failed. Check console.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-slate-800/60 border border-slate-700 rounded-2xl p-6 shadow-md">
        <h2 className="text-2xl font-semibold mb-2 text-center">Log in</h2>
        <p className="text-sm text-slate-400 mb-6 text-center">Sign in to access your watchlist.</p>

        {error && <div className="mb-4 text-sm text-amber-300 bg-amber-900/10 p-3 rounded">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <div className="text-center text-sm text-slate-400">
            Don't have an account?{" "}
            <a href="/signup" className="text-sky-300 hover:underline">
              Create account
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
