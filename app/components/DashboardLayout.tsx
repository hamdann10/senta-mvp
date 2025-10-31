"use client";
import { ReactNode } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import { useRouter } from "next/navigation";

interface Props {
  children: ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 p-6 flex flex-col justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-8 text-blue-400">Senta</h1>

          <nav className="space-y-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="block w-full text-left py-2 px-4 rounded-lg hover:bg-gray-800 transition"
            >
              🏠 Dashboard
            </button>
            <button
              onClick={() => router.push("/mystocks")}
              className="block w-full text-left py-2 px-4 rounded-lg hover:bg-gray-800 transition"
            >
              📈 My Stocks
            </button>
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 py-2 rounded-lg font-medium transition"
        >
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
