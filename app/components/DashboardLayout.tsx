"use client";

import { ReactNode } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import { useRouter, usePathname } from "next/navigation";

interface Props {
  children: ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const navItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "My Stocks", path: "/mystocks" },
  ];

  return (
    <div className="flex h-screen bg-gray-950 text-white">

      {/* ===== Sidebar ===== */}
      <aside className="w-64 bg-gray-900/90 border-r border-gray-800 flex flex-col justify-between">

        {/* Top Section */}
        <div className="p-6 space-y-10">

          {/* Logo / Branding */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              <span className="text-blue-400">Senta</span>
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Market Sentiment Intelligence
            </p>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.path;

              return (
                <button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition ${
                    isActive
                      ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="p-6 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full py-2.5 rounded-lg text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* ===== Main Content ===== */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-8 py-10">
          {children}
        </div>
      </main>
    </div>
  );
}