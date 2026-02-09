"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import type { DashboardMetrics, TeamPerformance } from "@/lib/types";

/**
 * Fetch dashboard metrics — counts of snags by status.
 * Uses admin client since demo users aren't in Supabase Auth.
 */
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  try {
    const supabase = createAdminClient();

    const [openResult, resolvedResult, pendingResult] = await Promise.all([
      supabase
        .from("snags")
        .select("*", { count: "exact", head: true })
        .in("status", ["open", "in_progress"]),
      supabase
        .from("snags")
        .select("*", { count: "exact", head: true })
        .eq("status", "resolved"),
      supabase
        .from("snags")
        .select("*", { count: "exact", head: true })
        .eq("status", "verified"),
    ]);

    return {
      openIssues: openResult.count ?? 0,
      resolved: resolvedResult.count ?? 0,
      pendingReview: pendingResult.count ?? 0,
    };
  } catch {
    return { openIssues: 0, resolved: 0, pendingReview: 0 };
  }
}

/**
 * Fetch team performance data — aggregated snag counts per engineer.
 */
export async function getTeamPerformance(): Promise<TeamPerformance[]> {
  try {
    const supabase = createAdminClient();

    // Get all snags with reporter info
    const { data: snags } = await supabase
      .from("snags")
      .select("reported_by, status, created_at, resolved_at");

    if (!snags || snags.length === 0) {
      return [
        {
          name: "Site Engineer",
          role: "Field Engineer",
          unitsInspected: 0,
          snagsLogged: 0,
          resolvedThisWeek: 0,
        },
      ];
    }

    // Calculate week start (Monday)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    weekStart.setHours(0, 0, 0, 0);

    // Group by reporter
    const byReporter = new Map<string, { logged: number; resolvedThisWeek: number }>();

    for (const snag of snags) {
      const reporter = snag.reported_by ?? "unknown";
      if (!byReporter.has(reporter)) {
        byReporter.set(reporter, { logged: 0, resolvedThisWeek: 0 });
      }
      const entry = byReporter.get(reporter)!;
      entry.logged++;

      if (snag.status === "resolved" && snag.resolved_at) {
        const resolvedDate = new Date(snag.resolved_at);
        if (resolvedDate >= weekStart) {
          entry.resolvedThisWeek++;
        }
      }
    }

    // Get unique unit IDs per reporter
    const { data: unitSnags } = await supabase
      .from("snags")
      .select("reported_by, unit_id");

    const unitsPerReporter = new Map<string, Set<string>>();
    if (unitSnags) {
      for (const s of unitSnags) {
        const reporter = s.reported_by ?? "unknown";
        if (!unitsPerReporter.has(reporter)) {
          unitsPerReporter.set(reporter, new Set());
        }
        unitsPerReporter.get(reporter)!.add(s.unit_id);
      }
    }

    const results: TeamPerformance[] = [];
    for (const [, stats] of byReporter) {
      results.push({
        name: "Site Engineer",
        role: "Field Engineer",
        unitsInspected: 0, // Will be derived from unit inspections when available
        snagsLogged: stats.logged,
        resolvedThisWeek: stats.resolvedThisWeek,
      });
    }

    return results.length > 0
      ? results
      : [
          {
            name: "Site Engineer",
            role: "Field Engineer",
            unitsInspected: 0,
            snagsLogged: 0,
            resolvedThisWeek: 0,
          },
        ];
  } catch {
    return [
      {
        name: "Site Engineer",
        role: "Field Engineer",
        unitsInspected: 0,
        snagsLogged: 0,
        resolvedThisWeek: 0,
      },
    ];
  }
}
