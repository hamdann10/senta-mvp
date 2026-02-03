"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { auth } from "../firebase/config";

import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  const closeMenu = () => setIsOpen(false);

  function getInitials(u: FirebaseUser | null) {
    if (!u) return "U";
    const name = (u.displayName || u.email || "").trim();
    if (!name) return "U";
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  //const fallbackAvatar = "/mnt/data/babcd84a-51da-4384-8ea1-64b131a4e58c.png";

  return (
    <nav className="fixed top-0 left-0 w-full bg-black/70 backdrop-blur-md text-white shadow-md z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <Link href="/" onClick={closeMenu} className="text-2xl font-bold tracking-tight">
          Senta<span className="text-blue-500">.</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-6">
          <a href="#hero" className="hover:text-blue-400 transition">Home</a>
          <a href="#about" className="hover:text-blue-400 transition">About</a>
          <a href="#features" className="hover:text-blue-400 transition">Features</a>
          <a href="#contact" className="hover:text-blue-400 transition">Contact</a>

          {/* ✔ Only show Dashboard if user logged in */}
          {user && (
            <Link href="/dashboard" className="hover:text-blue-300 transition">
              Dashboard
            </Link>
          )}

          {/* Profile / Login */}
          {user ? (
            <Link
              href="/profile"
              onClick={closeMenu}
              className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-white/5 transition"
            >
              {user.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.photoURL} alt="profile" className="w-9 h-9 rounded-full object-cover" />
              ) : (
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm"
                  style={{
                    background: "linear-gradient(135deg, #06b6d4 0%, #7c3aed 100%)",
                  }}
                >
                  {getInitials(user)}
                </div>
              )}
            </Link>
          ) : (
            <Link
              href="/login"
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-all"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden focus:outline-none"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-black border-t border-gray-800 px-6 py-4 space-y-4">
          <a href="#hero" onClick={closeMenu} className="block hover:text-blue-400 transition">Home</a>
          <a href="#about" onClick={closeMenu} className="block hover:text-blue-400 transition">About</a>
          <a href="#features" onClick={closeMenu} className="block hover:text-blue-400 transition">Features</a>
          <a href="#contact" onClick={closeMenu} className="block hover:text-blue-400 transition">Contact</a>

          {/* ✔ Dashboard in mobile menu (only if logged in) */}
          {user && (
            <Link href="/dashboard" onClick={closeMenu} className="block hover:text-blue-300 transition">
              Dashboard
            </Link>
          )}

          {user ? (
            <Link href="/profile" onClick={closeMenu} className="flex items-center gap-3">
              {user.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.photoURL} alt="profile" className="w-9 h-9 rounded-full object-cover" />
              ) : (
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm"
                  style={{
                    background: "linear-gradient(135deg, #06b6d4, #7c3aed)",
                  }}
                >
                  {getInitials(user)}
                </div>
              )}
              <span>Profile</span>
            </Link>
          ) : (
            <Link
              href="/login"
              onClick={closeMenu}
              className="block bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium text-center transition-all"
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
