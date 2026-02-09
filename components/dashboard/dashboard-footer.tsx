import { CheckSquare } from "lucide-react";

export function DashboardFooter() {
  return (
    <footer className="border-t mt-auto bg-punchly-surface border-punchly-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded flex items-center justify-center bg-punchly-navy">
            <CheckSquare className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
          </div>
          <span
            className="text-xs font-semibold text-punchly-navy"
            style={{ letterSpacing: "2px" }}
          >
            PUNCHLY
          </span>
          <span className="text-xs text-punchly-text-secondary">
            v3.0.0
          </span>
        </div>
      </div>
    </footer>
  );
}
