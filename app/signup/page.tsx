// app/signup/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../firebase/config";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fallback avatar (uploaded file path — will be transformed by your environment)
  const FALLBACK_AVATAR = "/mnt/data/babcd84a-51da-4384-8ea1-64b131a4e58c.png";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!email.trim() || !password) {
      setError("Please enter email and password.");
      return;
    }

    setLoading(true);
    try {
      // 1) create auth user
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = cred.user;

      // 2) set displayName in Auth profile so user.displayName becomes available
      await updateProfile(user, { displayName: name.trim() });

      // 3) create Firestore user doc (id = uid)
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        displayName: name.trim(),
        email: user.email,
        photoURL: user.photoURL ?? FALLBACK_AVATAR,
        savedStocks: [],
        createdAt: serverTimestamp(),
      });

      // 4) navigate to profile (or dashboard)
      router.push("/profile");
    } catch (err: any) {
      console.error("Signup failed", err);
      // Map common firebase errors to friendly messages
      if (err?.code === "auth/email-already-in-use") setError("Email already in use.");
      else if (err?.code === "auth/weak-password") setError("Password is too weak (min 6 chars).");
      else setError(err?.message ?? "Signup failed. Check console.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-slate-800/60 border border-slate-700 rounded-2xl p-6 shadow-md">
        <h2 className="text-2xl font-semibold mb-2 text-center">Create your account</h2>
        <p className="text-sm text-slate-400 mb-6 text-center">Sign up to save watchlists and get alerts.</p>

        {error && <div className="mb-4 text-sm text-amber-300 bg-amber-900/10 p-3 rounded">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Full name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white"
              required
            />
          </div>

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
              placeholder="Choose a secure password"
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>

          <div className="text-center text-sm text-slate-400">
            Already have an account?{" "}
            <a href="/login" className="text-sky-300 hover:underline">
              Log in
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
