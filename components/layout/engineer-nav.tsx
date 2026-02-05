"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PunchlyWordmark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/actions/auth";
import { LayoutDashboard, ClipboardList, FolderKanban, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface EngineerNavProps {
  profile: {
    full_name: string;
    email: string;
  };
}

export function EngineerNav({ profile }: EngineerNavProps) {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/engineer",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/engineer/snags",
      label: "My Snags",
      icon: ClipboardList,
    },
    {
      href: "/engineer/projects",
      label: "Projects",
      icon: FolderKanban,
    },
  ];

  return (
    <nav className="bg-white border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/engineer">
              <PunchlyWordmark />
            </Link>
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-slate-900 text-white"
                        : "text-zinc-700 hover:bg-zinc-100"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-slate-900">
                {profile.full_name}
              </p>
              <p className="text-xs text-zinc-600">Engineer</p>
            </div>
            <form action={logout}>
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </form>
          </div>
        </div>
      </div>
    </nav>
  );
}
