"use server";

import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Get all projects with aggregated snag and unit counts.
 */
export async function getProjectsWithSnagCounts() {
  try {
    const supabase = createAdminClient();

    const { data: projects, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !projects) return [];

    // Get snag counts per project
    const enriched = await Promise.all(
      projects.map(async (project) => {
        const [snagResult, unitResult, latestSnag] = await Promise.all([
          supabase
            .from("snags")
            .select("*", { count: "exact", head: true })
            .eq("project_id", project.id),
          supabase
            .from("units")
            .select("*", { count: "exact", head: true })
            .eq("project_id", project.id),
          supabase
            .from("snags")
            .select("created_at")
            .eq("project_id", project.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single(),
        ]);

        return {
          ...project,
          snag_count: snagResult.count ?? 0,
          unit_count: unitResult.count ?? 0,
          latest_activity: latestSnag.data?.created_at ?? null,
        };
      })
    );

    return enriched;
  } catch {
    return [];
  }
}

/**
 * Get all snags for a specific project, joined with unit data.
 */
export async function getSnagsByProject(projectId: string) {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("snags")
      .select("*, units(unit_number, unit_type, floor)")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}

/**
 * Search snags by unit number across all projects.
 */
export async function searchSnagsByUnitNumber(query: string) {
  try {
    const supabase = createAdminClient();

    // Get matching unit IDs
    const { data: units } = await supabase
      .from("units")
      .select("id")
      .ilike("unit_number", `%${query}%`);

    if (!units || units.length === 0) return [];

    const unitIds = units.map((u) => u.id);

    const { data: snags } = await supabase
      .from("snags")
      .select("*, units(unit_number, unit_type)")
      .in("unit_id", unitIds)
      .order("created_at", { ascending: false });

    return snags ?? [];
  } catch {
    return [];
  }
}

/**
 * Bulk update snag statuses (for bulk-close).
 */
export async function bulkUpdateSnagStatus(
  snagIds: string[],
  status: string
) {
  try {
    const supabase = createAdminClient();

    const updateData: Record<string, string> = { status };

    if (status === "resolved") {
      updateData.resolved_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("snags")
      .update(updateData)
      .in("id", snagIds);

    return { success: !error, error: error?.message };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Update a single snag's status.
 */
export async function updateSnagStatus(snagId: string, status: string) {
  return bulkUpdateSnagStatus([snagId], status);
}
