"use client";

import { useState } from "react";
import { bulkUpdateSnagStatus } from "@/lib/actions/snags";
import { CheckCircle2, Loader2, X } from "lucide-react";

interface BulkActionsProps {
  selectedIds: string[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function BulkActions({
  selectedIds,
  onSuccess,
  onCancel,
}: BulkActionsProps) {
  const [confirming, setConfirming] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleBulkClose = async () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }

    setProcessing(true);

    try {
      const result = await bulkUpdateSnagStatus(selectedIds, "resolved");
      if (result.success) {
        onSuccess();
      } else {
        alert(`Failed to close snags: ${result.error}`);
      }
    } catch {
      alert("An error occurred while closing snags.");
    } finally {
      setProcessing(false);
      setConfirming(false);
    }
  };

  return (
    <div className="sticky bottom-0 z-20 bg-white border-t border-punchly-border shadow-lg px-4 py-3 -mx-4 mt-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-punchly-navy">
          {selectedIds.length} selected
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-punchly-text-secondary hover:text-punchly-text transition-colors"
            disabled={processing}
          >
            <X className="h-4 w-4" />
            Cancel
          </button>

          <button
            onClick={handleBulkClose}
            disabled={processing}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium text-white rounded-md transition-colors ${
              confirming
                ? "bg-punchly-critical hover:bg-punchly-critical/90"
                : "bg-punchly-success hover:bg-punchly-success/90"
            } disabled:opacity-50`}
          >
            {processing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Closing...
              </>
            ) : confirming ? (
              "Confirm Close?"
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Close Selected
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
