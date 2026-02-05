"use client";

import { Button } from "@/components/ui/button";
import { PunchlyWordmark } from "@/components/brand/logo";
import { useAuth } from "@/lib/context/auth-context";
import {
  BarChart3,
  ClipboardList,
  Database,
  FileCheck,
  LogOut,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { user, isAuthenticated, login, logout } = useAuth();
  const router = useRouter();

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const success = login(username, password);

    if (!success) {
      setError("Invalid credentials. Try: admin/admin123 or engineer/engineer123");
    }
  };

  const handleModuleClick = (module: string) => {
    if (!isAuthenticated) return;

    if (module === "inspection") {
      router.push("/inspection/setup");
    }
    // Other modules will be implemented in later phases
  };

  return (
    <div className="min-h-screen bg-white relative flex flex-col">
      {/* Blueprint Grid Background */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `radial-gradient(circle, #d4d4d8 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
          opacity: 0.3,
        }}
      />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top Centered Logo */}
        <div className="border-b border-zinc-300 bg-white/95 backdrop-blur-sm py-6">
          <div className="flex justify-center items-center gap-4">
            <PunchlyWordmark />
            {isAuthenticated && (
              <div className="flex items-center gap-3 ml-8">
                <span className="text-xs text-zinc-600">
                  {user?.fullName} ({user?.role})
                </span>
                <button
                  onClick={logout}
                  className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1"
                >
                  <LogOut className="h-3 w-3" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content - Login Card or Feature Buttons */}
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          {!isAuthenticated ? (
            <div className="w-full max-w-md">
              {/* Primary Login Card */}
              <div className="bg-white border-2 border-zinc-800 rounded-lg p-8 shadow-lg">
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-zinc-900 mb-2">
                    Staff Portal
                  </h1>
                  <p className="text-sm text-zinc-600">
                    Sign in to access snagging operations
                  </p>
                </div>

                <form onSubmit={handleSignIn} className="space-y-5">
                  {/* Username Field */}
                  <div>
                    <label
                      htmlFor="username"
                      className="block text-sm font-semibold text-zinc-900 mb-2"
                    >
                      Username
                    </label>
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      className="w-full h-11 px-4 border-2 border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent bg-white"
                      required
                    />
                  </div>

                  {/* Password Field */}
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-semibold text-zinc-900 mb-2"
                    >
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full h-11 px-4 border-2 border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent bg-white"
                      required
                    />
                  </div>

                  {/* Error Message - Only shown on error */}
                  {error && (
                    <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4">
                      <p className="text-sm text-red-700 font-semibold">{error}</p>
                    </div>
                  )}

                  {/* Sign In Button */}
                  <Button
                    type="submit"
                    className="w-full bg-zinc-900 hover:bg-zinc-800 h-12 text-base font-semibold"
                  >
                    Sign In
                  </Button>
                </form>

                {/* Demo Credentials */}
                <div className="mt-6 pt-6 border-t border-zinc-200">
                  <p className="text-xs text-center text-zinc-500 mb-2">
                    Demo Credentials:
                  </p>
                  <p className="text-xs text-center text-zinc-600 font-mono">
                    admin / admin123
                  </p>
                  <p className="text-xs text-center text-zinc-600 font-mono">
                    engineer / engineer123
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Feature Buttons - Big and Centered when authenticated */
            <div className="w-full max-w-4xl">
              <h2 className="text-3xl font-bold text-zinc-900 mb-8 text-center">
                Available Features
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {/* Inspection Module - Primary Feature */}
                <button
                  onClick={() => handleModuleClick("inspection")}
                  className="bg-white border-2 border-zinc-900 rounded-xl p-8 shadow-lg hover:bg-zinc-50 hover:scale-105 transition-all duration-300 group"
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-20 w-20 rounded-2xl bg-zinc-900 flex items-center justify-center group-hover:bg-zinc-800 transition-colors">
                      <ClipboardList className="h-10 w-10 text-white" />
                    </div>
                    <span className="text-lg font-bold text-zinc-900">
                      Start Inspection
                    </span>
                  </div>
                </button>

                {/* Other Modules */}
                {[
                  { icon: FileCheck, label: "Snag Library", key: "library" },
                  { icon: Users, label: "Staff Metrics", key: "metrics" },
                  { icon: BarChart3, label: "Analytics", key: "analytics" },
                  { icon: Database, label: "Reports", key: "reports" },
                  { icon: LogOut, label: "Settings", key: "settings" },
                ].map(({ icon: Icon, label, key }) => (
                  <button
                    key={key}
                    onClick={() => handleModuleClick(key)}
                    className="bg-white border-2 border-zinc-800 rounded-xl p-8 shadow-lg hover:bg-zinc-50 hover:scale-105 transition-all duration-300 group"
                  >
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-20 w-20 rounded-2xl bg-zinc-900 flex items-center justify-center group-hover:bg-zinc-800 transition-colors">
                        <Icon className="h-10 w-10 text-white" />
                      </div>
                      <span className="text-lg font-bold text-zinc-900">
                        {label}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="border-t border-zinc-300 bg-white/95 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-center gap-4 text-xs text-zinc-500 font-mono">
              <span>Punchly Snagging System v1.0</span>
              <span>·</span>
              <span>Phase 2: {isAuthenticated ? 'Authenticated' : 'Authentication'}</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
