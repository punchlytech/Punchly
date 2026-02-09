"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  saveInspection,
  getInspection,
  deleteInspection,
  type OfflineInspection,
} from "@/lib/offline/inspection-store";

/**
 * Hook that auto-saves inspection data to IndexedDB.
 * Debounces writes to 500ms to avoid thrashing.
 */
export function useInspectionDraft(inspectionId: string | null) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced save
  const save = useCallback(
    (data: OfflineInspection) => {
      if (!inspectionId) return;

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(async () => {
        try {
          await saveInspection(data);
        } catch (err) {
          console.warn("[Punchly] Failed to save draft to IndexedDB:", err);
        }
      }, 500);
    },
    [inspectionId]
  );

  // Load existing draft
  const load = useCallback(async (): Promise<OfflineInspection | null> => {
    if (!inspectionId) return null;
    try {
      return await getInspection(inspectionId);
    } catch {
      return null;
    }
  }, [inspectionId]);

  // Clear draft after successful submission
  const clear = useCallback(async () => {
    if (!inspectionId) return;
    try {
      await deleteInspection(inspectionId);
    } catch {
      // Silently fail
    }
  }, [inspectionId]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return { save, load, clear };
}
