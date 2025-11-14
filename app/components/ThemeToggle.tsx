"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="px-3 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 text-sm text-gray-200"
    >
      {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
    </button>
  );
}
