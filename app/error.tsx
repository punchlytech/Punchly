"use client";

import { CheckSquare } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#F7F9FB] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="h-16 w-16 rounded-lg bg-[#C62828] flex items-center justify-center mx-auto mb-6">
          <CheckSquare className="h-8 w-8 text-white" strokeWidth={2.5} />
        </div>
        <h2 className="text-2xl font-semibold text-[#0B3C5D] mb-2">
          Something went wrong
        </h2>
        <p className="text-[#5A6977] mb-8">
          {error.message || "An unexpected error occurred."}
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center h-12 px-6 bg-[#0B3C5D] text-white font-medium rounded-lg hover:bg-[#0B3C5D]/90 transition-colors"
          >
            Try Again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center h-12 px-6 border border-[#E1E6EB] text-[#0B3C5D] font-medium rounded-lg hover:bg-white transition-colors"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}
