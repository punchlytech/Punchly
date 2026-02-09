"use client";

import { useAuth } from "@/lib/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { MetricsBar } from "@/components/dashboard/metrics-bar";
import { TeamPerformance } from "@/components/dashboard/team-performance";
import { ActionGrid } from "@/components/dashboard/action-grid";
import { DashboardFooter } from "@/components/dashboard/dashboard-footer";

export default function Dashboard() {
  const { user, isAuthenticated, loading, logout } = useAuth();
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
          {/* Dashboard Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold mb-2 text-punchly-navy">
              Operations Dashboard
            </h1>
            <p className="text-punchly-text-secondary">
              {isManager
                ? "Manager view. Full system access."
                : "Engineer view. Field operations only."}
            </p>
          </div>

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
