"use client";

import { CheckSquare, LogOut } from "lucide-react";
import type { DemoUser } from "@/lib/types";

interface DashboardHeaderProps {
  user: DemoUser;
  onLogout: () => void;
}

export function DashboardHeader({ user, onLogout }: DashboardHeaderProps) {
  const isManager = user.role === "manager";

  return (
    <header className="sticky top-0 z-50 bg-punchly-navy">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-white">
            <CheckSquare
              className="h-5 w-5 text-punchly-navy"
              strokeWidth={2.5}
            />
          </div>
          <span
            className="text-lg font-semibold text-white"
            style={{ letterSpacing: "2px" }}
          >
            PUNCHLY
          </span>
        </div>

        {/* User Info & Logout */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white/10 border border-white/20">
            <span className="text-sm font-medium text-white hidden sm:inline">
              {user.fullName}
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded text-white"
              style={{
                backgroundColor: isManager ? "#1F6FA3" : "#2E7D32",
              }}
            >
              {isManager ? "Manager" : "Engineer"}
            </span>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors"
          >
            <LogOut className="h-4 w-4" strokeWidth={2} />
            <span className="hidden sm:inline">Exit</span>
          </button>
        </div>
      </div>
    </header>
  );
}
