"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, MapPin } from "lucide-react";

interface SnagRow {
  id: string;
  title: string;
  description: string;
  location: string;
  status: string;
  priority: string;
  category: string;
  photo_url: string | null;
  annotated_photo_url: string | null;
  created_at: string;
  units?: { unit_number: string; unit_type?: string } | null;
}

interface SnagListProps {
  snags: SnagRow[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  showCheckboxes: boolean;
}

const PRIORITY_STYLES: Record<string, string> = {
  critical: "bg-punchly-critical/10 text-punchly-critical",
  high: "bg-punchly-issue/10 text-punchly-issue",
  medium: "bg-punchly-warning/10 text-punchly-warning",
  low: "bg-punchly-success/10 text-punchly-success",
};

const STATUS_STYLES: Record<string, string> = {
  open: "bg-punchly-issue/10 text-punchly-issue",
  in_progress: "bg-punchly-blue/10 text-punchly-blue",
  resolved: "bg-punchly-success/10 text-punchly-success",
  verified: "bg-punchly-navy/10 text-punchly-navy",
};

export function SnagList({
  snags,
  selectedIds,
  onSelectionChange,
  showCheckboxes,
}: SnagListProps) {
  const [expandedSnag, setExpandedSnag] = useState<string | null>(null);

  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((s) => s !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === snags.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(snags.map((s) => s.id));
    }
  };

  return (
    <div className="space-y-2 mb-4">
      {/* Select All */}
      {showCheckboxes && snags.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 text-xs text-punchly-text-secondary">
          <input
            type="checkbox"
            checked={selectedIds.length === snags.length && snags.length > 0}
            onChange={toggleSelectAll}
            className="rounded border-punchly-border"
            aria-label="Select all snags"
          />
          <span>Select all ({snags.length})</span>
        </div>
      )}

      {snags.map((snag) => (
        <div
          key={snag.id}
          className="bg-white border border-punchly-border rounded-lg overflow-hidden"
        >
          {/* Row */}
          <div className="flex items-center gap-3 px-4 py-3">
            {showCheckboxes && (
              <input
                type="checkbox"
                checked={selectedIds.includes(snag.id)}
                onChange={() => toggleSelection(snag.id)}
                className="rounded border-punchly-border shrink-0"
                aria-label={`Select snag: ${snag.title}`}
              />
            )}

            <button
              onClick={() =>
                setExpandedSnag(expandedSnag === snag.id ? null : snag.id)
              }
              className="flex-1 flex items-center gap-3 text-left min-w-0"
            >
              {expandedSnag === snag.id ? (
                <ChevronDown className="h-4 w-4 text-punchly-text-secondary shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 text-punchly-text-secondary shrink-0" />
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-punchly-navy truncate">
                  {snag.title || "Untitled Snag"}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  {snag.units?.unit_number && (
                    <span className="text-xs text-punchly-text-secondary">
                      Unit {snag.units.unit_number}
                    </span>
                  )}
                  {snag.location && (
                    <span className="text-xs text-punchly-text-secondary flex items-center gap-0.5">
                      <MapPin className="h-3 w-3" />
                      {snag.location}
                    </span>
                  )}
                </div>
              </div>
            </button>

            {/* Badges */}
            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                  PRIORITY_STYLES[snag.priority] || PRIORITY_STYLES.medium
                }`}
              >
                {snag.priority}
              </span>
              <span
                className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                  STATUS_STYLES[snag.status] || STATUS_STYLES.open
                }`}
              >
                {snag.status.replace("_", " ")}
              </span>
            </div>
          </div>

          {/* Expanded Detail */}
          {expandedSnag === snag.id && (
            <div className="px-4 pb-4 pt-1 border-t border-punchly-border bg-punchly-bg">
              {snag.description && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-punchly-text-secondary mb-1">
                    Description
                  </p>
                  <p className="text-sm text-punchly-text whitespace-pre-line">
                    {snag.description}
                  </p>
                </div>
              )}
              <div className="flex items-center gap-4 text-xs text-punchly-text-secondary">
                <span>Category: {snag.category}</span>
                <span>
                  Reported: {new Date(snag.created_at).toLocaleDateString()}
                </span>
              </div>
              {(snag.photo_url || snag.annotated_photo_url) && (
                <div className="mt-3">
                  <img
                    src={snag.annotated_photo_url || snag.photo_url || ""}
                    alt="Snag photo"
                    className="h-32 w-auto rounded-lg border border-punchly-border object-cover"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
