"use client";

import { useAuth } from "@/lib/context/auth-context";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardFooter } from "@/components/dashboard/dashboard-footer";
import { ArrowLeft, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ReportsPage() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/");
    }
  }, [loading, isAuthenticated, router]);

  if (loading || !isAuthenticated || !user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-punchly-bg">
      <DashboardHeader
        user={user}
        onLogout={() => {
          logout();
          router.push("/");
        }}
      />

      <main className="flex-1 py-8 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 text-sm text-punchly-text-secondary hover:text-punchly-navy transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </button>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-punchly-navy mb-2">
              Reports
            </h1>
            <p className="text-punchly-text-secondary">
              Generate and download inspection reports.
            </p>
          </div>

          {/* Empty State */}
          <div className="text-center py-16 bg-white border border-punchly-border rounded-lg">
            <FileText className="h-12 w-12 text-punchly-text-secondary mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-punchly-navy mb-2">
              No Reports Yet
            </h3>
            <p className="text-punchly-text-secondary mb-6">
              Reports are generated when you complete inspections.
            </p>
            <button
              onClick={() => router.push("/inspection/setup")}
              className="inline-flex items-center justify-center h-10 px-6 bg-punchly-navy text-white text-sm font-medium rounded-lg hover:bg-punchly-navy/90 transition-colors"
            >
              Start an Inspection
            </button>
          </div>
        </div>
      </main>

      <DashboardFooter />
    </div>
  );
}
