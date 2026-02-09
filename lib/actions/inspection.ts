"use server";

import { createAdminClient } from "@/lib/supabase/admin";

interface SubmitSnagLocation {
  location: string;
  description: string;
  photos: { base64: string; annotatedBase64?: string }[];
}

interface SubmitInspectionInput {
  projectName: string;
  unitNumber: string;
  clientName: string;
  inspectionDate: string;
  engineerName: string;
  locations: SubmitSnagLocation[];
}

interface SubmitInspectionResult {
  success: boolean;
  projectId?: string;
  unitId?: string;
  snagIds?: string[];
  error?: string;
}

/**
 * Persists an entire inspection to Supabase:
 *   1. Upserts the project
 *   2. Upserts the unit
 *   3. Inserts each snag location as a snag row
 *   4. Uploads photos to Supabase Storage
 */
export async function submitInspection(
  input: SubmitInspectionInput
): Promise<SubmitInspectionResult> {
  try {
    const supabase = createAdminClient();

    // 1. Upsert project
    let projectId: string;
    const { data: existingProject } = await supabase
      .from("projects")
      .select("id")
      .eq("name", input.projectName)
      .single();

    if (existingProject) {
      projectId = existingProject.id;
    } else {
      const { data: newProject, error: projErr } = await supabase
        .from("projects")
        .insert({
          name: input.projectName,
          location: "",
          client_name: input.clientName,
          status: "active",
          start_date: input.inspectionDate,
        })
        .select("id")
        .single();

      if (projErr || !newProject) {
        return { success: false, error: `Failed to create project: ${projErr?.message}` };
      }
      projectId = newProject.id;
    }

    // 2. Upsert unit
    let unitId: string;
    const { data: existingUnit } = await supabase
      .from("units")
      .select("id")
      .eq("project_id", projectId)
      .eq("unit_number", input.unitNumber)
      .single();

    if (existingUnit) {
      unitId = existingUnit.id;
    } else {
      const { data: newUnit, error: unitErr } = await supabase
        .from("units")
        .insert({
          project_id: projectId,
          unit_number: input.unitNumber,
          unit_type: "general",
          floor: "",
          status: "in_progress",
        })
        .select("id")
        .single();

      if (unitErr || !newUnit) {
        return { success: false, error: `Failed to create unit: ${unitErr?.message}` };
      }
      unitId = newUnit.id;
    }

    // 3. Insert snags + upload photos
    const snagIds: string[] = [];

    for (const loc of input.locations) {
      // Insert snag row
      const { data: snag, error: snagErr } = await supabase
        .from("snags")
        .insert({
          unit_id: unitId,
          project_id: projectId,
          title: loc.location || "Untitled Snag",
          description: loc.description || "",
          category: "other",
          priority: "medium",
          status: "open",
          location: loc.location || "",
        })
        .select("id")
        .single();

      if (snagErr || !snag) {
        console.error("Failed to insert snag:", snagErr);
        continue;
      }

      snagIds.push(snag.id);

      // Upload photos
      for (let i = 0; i < loc.photos.length; i++) {
        const photo = loc.photos[i];

        // Upload original photo
        if (photo.base64) {
          const photoBlob = base64ToBlob(photo.base64);
          const photoPath = `${projectId}/${unitId}/${snag.id}/photo-${i}.jpg`;

          const { error: uploadErr } = await supabase.storage
            .from("snag-photos")
            .upload(photoPath, photoBlob, {
              contentType: "image/jpeg",
              upsert: true,
            });

          if (!uploadErr) {
            const { data: publicUrl } = supabase.storage
              .from("snag-photos")
              .getPublicUrl(photoPath);

            await supabase
              .from("snags")
              .update({ photo_url: publicUrl.publicUrl })
              .eq("id", snag.id);
          }
        }

        // Upload annotated photo
        if (photo.annotatedBase64) {
          const annotatedBlob = base64ToBlob(photo.annotatedBase64);
          const annotatedPath = `${projectId}/${unitId}/${snag.id}/annotated-${i}.jpg`;

          const { error: uploadErr } = await supabase.storage
            .from("snag-photos")
            .upload(annotatedPath, annotatedBlob, {
              contentType: "image/jpeg",
              upsert: true,
            });

          if (!uploadErr) {
            const { data: publicUrl } = supabase.storage
              .from("snag-photos")
              .getPublicUrl(annotatedPath);

            await supabase
              .from("snags")
              .update({ annotated_photo_url: publicUrl.publicUrl })
              .eq("id", snag.id);
          }
        }
      }
    }

    return {
      success: true,
      projectId,
      unitId,
      snagIds,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────

function base64ToBlob(base64: string): Blob {
  // Handle both raw base64 and data URLs
  const parts = base64.split(",");
  const byteString =
    parts.length > 1 ? atob(parts[1]) : atob(parts[0]);
  const mimeMatch = base64.match(/data:([^;]+);/);
  const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";

  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeType });
}
