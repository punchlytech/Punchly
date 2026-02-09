"use client";

import {
  ArrowRight,
  BarChart3,
  ClipboardList,
  FileText,
  Scan,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface ActionGridProps {
  isManager: boolean;
}

export function ActionGrid({ isManager }: ActionGridProps) {
  const router = useRouter();

  return (
    <div
      className={`grid ${
        isManager ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      } gap-6 mb-8`}
    >
      {/* Start Inspection — Both roles */}
      <button
        onClick={() => router.push("/inspection/setup")}
        className="p-6 text-left group transition-all duration-300 bg-punchly-navy rounded-lg"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="h-12 w-12 flex items-center justify-center bg-white/15 rounded-lg">
            <Scan className="h-6 w-6 text-white" strokeWidth={2.5} />
          </div>
          <ArrowRight
            className="h-5 w-5 text-white opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
            strokeWidth={2}
          />
        </div>
        <h3 className="text-lg font-semibold text-white mb-1">
          Start Inspection
        </h3>
        <p className="text-sm text-white/70">Begin site visit</p>
      </button>

      {/* Snags Library — Both roles */}
      <ActionCard
        icon={ClipboardList}
        title="Snags Library"
        subtitle="View all issues"
        onClick={() => router.push("/dashboard/snags")}
      />

      {/* Reports — Both roles */}
      <ActionCard
        icon={FileText}
        title="Reports"
        subtitle="Generate documents"
        onClick={() => router.push("/dashboard/reports")}
      />

      {/* Analytics — Manager only */}
      {isManager && (
        <ActionCard
          icon={BarChart3}
          title="Analytics & KPI"
          subtitle="Performance metrics"
          onClick={() => router.push("/dashboard/analytics")}
        />
      )}
    </div>
  );
}

// ─── Reusable Action Card ────────────────────────────────────────────

interface ActionCardProps {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  subtitle: string;
  onClick: () => void;
}

function ActionCard({ icon: Icon, title, subtitle, onClick }: ActionCardProps) {
  return (
    <button
      onClick={onClick}
      className="p-6 text-left group transition-all duration-300 bg-punchly-surface border border-punchly-border rounded-lg hover:-translate-y-1 hover:border-punchly-blue"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="h-12 w-12 flex items-center justify-center bg-punchly-blue/10 border border-punchly-blue/25 rounded-lg">
          <Icon className="h-6 w-6 text-punchly-blue" strokeWidth={2.5} />
        </div>
        <ArrowRight
          className="h-5 w-5 text-punchly-blue opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
          strokeWidth={2}
        />
      </div>
      <h3 className="text-lg font-semibold text-punchly-navy mb-1">
        {title}
      </h3>
      <p className="text-sm text-punchly-text-secondary">{subtitle}</p>
    </button>
  );
}
