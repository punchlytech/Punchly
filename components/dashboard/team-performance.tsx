"use client";

import { Users } from "lucide-react";
import type { TeamPerformance as TeamPerformanceType } from "@/lib/types";

interface TeamPerformanceProps {
  data?: TeamPerformanceType[];
}

const DEFAULT_DATA: TeamPerformanceType[] = [
  {
    name: "Site Engineer",
    role: "Field Engineer",
    unitsInspected: 0,
    snagsLogged: 0,
    resolvedThisWeek: 0,
  },
];

export function TeamPerformance({ data }: TeamPerformanceProps) {
  const members = data ?? DEFAULT_DATA;

  return (
    <div className="mb-8 p-6 bg-punchly-surface border border-punchly-border rounded-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-punchly-navy">
          Performance
        </h2>
        <span className="text-xs px-3 py-1 rounded-full bg-punchly-blue/10 text-punchly-blue">
          This Week
        </span>
      </div>

      {members.map((member, i) => (
        <div key={i} className="grid md:grid-cols-4 gap-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full flex items-center justify-center bg-punchly-success/15">
              <Users
                className="h-6 w-6 text-punchly-success"
                strokeWidth={2}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-punchly-text">
                {member.name}
              </p>
              <p className="text-xs text-punchly-text-secondary">
                {member.role}
              </p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-2xl font-semibold text-punchly-navy">
              {member.unitsInspected}
            </p>
            <p className="text-xs text-punchly-text-secondary">
              Units Inspected
            </p>
          </div>

          <div className="text-center">
            <p className="text-2xl font-semibold text-punchly-issue">
              {member.snagsLogged}
            </p>
            <p className="text-xs text-punchly-text-secondary">
              Snags Logged
            </p>
          </div>

          <div className="text-center">
            <p className="text-2xl font-semibold text-punchly-success">
              {member.resolvedThisWeek}
            </p>
            <p className="text-xs text-punchly-text-secondary">
              Resolved
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
