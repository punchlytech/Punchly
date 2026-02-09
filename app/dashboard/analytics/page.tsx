"use client";

import { useAuth } from "@/lib/context/auth-context";
import { useDemoMode } from "@/lib/context/demo-mode-context";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardFooter } from "@/components/dashboard/dashboard-footer";
import {
  getAnalyticsKPI,
  getSnagsByCategory,
  getSnagsByPriority,
} from "@/lib/actions/analytics";
import {
  DEMO_KPI,
  DEMO_CATEGORIES,
  DEMO_PRIORITIES,
} from "@/lib/data/mock-demo-data";
import {
  ArrowLeft,
  BarChart3,
  CheckSquare,
  Clock,
  TrendingUp,
  AlertTriangle,
  FlaskConical,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { AnalyticsKPI, CategoryBreakdown, PriorityBreakdown } from "@/lib/types";

const PRIORITY_COLORS: Record<string, string> = {
  critical: "bg-punchly-critical",
  high: "bg-punchly-issue",
  medium: "bg-punchly-warning",
  low: "bg-punchly-success",
};

const CATEGORY_COLORS: Record<string, string> = {
  electrical: "bg-punchly-issue",
  plumbing: "bg-punchly-blue",
  finishing: "bg-punchly-warning",
  structural: "bg-punchly-critical",
  hvac: "bg-punchly-success",
  other: "bg-punchly-text-secondary",
};

export default function AnalyticsPage() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const { isDemoMode } = useDemoMode();
  const router = useRouter();

  const [kpi, setKpi] = useState<AnalyticsKPI | null>(null);
  const [categories, setCategories] = useState<CategoryBreakdown[]>([]);
  const [priorities, setPriorities] = useState<PriorityBreakdown[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const isManager = user?.role === "manager";

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/");
      return;
    }
    if (!loading && !isManager) {
      router.push("/dashboard");
    }
  }, [loading, isAuthenticated, isManager, router]);

  useEffect(() => {
    async function fetchData() {
      setLoadingData(true);

      // Demo mode: use mock data
      if (isDemoMode) {
        setKpi(DEMO_KPI);
        setCategories(DEMO_CATEGORIES);
        setPriorities(DEMO_PRIORITIES);
        setLoadingData(false);
        return;
      }

      // Live mode: fetch from Supabase
      try {
        const [kpiData, catData, priData] = await Promise.all([
          getAnalyticsKPI(),
          getSnagsByCategory(),
          getSnagsByPriority(),
        ]);
        setKpi(kpiData);
        setCategories(catData);
        setPriorities(priData);
      } catch {
        // Silently fail — show zeros
      } finally {
        setLoadingData(false);
      }
    }
    fetchData();
  }, [isDemoMode]);

  if (loading || !isAuthenticated || !user || !isManager) return null;

  const maxCategoryCount = Math.max(...categories.map((c) => c.count), 1);

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
          {/* Back + Title */}
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
              Analytics & KPI
            </h1>
            <p className="text-punchly-text-secondary">
              {isDemoMode
                ? "Showing simulated performance metrics."
                : "Real-time performance metrics from your Supabase data."}
            </p>
          </div>

          {/* Demo Mode Banner */}
          {isDemoMode && (
            <div className="mb-6 p-3 bg-punchly-issue/10 border border-punchly-issue/25 rounded-lg flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-punchly-issue flex-shrink-0" />
              <p className="text-xs font-medium text-punchly-issue">
                Demo Mode — Showing simulated KPI data
              </p>
            </div>
          )}

          {loadingData ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="p-5 bg-white border border-punchly-border rounded-lg animate-pulse"
                >
                  <div className="h-4 w-24 bg-gray-200 rounded mb-4" />
                  <div className="h-8 w-16 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* KPI Cards */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <KPICard
                  icon={TrendingUp}
                  label="Resolution Rate"
                  value={kpi ? `${kpi.resolutionRate}%` : "0%"}
                  subtitle={
                    kpi && kpi.totalSnags > 0
                      ? "Based on total snags"
                      : "No data yet"
                  }
                  color="text-punchly-success"
                />
                <KPICard
                  icon={Clock}
                  label="Avg. Resolution Time"
                  value={
                    kpi
                      ? `${kpi.avgResolutionTimeDays} days`
                      : "0 days"
                  }
                  subtitle="Target: 3 days"
                  color="text-punchly-navy"
                />
                <KPICard
                  icon={AlertTriangle}
                  label="Total Snags"
                  value={kpi ? `${kpi.totalSnags}` : "0"}
                  subtitle="All time"
                  color="text-punchly-issue"
                />
                <KPICard
                  icon={CheckSquare}
                  label="Quality Score"
                  value={kpi ? `${kpi.qualityScore}/10` : "0/10"}
                  subtitle={
                    kpi && kpi.qualityScore >= 8
                      ? "Excellent"
                      : kpi && kpi.qualityScore >= 6
                        ? "Good"
                        : "Needs improvement"
                  }
                  color="text-punchly-blue"
                />
              </div>

              {/* Category Breakdown */}
              <div className="grid lg:grid-cols-2 gap-6 mb-8">
                <div className="p-6 bg-white border border-punchly-border rounded-lg">
                  <h2 className="text-lg font-semibold text-punchly-navy mb-4 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-punchly-blue" />
                    By Category
                  </h2>
                  {categories.length === 0 ? (
                    <p className="text-sm text-punchly-text-secondary py-4 text-center">
                      No data yet
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {categories.map((cat) => (
                        <div key={cat.category}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-punchly-text capitalize">
                              {cat.category}
                            </span>
                            <span className="text-sm font-medium text-punchly-navy">
                              {cat.count}
                            </span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                CATEGORY_COLORS[cat.category] ||
                                "bg-punchly-blue"
                              }`}
                              style={{
                                width: `${(cat.count / maxCategoryCount) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Priority Distribution */}
                <div className="p-6 bg-white border border-punchly-border rounded-lg">
                  <h2 className="text-lg font-semibold text-punchly-navy mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-punchly-issue" />
                    By Priority
                  </h2>
                  {priorities.every((p) => p.count === 0) ? (
                    <p className="text-sm text-punchly-text-secondary py-4 text-center">
                      No data yet
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      {priorities.map((p) => (
                        <div
                          key={p.priority}
                          className="p-4 bg-punchly-bg rounded-lg border border-punchly-border"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div
                              className={`h-3 w-3 rounded-full ${
                                PRIORITY_COLORS[p.priority] || "bg-gray-400"
                              }`}
                            />
                            <span className="text-xs font-medium text-punchly-text-secondary uppercase">
                              {p.priority}
                            </span>
                          </div>
                          <p className="text-2xl font-semibold text-punchly-navy">
                            {p.count}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <DashboardFooter />
    </div>
  );
}

// ─── KPI Card Component ──────────────────────────────────────────────

function KPICard({
  icon: Icon,
  label,
  value,
  subtitle,
  color,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
  subtitle: string;
  color: string;
}) {
  return (
    <div className="p-5 bg-white border border-punchly-border rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-punchly-text-secondary">
          {label}
        </p>
        <Icon className={`h-5 w-5 ${color}`} strokeWidth={2} />
      </div>
      <p className={`text-3xl font-semibold ${color}`}>{value}</p>
      <p className="text-xs text-punchly-text-secondary mt-1">{subtitle}</p>
    </div>
  );
}
