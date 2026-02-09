"use client";

import { Search, X } from "lucide-react";

interface SnagSearchProps {
  query: string;
  onChange: (query: string) => void;
  totalCount: number;
  filteredCount: number;
}

export function SnagSearch({
  query,
  onChange,
  totalCount,
  filteredCount,
}: SnagSearchProps) {
  return (
    <div className="my-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-punchly-text-secondary" />
        <input
          type="text"
          value={query}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search by unit number, location, or title..."
          className="w-full h-10 pl-10 pr-10 text-sm border border-punchly-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-punchly-blue focus:border-transparent"
          aria-label="Search snags"
        />
        {query && (
          <button
            onClick={() => onChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-punchly-text-secondary hover:text-punchly-text transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {query && (
        <p className="text-xs text-punchly-text-secondary mt-2">
          Showing {filteredCount} of {totalCount} snags
        </p>
      )}
    </div>
  );
}
