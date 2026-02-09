"use client";

import { useAuth } from "@/lib/context/auth-context";
import { useDemoMode } from "@/lib/context/demo-mode-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { MetricsBar } from "@/components/dashboard/metrics-bar";
import { TeamPerformance } from "@/components/dashboard/team-performance";
import { ActionGrid } from "@/components/dashboard/action-grid";
import { DashboardFooter } from "@/components/dashboard/dashboard-footer";
import { FlaskConical } from "lucide-react";

export default function Dashboard() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const { isDemoMode, toggleDemoMode } = useDemoMode();
  const router = useRouter();

  // Redirect if not authenticated (wait for loading to finish)
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/");
    }
  }, [loading, isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // Show nothing while checking auth
  if (loading || !isAuthenticated || !user) {
    return null;
  }

  const isManager = user.role === "manager";

  return (
    <div className="min-h-screen flex flex-col bg-punchly-bg">
      <DashboardHeader user={user} onLogout={handleLogout} />

      <main className="flex-1 py-8 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Dashboard Title + Demo Toggle */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl font-semibold mb-2 text-punchly-navy">
                Operations Dashboard
              </h1>
              <p className="text-punchly-text-secondary">
                {isManager
                  ? "Manager view. Full system access."
                  : "Engineer view. Field operations only."}
              </p>
            </div>

            {/* Demo Mode Toggle — Manager only */}
            {isManager && (
              <button
                onClick={toggleDemoMode}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                  isDemoMode
                    ? "bg-punchly-issue/10 border-punchly-issue/30 text-punchly-issue hover:bg-punchly-issue/20"
                    : "bg-punchly-surface border-punchly-border text-punchly-text-secondary hover:border-punchly-blue hover:text-punchly-blue"
                }`}
              >
                <FlaskConical className="h-4 w-4" strokeWidth={2} />
                {isDemoMode ? "Disable Demo Mode" : "Enable Demo Mode"}
              </button>
            )}
          </div>

          {/* Demo Mode Banner */}
          {isDemoMode && (
            <div className="mb-6 p-4 bg-punchly-issue/10 border border-punchly-issue/25 rounded-lg flex items-center gap-3">
              <FlaskConical className="h-5 w-5 text-punchly-issue flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-punchly-issue">
                  Demo Mode Active
                </p>
                <p className="text-xs text-punchly-issue/80">
                  Showing virtual data (5 projects, 24 snags, simulated KPIs). Toggle off to return to your live database.
                </p>
              </div>
            </div>
          )}

          {/* Manager-Only: Metrics Bar */}
          {isManager && <MetricsBar />}

          {/* Manager-Only: Team Performance */}
          {isManager && <TeamPerformance />}

          {/* Action Modules Grid */}
          <ActionGrid isManager={isManager} />
        </div>
      </main>

      <DashboardFooter />
    </div>
  );
}
