"use client";

import { useEffect, useState } from "react";
import type { DashboardMetrics } from "@/lib/types";

interface MetricsBarProps {
  initialMetrics?: DashboardMetrics;
}

export function MetricsBar({ initialMetrics }: MetricsBarProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics>(
    initialMetrics ?? { openIssues: 0, resolved: 0, pendingReview: 0 }
  );
  const [loading, setLoading] = useState(!initialMetrics);

  useEffect(() => {
    if (initialMetrics) return;

    async function fetchMetrics() {
      try {
        const res = await fetch("/api/dashboard/metrics");
        if (res.ok) {
          const data = await res.json();
          setMetrics(data);
        }
      } catch {
        // Silently fail — show zeros
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
  }, [initialMetrics]);

  const stats = [
    { label: "Open Issues", value: metrics.openIssues, colorClass: "text-punchly-issue" },
    { label: "Resolved", value: metrics.resolved, colorClass: "text-punchly-success" },
    { label: "Pending Review", value: metrics.pendingReview, colorClass: "text-punchly-warning" },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 mb-8">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="p-5 bg-punchly-surface border border-punchly-border rounded-lg"
        >
          <p className="text-xs font-medium mb-2 text-punchly-text-secondary">
            {stat.label}
          </p>
          {loading ? (
            <div className="h-9 w-16 bg-gray-200 rounded animate-pulse" />
          ) : (
            <p className={`text-3xl font-semibold ${stat.colorClass}`}>
              {stat.value}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
