import Link from "next/link";
import { CheckSquare } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F7F9FB] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="h-16 w-16 rounded-lg bg-[#0B3C5D] flex items-center justify-center mx-auto mb-6">
          <CheckSquare className="h-8 w-8 text-white" strokeWidth={2.5} />
        </div>
        <h1 className="text-6xl font-bold text-[#0B3C5D] mb-4">404</h1>
        <p className="text-lg text-[#5A6977] mb-8">
          This page could not be found.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center h-12 px-6 bg-[#0B3C5D] text-white font-medium rounded-lg hover:bg-[#0B3C5D]/90 transition-colors"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center h-12 px-6 border border-[#E1E6EB] text-[#0B3C5D] font-medium rounded-lg hover:bg-white transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
