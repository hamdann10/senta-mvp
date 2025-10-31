"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full bg-black/70 backdrop-blur-md text-white shadow-md z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold tracking-tight">
          Senta<span className="text-blue-500">.</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-8">
          <Link href="/" className="hover:text-blue-400 transition">
            Home
          </Link>
          <Link href="/about" className="hover:text-blue-400 transition">
            About
          </Link>
          <Link href="/features" className="hover:text-blue-400 transition">
            Features
          </Link>
          <Link href="/contact" className="hover:text-blue-400 transition">
            Contact
          </Link>

          <Link
            href="/login"
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-all"
          >
            Login
          </Link>
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
          <Link href="/" className="block hover:text-blue-400 transition">
            Home
          </Link>
          <Link href="/about" className="block hover:text-blue-400 transition">
            About
          </Link>
          <Link href="/features" className="block hover:text-blue-400 transition">
            Features
          </Link>
          <Link href="/contact" className="block hover:text-blue-400 transition">
            Contact
          </Link>
          <Link
            href="/login"
            className="block bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium text-center transition-all"
          >
            Login
          </Link>
        </div>
      )}
    </nav>
  );
}
