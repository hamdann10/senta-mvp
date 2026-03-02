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
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  return (
    <nav className="fixed top-0 left-0 w-full bg-gray-950/80 backdrop-blur-xl border-b border-gray-800 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">

        {/* Logo */}
        <Link
          href="/"
          onClick={closeMenu}
          className="text-xl font-bold tracking-tight"
        >
          Senta<span className="text-blue-500">.</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-sm text-gray-300">

          <a href="#hero" className="hover:text-white transition">
            Home
          </a>
          <a href="#about" className="hover:text-white transition">
            About
          </a>
          <a href="#features" className="hover:text-white transition">
            Features
          </a>
          <a href="#contact" className="hover:text-white transition">
            Contact
          </a>

          {user && (
            <Link
              href="/dashboard"
              className="hover:text-blue-400 transition font-medium"
            >
              Dashboard
            </Link>
          )}

          {/* Profile / Login */}
          {user ? (
            <Link
              href="/profile"
              onClick={closeMenu}
              className="flex items-center justify-center"
            >
              {user.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.photoURL}
                  alt="profile"
                  className="w-9 h-9 rounded-full object-cover border border-gray-700"
                />
              ) : (
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-white"
                  style={{
                    background:
                      "linear-gradient(135deg, #06b6d4 0%, #7c3aed 100%)",
                  }}
                >
                  {getInitials(user)}
                </div>
              )}
            </Link>
          ) : (
            <Link
              href="/login"
              className="bg-blue-600/90 hover:bg-blue-600 px-4 py-2 rounded-lg font-medium transition text-white"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-gray-300 hover:text-white transition"
        >
          {isOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-gray-950 border-t border-gray-800 px-6 py-6 space-y-5 text-sm text-gray-300">

          <a href="#hero" onClick={closeMenu} className="block hover:text-white transition">
            Home
          </a>
          <a href="#about" onClick={closeMenu} className="block hover:text-white transition">
            About
          </a>
          <a href="#features" onClick={closeMenu} className="block hover:text-white transition">
            Features
          </a>
          <a href="#contact" onClick={closeMenu} className="block hover:text-white transition">
            Contact
          </a>

          {user && (
            <Link
              href="/dashboard"
              onClick={closeMenu}
              className="block font-medium hover:text-blue-400 transition"
            >
              Dashboard
            </Link>
          )}

          {user ? (
            <Link
              href="/profile"
              onClick={closeMenu}
              className="flex items-center gap-3 pt-4 border-t border-gray-800"
            >
              {user.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.photoURL}
                  alt="profile"
                  className="w-9 h-9 rounded-full object-cover border border-gray-700"
                />
              ) : (
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-white"
                  style={{
                    background:
                      "linear-gradient(135deg, #06b6d4, #7c3aed)",
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
              className="block bg-blue-600/90 hover:bg-blue-600 px-4 py-2 rounded-lg font-medium text-center transition text-white"
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}