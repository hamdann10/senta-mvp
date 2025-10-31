"use client";
import AuthGuard from "../components/AuthGuard";
import DashboardLayout from "../components/DashboardLayout";

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <h1 className="text-3xl font-bold mb-4">Welcome to your Dashboard 👋</h1>
        <p className="text-gray-400">
          This is your personalized space — soon you’ll see your saved stocks and sentiment insights here.
        </p>
      </DashboardLayout>
    </AuthGuard>
  );
}
