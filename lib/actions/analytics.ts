"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import type {
  AnalyticsKPI,
  CategoryBreakdown,
  PriorityBreakdown,
  SnagCategory,
  SnagPriority,
} from "@/lib/types";

/**
 * Calculate resolution rate: (resolved + verified) / total * 100
 */
export async function getResolutionRate(): Promise<number> {
  try {
    const supabase = createAdminClient();

    const [totalResult, resolvedResult] = await Promise.all([
      supabase.from("snags").select("*", { count: "exact", head: true }),
      supabase
        .from("snags")
        .select("*", { count: "exact", head: true })
        .in("status", ["resolved", "verified"]),
    ]);

    const total = totalResult.count ?? 0;
    const resolved = resolvedResult.count ?? 0;

    if (total === 0) return 0;
    return Math.round((resolved / total) * 100);
  } catch {
    return 0;
  }
}

/**
 * Average resolution time in days for resolved snags.
 */
export async function getAvgResolutionTime(): Promise<number> {
  try {
    const supabase = createAdminClient();

    const { data } = await supabase
      .from("snags")
      .select("created_at, resolved_at")
      .not("resolved_at", "is", null);

    if (!data || data.length === 0) return 0;

    const totalDays = data.reduce((sum, snag) => {
      const created = new Date(snag.created_at).getTime();
      const resolved = new Date(snag.resolved_at!).getTime();
      const days = (resolved - created) / (1000 * 60 * 60 * 24);
      return sum + Math.max(days, 0);
    }, 0);

    return Math.round((totalDays / data.length) * 10) / 10;
  } catch {
    return 0;
  }
}

/**
 * Get snag count grouped by category.
 */
export async function getSnagsByCategory(): Promise<CategoryBreakdown[]> {
  try {
    const supabase = createAdminClient();

    const categories: SnagCategory[] = [
      "electrical",
      "plumbing",
      "finishing",
      "structural",
      "hvac",
      "other",
    ];

    const results = await Promise.all(
      categories.map(async (cat) => {
        const { count } = await supabase
          .from("snags")
          .select("*", { count: "exact", head: true })
          .eq("category", cat);
        return { category: cat, count: count ?? 0 };
      })
    );

    return results.filter((r) => r.count > 0);
  } catch {
    return [];
  }
}

/**
 * Get snag count grouped by priority.
 */
export async function getSnagsByPriority(): Promise<PriorityBreakdown[]> {
  try {
    const supabase = createAdminClient();

    const priorities: SnagPriority[] = ["critical", "high", "medium", "low"];

    const results = await Promise.all(
      priorities.map(async (p) => {
        const { count } = await supabase
          .from("snags")
          .select("*", { count: "exact", head: true })
          .eq("priority", p);
        return { priority: p, count: count ?? 0 };
      })
    );

    return results;
  } catch {
    return [];
  }
}

/**
 * Aggregate analytics KPI.
 */
export async function getAnalyticsKPI(): Promise<AnalyticsKPI> {
  try {
    const supabase = createAdminClient();

    const [rate, avgTime, totalResult] = await Promise.all([
      getResolutionRate(),
      getAvgResolutionTime(),
      supabase.from("snags").select("*", { count: "exact", head: true }),
    ]);

    // Quality score: simple formula based on resolution rate and speed
    const speedScore = avgTime <= 1 ? 10 : avgTime <= 3 ? 8 : avgTime <= 7 ? 6 : 4;
    const qualityScore = Math.round(((rate / 100) * 6 + (speedScore / 10) * 4) * 10) / 10;

    return {
      resolutionRate: rate,
      avgResolutionTimeDays: avgTime,
      totalSnags: totalResult.count ?? 0,
      qualityScore: Math.min(qualityScore, 10),
    };
  } catch {
    return {
      resolutionRate: 0,
      avgResolutionTimeDays: 0,
      totalSnags: 0,
      qualityScore: 0,
    };
  }
}
