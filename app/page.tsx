"use client";

import { useAuth } from "@/lib/context/auth-context";
import {
  ArrowRight,
  BarChart3,
  Check,
  CheckSquare,
  FileCheck,
  Scan,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Brand Colors from Punchly Brand Kit
const colors = {
  primaryNavy: "#0B3C5D",
  primaryBlue: "#1F6FA3",
  backgroundLight: "#F7F9FB",
  surface: "#FFFFFF",
  border: "#E1E6EB",
  primaryText: "#1A1A1A",
  secondaryText: "#5A6977",
  success: "#2E7D32",
  warning: "#F9A825",
  issue: "#EF6C00",
  critical: "#C62828",
};

export default function Home() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const success = login(username, password);
    if (success) {
      router.push("/dashboard");
    } else {
      setError("Invalid credentials");
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col animate-fade-in"
      style={{ backgroundColor: colors.backgroundLight }}
    >
      {/* CSS for animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 500ms ease-out forwards;
        }
      `}</style>

      {/* Header - Solid Primary Navy */}
      <header
        className="sticky top-0 z-50"
        style={{ backgroundColor: colors.primaryNavy }}
      >
        <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
          {/* Logo - 20% larger with industrial typography */}
          <div className="flex items-center gap-4">
            <div
              className="h-12 w-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: colors.surface }}
            >
              <CheckSquare
                className="h-7 w-7"
                style={{ color: colors.primaryNavy }}
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

        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
            {/* Hero Section - Tighter spacing */}
            <section className="py-12 lg:py-16 px-8">
              <div className="max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-start">
                  {/* Left Column: Bold Technical Headline (3/5) */}
                  <div className="lg:col-span-3 pt-4">
                    <h1
                      className="text-4xl lg:text-5xl xl:text-6xl font-semibold leading-tight mb-6"
                      style={{ color: colors.primaryNavy }}
                    >
                      The Operating System for Unit Handovers
                    </h1>

                    <p
                      className="text-lg lg:text-xl leading-relaxed max-w-2xl"
                      style={{ color: colors.secondaryText }}
                    >
                      Execute, verify, and deliver site work with discipline and clarity.
                      The execution layer between site reality and developer expectations.
                    </p>
                  </div>

                  {/* Right Column: Sign In Portal (2/5) */}
                  <div className="lg:col-span-2">
                    <div
                      className="p-8"
                      style={{
                        backgroundColor: colors.surface,
                        border: `1px solid ${colors.border}`,
                        borderRadius: "8px",
                      }}
                    >
                      <div className="mb-6">
                        <h2
                          className="text-xl font-semibold mb-2"
                          style={{ color: colors.primaryNavy }}
                        >
                          Sign In
                        </h2>
                        <p
                          className="text-sm"
                          style={{ color: colors.secondaryText }}
                        >
                          Access your workspace
                        </p>
                      </div>

                      <form onSubmit={handleSignIn} className="space-y-4">
                        <div>
                          <label
                            className="block text-xs font-medium mb-2"
                            style={{ color: colors.primaryText }}
                          >
                            Username
                          </label>
                          <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full h-12 px-4 text-sm focus:outline-none transition-all"
                            style={{
                              backgroundColor: colors.backgroundLight,
                              border: `1px solid ${colors.border}`,
                              borderRadius: "6px",
                              color: colors.primaryText,
                            }}
                            onFocus={(e) => {
                              e.target.style.borderColor = colors.primaryBlue;
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = colors.border;
                            }}
                            placeholder="Enter username"
                            required
                          />
                        </div>

                        <div>
                          <label
                            className="block text-xs font-medium mb-2"
                            style={{ color: colors.primaryText }}
                          >
                            Password
                          </label>
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full h-12 px-4 text-sm focus:outline-none transition-all"
                            style={{
                              backgroundColor: colors.backgroundLight,
                              border: `1px solid ${colors.border}`,
                              borderRadius: "6px",
                              color: colors.primaryText,
                            }}
                            onFocus={(e) => {
                              e.target.style.borderColor = colors.primaryBlue;
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = colors.border;
                            }}
                            placeholder="Enter password"
                            required
                          />
                        </div>

                        {error && (
                          <div
                            className="flex items-center gap-2 text-sm px-4 py-3"
                            style={{
                              backgroundColor: "#FEF2F2",
                              border: `1px solid ${colors.critical}`,
                              borderRadius: "6px",
                              color: colors.critical,
                            }}
                          >
                            {error}
                          </div>
                        )}

                        <button
                          type="submit"
                          className="w-full h-12 flex items-center justify-center gap-2 text-sm font-semibold text-white transition-all duration-200"
                          style={{
                            backgroundColor: isButtonHovered
                              ? colors.primaryBlue
                              : colors.primaryNavy,
                            borderRadius: "6px",
                          }}
                          onMouseEnter={() => setIsButtonHovered(true)}
                          onMouseLeave={() => setIsButtonHovered(false)}
                        >
                          Sign In
                          <ArrowRight className="h-4 w-4" strokeWidth={2} />
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Four-Quadrant Feature Grid */}
            <section
              className="py-16 px-8"
              style={{ backgroundColor: colors.surface }}
            >
              <div className="max-w-7xl mx-auto">
                {/* Section Header with Underline */}
                <div className="text-center mb-12">
                  <h2
                    className="text-2xl font-bold inline-block"
                    style={{ color: colors.primaryNavy }}
                  >
                    How It Works
                  </h2>
                  {/* 40px Primary Blue underline */}
                  <div
                    className="mx-auto mt-3"
                    style={{
                      width: "40px",
                      height: "2px",
                      backgroundColor: colors.primaryBlue,
                    }}
                  />
                </div>

                {/* Four-Quadrant Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    {
                      icon: Scan,
                      step: "01",
                      title: "Inspect",
                      desc: "Technical unit visits with intelligent snag capture and developer-standard photo annotation.",
                    },
                    {
                      icon: Users,
                      step: "02",
                      title: "Manage",
                      desc: "Real-time task assignment for internal teams, internal workflows, and resolution tracking.",
                    },
                    {
                      icon: BarChart3,
                      step: "03",
                      title: "Analyze",
                      desc: "Performance metrics, KPI dashboards, and internal quality aging reports.",
                    },
                    {
                      icon: FileCheck,
                      step: "04",
                      title: "Deliver",
                      desc: "Professional-grade handover reports with digital sign-off and historical audit trails.",
                    },
                  ].map((feature) => (
                    <div
                      key={feature.step}
                      className="group p-6 cursor-default transition-all duration-300 ease-out"
                      style={{
                        backgroundColor: colors.surface,
                        border: `1px solid ${colors.border}`,
                        borderRadius: "8px",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-4px)";
                        e.currentTarget.style.borderColor = colors.primaryBlue;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.borderColor = colors.border;
                      }}
                    >
                      {/* Icon - Primary Blue with 2.5px stroke */}
                      <div className="flex items-start justify-between mb-5">
                        <div
                          className="h-14 w-14 flex items-center justify-center"
                          style={{
                            backgroundColor: `${colors.primaryBlue}10`,
                            border: `1px solid ${colors.primaryBlue}25`,
                            borderRadius: "8px",
                          }}
                        >
                          <feature.icon
                            className="h-7 w-7"
                            style={{ color: colors.primaryBlue }}
                            strokeWidth={2.5}
                          />
                        </div>
                        <span
                          className="text-xs font-semibold"
                          style={{ color: colors.border }}
                        >
                          {feature.step}
                        </span>
                      </div>

                      <h3
                        className="text-lg font-semibold mb-2"
                        style={{ color: colors.primaryNavy }}
                      >
                        {feature.title}
                      </h3>
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: colors.secondaryText }}
                      >
                        {feature.desc}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Platform Capabilities Bar */}
                <div
                  className="mt-12 py-5 px-6 rounded-lg"
                  style={{
                    backgroundColor: colors.backgroundLight,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12">
                    {[
                      "Professional Reporting",
                      "Offline Sync",
                      "End-to-End Security",
                    ].map((capability) => (
                      <div
                        key={capability}
                        className="flex items-center gap-2"
                      >
                        <div
                          className="h-5 w-5 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: `${colors.success}15` }}
                        >
                          <Check
                            className="h-3 w-3"
                            style={{ color: colors.success }}
                            strokeWidth={3}
                          />
                        </div>
                        <span
                          className="text-sm font-medium"
                          style={{ color: colors.primaryText }}
                        >
                          {capability}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
      </main>

      {/* Footer - Clean and minimal */}
      <footer
        className="border-t mt-auto"
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
        }}
      >
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center gap-3">
            <div
              className="h-6 w-6 rounded flex items-center justify-center"
              style={{ backgroundColor: colors.primaryNavy }}
            >
              <CheckSquare className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span
              className="text-xs font-semibold"
              style={{ color: colors.primaryNavy, letterSpacing: "2px" }}
            >
              PUNCHLY
            </span>
            <span
              className="text-xs"
              style={{ color: colors.secondaryText }}
            >
              v1.0.0
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
