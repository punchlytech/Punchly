"use client";

import { Button } from "@/components/ui/button";
import { PunchlyWordmark } from "@/components/brand/logo";
import { SnagAnnotator } from "@/components/inspection/snag-annotator";
import { useAuth } from "@/lib/context/auth-context";
import { useInspectionDraft } from "@/lib/hooks/use-inspection-draft";
import { submitInspection } from "@/lib/actions/inspection";
import { toTitleCase, getCurrentDate } from "@/lib/utils/formatters";
import { generateSnagPDF } from "@/lib/utils/pdf-generator";
import {
  ArrowLeft,
  Camera,
  Upload,
  Plus,
  X,
  Trash2,
  Pencil,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef, useCallback, Suspense } from "react";

interface SnagPhoto {
  id: string;
  file: File | null;
  preview: string;
  annotatedPreview?: string;
}

interface SnagLocation {
  id: string;
  location: string;
  description: string;
  photos: SnagPhoto[];
}

function SnagCapturePageContent() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const inspectionId = searchParams.get("id");
  const projectName = searchParams.get("project") || "";
  const unitNumber = searchParams.get("unit") || "";
  const clientName = searchParams.get("client") || "N/A";

  const { save: saveDraft, clear: clearDraft } =
    useInspectionDraft(inspectionId);

  const [snagLocations, setSnagLocations] = useState<SnagLocation[]>([
    { id: "1", location: "", description: "", photos: [] },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Annotation state
  const [annotatingPhoto, setAnnotatingPhoto] = useState<{
    locationId: string;
    photoId: string;
    src: string;
  } | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [authLoading, isAuthenticated, router]);

  // Auto-save to IndexedDB on location changes
  const debouncedSave = useCallback(() => {
    if (!inspectionId) return;
    saveDraft({
      id: inspectionId,
      projectName,
      unitNumber,
      clientName,
      inspectionDate: getCurrentDate(),
      engineerName: user?.fullName || "Unknown",
      locations: snagLocations.map((loc) => ({
        id: loc.id,
        location: loc.location,
        description: loc.description,
        photos: loc.photos.map((p) => ({
          id: p.id,
          blob: null,
          preview: p.preview,
          annotatedPreview: p.annotatedPreview,
        })),
      })),
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }, [inspectionId, projectName, unitNumber, clientName, user, snagLocations, saveDraft]);

  useEffect(() => {
    debouncedSave();
  }, [snagLocations, debouncedSave]);

  // ─── Handlers ──────────────────────────────────────────────────────

  const handleLocationChange = (id: string, value: string) => {
    const formatted = toTitleCase(value);
    setSnagLocations((prev) =>
      prev.map((loc) => (loc.id === id ? { ...loc, location: formatted } : loc))
    );
  };

  const handleDescriptionChange = (id: string, value: string) => {
    const lines = value.split("\n");
    const formatted = lines
      .map((line) => {
        const withoutNumber = line.replace(/^\d+\.\s*/, "");
        if (withoutNumber.length > 0) {
          return withoutNumber.charAt(0).toUpperCase() + withoutNumber.slice(1);
        }
        return line;
      })
      .join("\n");

    setSnagLocations((prev) =>
      prev.map((loc) =>
        loc.id === id ? { ...loc, description: formatted } : loc
      )
    );
  };

  const handleDescriptionKeyDown = (
    id: string,
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const textarea = e.currentTarget;
      const currentValue = textarea.value;
      const newValue = currentValue + "\n";

      setSnagLocations((prev) =>
        prev.map((loc) =>
          loc.id === id ? { ...loc, description: newValue } : loc
        )
      );

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = newValue.length;
      }, 0);
    }
  };

  const handleDescriptionBlur = (id: string) => {
    setSnagLocations((prev) =>
      prev.map((loc) => {
        if (loc.id === id) {
          const lines = loc.description
            .split("\n")
            .filter((line) => line.trim() !== "");

          if (lines.length >= 2) {
            const numbered = lines
              .map((line, index) => {
                const withoutNumber = line.replace(/^\d+\.\s*/, "");
                return `${index + 1}. ${withoutNumber}`;
              })
              .join("\n");
            return { ...loc, description: numbered };
          } else if (lines.length === 1) {
            const withoutNumber = lines[0].replace(/^\d+\.\s*/, "");
            return { ...loc, description: withoutNumber };
          }
        }
        return loc;
      })
    );
  };

  const addNewLocation = () => {
    setSnagLocations((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        location: "",
        description: "",
        photos: [],
      },
    ]);
  };

  const removeLocation = (id: string) => {
    if (snagLocations.length > 1) {
      setSnagLocations((prev) => prev.filter((loc) => loc.id !== id));
    }
  };

  const handleCameraCapture = (locationId: string) => {
    fileInputRefs.current[locationId]?.click();
  };

  const handleFileSelect = (
    locationId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPhoto: SnagPhoto = {
          id: Math.random().toString(36).substr(2, 9),
          file,
          preview: reader.result as string,
        };

        setSnagLocations((prev) =>
          prev.map((loc) =>
            loc.id === locationId
              ? { ...loc, photos: [...loc.photos, newPhoto] }
              : loc
          )
        );
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRefs.current[locationId]) {
      fileInputRefs.current[locationId]!.value = "";
    }
  };

  const removePhoto = (locationId: string, photoId: string) => {
    setSnagLocations((prev) =>
      prev.map((loc) =>
        loc.id === locationId
          ? { ...loc, photos: loc.photos.filter((p) => p.id !== photoId) }
          : loc
      )
    );
  };

  // ─── Annotation Handlers ──────────────────────────────────────────

  const openAnnotator = (locationId: string, photo: SnagPhoto) => {
    setAnnotatingPhoto({
      locationId,
      photoId: photo.id,
      src: photo.annotatedPreview || photo.preview,
    });
  };

  const handleAnnotationSave = (annotatedDataUrl: string) => {
    if (!annotatingPhoto) return;

    setSnagLocations((prev) =>
      prev.map((loc) =>
        loc.id === annotatingPhoto.locationId
          ? {
              ...loc,
              photos: loc.photos.map((p) =>
                p.id === annotatingPhoto.photoId
                  ? { ...p, annotatedPreview: annotatedDataUrl }
                  : p
              ),
            }
          : loc
      )
    );

    setAnnotatingPhoto(null);
  };

  // ─── Submit ────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    const validLocations = snagLocations.filter(
      (loc) => loc.location.trim() !== "" || loc.description.trim() !== ""
    );

    if (validLocations.length === 0) {
      alert("Please add at least one location with details");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      // 1. Persist to Supabase
      const result = await submitInspection({
        projectName,
        unitNumber,
        clientName,
        inspectionDate: getCurrentDate(),
        engineerName: user?.fullName || "Unknown",
        locations: validLocations.map((loc) => ({
          location: loc.location,
          description: loc.description,
          photos: loc.photos.map((p) => ({
            base64: p.preview,
            annotatedBase64: p.annotatedPreview,
          })),
        })),
      });

      if (!result.success) {
        console.error("Supabase submission error:", result.error);
        // Continue with PDF generation even if Supabase fails
      }

      // 2. Generate PDF
      await generateSnagPDF({
        projectName,
        unitNumber,
        clientName,
        inspectionDate: getCurrentDate(),
        engineerName: user?.fullName || "Unknown",
        locations: validLocations.map((loc) => ({
          location: loc.location,
          description: loc.description,
          photos: loc.photos.map((p) => ({
            preview: p.preview,
            annotatedPreview: p.annotatedPreview,
          })),
        })),
      });

      // 3. Clear IndexedDB draft
      await clearDraft();

      // 4. Show success
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting inspection:", error);
      setSubmitError("Failed to submit inspection. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || !isAuthenticated) {
    return null;
  }

  // ─── Success Screen ───────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-punchly-bg flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white border border-punchly-border rounded-lg p-8 text-center">
          <div className="h-16 w-16 rounded-full bg-punchly-success/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-punchly-success" strokeWidth={2} />
          </div>
          <h2 className="text-2xl font-semibold text-punchly-navy mb-2">
            Inspection Submitted
          </h2>
          <p className="text-punchly-text-secondary mb-6">
            Your snag report has been saved and the PDF has been generated.
          </p>
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => router.push("/inspection/setup")}
              className="w-full h-12 bg-punchly-navy hover:bg-punchly-navy/90"
            >
              Start New Inspection
            </Button>
            <Button
              onClick={() => router.push("/dashboard")}
              variant="outline"
              className="w-full h-12"
            >
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main Capture UI ──────────────────────────────────────────────
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
                onClick={() => router.back()}
                className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <PunchlyWordmark />
              <div className="text-xs text-zinc-600">{user?.fullName}</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
          {/* Project Info */}
          <div className="mb-6 bg-zinc-50 border border-zinc-300 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-zinc-600">Project:</span>
                <p className="font-semibold text-zinc-900">{projectName}</p>
              </div>
              <div>
                <span className="text-zinc-600">Unit:</span>
                <p className="font-semibold text-zinc-900">{unitNumber}</p>
              </div>
            </div>
          </div>

          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-zinc-900 mb-2">Snags</h1>
            <p className="text-sm text-zinc-600">
              Document issues with location details and optional photos. Tap a
              photo to annotate it.
            </p>
          </div>

          {/* Snag Locations */}
          <div className="space-y-6 mb-6">
            {snagLocations.map((snagLoc, index) => (
              <div
                key={snagLoc.id}
                className="bg-white border-2 border-zinc-800 rounded-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-zinc-900">
                    Location {index + 1}
                  </h3>
                  {snagLocations.length > 1 && (
                    <button
                      onClick={() => removeLocation(snagLoc.id)}
                      className="text-red-600 hover:text-red-800 flex items-center gap-1 text-sm"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Location Input */}
                  <div>
                    <label className="text-sm font-semibold text-zinc-900 mb-2 block">
                      Location
                      <span className="text-xs text-zinc-500 font-normal ml-2">
                        (Auto Title Case)
                      </span>
                    </label>
                    <input
                      type="text"
                      value={snagLoc.location}
                      onChange={(e) =>
                        handleLocationChange(snagLoc.id, e.target.value)
                      }
                      placeholder="e.g., Living Room, Master Bedroom"
                      className="w-full h-12 px-4 border-2 border-zinc-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent bg-white"
                    />
                  </div>

                  {/* Description Input */}
                  <div>
                    <label className="text-sm font-semibold text-zinc-900 mb-2 block">
                      Description
                      <span className="text-xs text-zinc-500 font-normal ml-2">
                        (2+ items auto-numbered)
                      </span>
                    </label>
                    <textarea
                      value={snagLoc.description}
                      onChange={(e) =>
                        handleDescriptionChange(snagLoc.id, e.target.value)
                      }
                      onKeyDown={(e) =>
                        handleDescriptionKeyDown(snagLoc.id, e)
                      }
                      onBlur={() => handleDescriptionBlur(snagLoc.id)}
                      placeholder="Wall defect"
                      rows={5}
                      className="w-full px-4 py-3 border-2 border-zinc-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent bg-white"
                    />
                  </div>

                  {/* Photos Section */}
                  <div>
                    <label className="text-sm font-semibold text-zinc-900 mb-2 block">
                      Photos{" "}
                      <span className="text-xs text-zinc-500 font-normal">
                        (Optional — tap to annotate)
                      </span>
                    </label>

                    {/* Hidden File Input */}
                    <input
                      ref={(el) => {
                        fileInputRefs.current[snagLoc.id] = el;
                      }}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      multiple
                      onChange={(e) => handleFileSelect(snagLoc.id, e)}
                      className="hidden"
                    />

                    {/* Photo Buttons */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <Button
                        type="button"
                        onClick={() => handleCameraCapture(snagLoc.id)}
                        className="h-12 bg-zinc-900 hover:bg-zinc-800"
                      >
                        <Camera className="mr-2 h-4 w-4" />
                        Take Photo
                      </Button>
                      <Button
                        type="button"
                        onClick={() => handleCameraCapture(snagLoc.id)}
                        variant="outline"
                        className="h-12"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Photo
                      </Button>
                    </div>

                    {/* Photo Thumbnails — tap to annotate */}
                    {snagLoc.photos.length > 0 && (
                      <div className="grid grid-cols-3 gap-3">
                        {snagLoc.photos.map((photo) => (
                          <div key={photo.id} className="relative group">
                            <img
                              src={photo.annotatedPreview || photo.preview}
                              alt="Snag"
                              className="w-full h-24 object-cover rounded-lg border-2 border-zinc-300 cursor-pointer"
                              onClick={() =>
                                openAnnotator(snagLoc.id, photo)
                              }
                            />
                            {/* Annotate badge */}
                            <button
                              onClick={() =>
                                openAnnotator(snagLoc.id, photo)
                              }
                              className="absolute bottom-1 left-1 bg-punchly-critical text-white p-1 rounded text-xs flex items-center gap-0.5"
                              title="Annotate photo"
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                            {/* Annotated indicator */}
                            {photo.annotatedPreview && (
                              <div className="absolute top-1 left-1 bg-punchly-success text-white px-1.5 py-0.5 rounded text-[10px] font-medium">
                                Annotated
                              </div>
                            )}
                            {/* Remove button */}
                            <button
                              onClick={() =>
                                removePhoto(snagLoc.id, photo.id)
                              }
                              className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Location Button */}
          <Button
            type="button"
            onClick={addNewLocation}
            variant="outline"
            className="w-full h-12 mb-6 border-2 border-dashed border-zinc-400 hover:border-zinc-900"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add Another Location
          </Button>

          {/* Error Message */}
          {submitError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {submitError}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1 h-12"
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              className="flex-1 h-12 bg-zinc-900 hover:bg-zinc-800 text-base font-semibold"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit All Snags"
              )}
            </Button>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-zinc-300 bg-white/95 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-center gap-4 text-xs text-zinc-500 font-mono">
              <span>Snag Documentation</span>
              <span>&middot;</span>
              <span>Step 2 of 3</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Canvas Annotation Modal */}
      {annotatingPhoto && (
        <SnagAnnotator
          photoSrc={annotatingPhoto.src}
          onSave={handleAnnotationSave}
          onCancel={() => setAnnotatingPhoto(null)}
        />
      )}
    </div>
  );
}

export default function SnagCapturePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-zinc-900 border-r-transparent" />
            <p className="mt-4 text-sm text-zinc-600">Loading...</p>
          </div>
        </div>
      }
    >
      <SnagCapturePageContent />
    </Suspense>
  );
}
