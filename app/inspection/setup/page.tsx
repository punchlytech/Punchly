"use client";

import { Button } from "@/components/ui/button";
import { PunchlyWordmark } from "@/components/brand/logo";
import { useAuth } from "@/lib/context/auth-context";
import {
  getCurrentDate,
  formatDateForDisplay,
  toStrictUppercase,
  toTitleCase,
} from "@/lib/utils/formatters";
import { ArrowLeft, Building2, Calendar, Home, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function InspectionSetupPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  // Form state
  const [projectName, setProjectName] = useState("");
  const [unitNumber, setUnitNumber] = useState("");
  const [clientName, setClientName] = useState("");
  const [inspectionDate] = useState(getCurrentDate());

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  // Handlers with strict formatting
  const handleProjectNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = toStrictUppercase(e.target.value);
    setProjectName(formatted);
  };

  const handleUnitNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = toStrictUppercase(e.target.value);
    setUnitNumber(formatted);
  };

  const handleClientNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = toTitleCase(e.target.value);
    setClientName(formatted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Store inspection data (will be enhanced with Supabase)
    const inspectionData = {
      projectName,
      unitNumber,
      clientName,
      inspectionDate,
      engineerName: user?.fullName,
      engineerUsername: user?.username,
      createdAt: new Date().toISOString(),
    };

    console.log("Inspection Setup Data:", inspectionData);

    // Navigate to snag capture page
    router.push(`/inspection/capture?project=${encodeURIComponent(projectName)}&unit=${encodeURIComponent(unitNumber)}&client=${encodeURIComponent(clientName)}`);
  };

  if (!isAuthenticated) {
    return null; // Redirecting...
  }

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
        {/* Header */}
        <div className="border-b border-zinc-300 bg-white/95 backdrop-blur-sm py-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => router.push("/")}
                className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </button>
              <PunchlyWordmark />
              <div className="text-xs text-zinc-600">
                {user?.fullName} · {user?.role}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-zinc-900 mb-2">
              Inspection Setup
            </h1>
            <p className="text-sm text-zinc-600">
              Enter project details to begin site inspection.
            </p>
          </div>

          {/* Setup Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Form Card */}
            <div className="bg-white border-2 border-zinc-800 rounded-lg p-6 shadow-lg">
              <div className="space-y-6">
                {/* PROJECT NAME - Auto Uppercase */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-zinc-900 mb-2">
                    <Building2 className="h-4 w-4" />
                    Project Name
                    <span className="text-xs text-zinc-500 font-normal">
                      (Auto UPPERCASE)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={handleProjectNameChange}
                    placeholder="e.g., MARINA HEIGHTS TOWER A"
                    className="w-full h-12 px-4 border-2 border-zinc-300 rounded-lg text-base font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent bg-white uppercase"
                    required
                  />
                  <p className="text-xs text-zinc-500 mt-1.5">
                    ✓ All letters automatically converted to capitals
                  </p>
                </div>

                {/* UNIT NUMBER - Auto Uppercase */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-zinc-900 mb-2">
                    <Home className="h-4 w-4" />
                    Unit Number
                    <span className="text-xs text-zinc-500 font-normal">
                      (Auto UPPERCASE)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={unitNumber}
                    onChange={handleUnitNumberChange}
                    placeholder="e.g., A-101, VILLA-23"
                    className="w-full h-12 px-4 border-2 border-zinc-300 rounded-lg text-base font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent bg-white uppercase"
                    required
                  />
                  <p className="text-xs text-zinc-500 mt-1.5">
                    ✓ All letters automatically converted to capitals
                  </p>
                </div>

                {/* CLIENT NAME - Title Case */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-zinc-900 mb-2">
                    <User className="h-4 w-4" />
                    Client Name
                    <span className="text-xs text-zinc-500 font-normal">
                      (Auto Title Case)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={handleClientNameChange}
                    placeholder="e.g., Mohammed Al Hassan"
                    className="w-full h-12 px-4 border-2 border-zinc-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent bg-white"
                    required
                  />
                  <p className="text-xs text-zinc-500 mt-1.5">
                    ✓ First letter of each word capitalized automatically
                  </p>
                </div>

                {/* INSPECTION DATE */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-zinc-900 mb-2">
                    <Calendar className="h-4 w-4" />
                    Inspection Date
                  </label>
                  <input
                    type="text"
                    value={formatDateForDisplay(inspectionDate)}
                    className="w-full h-12 px-4 border-2 border-zinc-300 bg-zinc-50 rounded-lg text-base font-semibold text-zinc-700"
                    disabled
                    readOnly
                  />
                </div>

                {/* Engineer Info (Auto-filled from logged-in user) */}
                <div className="border-t border-zinc-200 pt-6">
                  <h3 className="text-sm font-semibold text-zinc-900 mb-3">
                    Inspector Details
                  </h3>
                  <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-zinc-600">Name:</span>
                        <p className="font-semibold text-zinc-900">{user?.fullName}</p>
                      </div>
                      <div>
                        <span className="text-zinc-600">Role:</span>
                        <p className="font-semibold text-zinc-900 capitalize">
                          {user?.role}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-500 mt-2">
                      This will be used as the engineer signature on the report
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/")}
                className="flex-1 h-12"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 h-12 bg-zinc-900 hover:bg-zinc-800 text-base font-semibold"
              >
                Continue
              </Button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <footer className="border-t border-zinc-300 bg-white/95 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-center gap-4 text-xs text-zinc-500 font-mono">
              <span>Inspection Setup</span>
              <span>·</span>
              <span>Step 1 of 3</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
