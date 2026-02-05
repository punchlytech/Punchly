"use client";

import { Button } from "@/components/ui/button";
import { PunchlyWordmark } from "@/components/brand/logo";
import { useAuth } from "@/lib/context/auth-context";
import { toTitleCase, getCurrentDate } from "@/lib/utils/formatters";
import { generateSnagPDF } from "@/lib/utils/pdf-generator";
import { ArrowLeft, Camera, Upload, Plus, X, Trash2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";

interface SnagLocation {
  id: string;
  location: string;
  description: string;
  photos: SnagPhoto[];
}

interface SnagPhoto {
  id: string;
  file: File;
  preview: string;
}

export default function SnagCapturePage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const projectName = searchParams.get("project") || "";
  const unitNumber = searchParams.get("unit") || "";
  const clientName = searchParams.get("client") || "N/A";

  const [snagLocations, setSnagLocations] = useState<SnagLocation[]>([
    { id: "1", location: "", description: "", photos: [] },
  ]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const handleLocationChange = (id: string, value: string) => {
    const formatted = toTitleCase(value);
    setSnagLocations((prev) =>
      prev.map((loc) => (loc.id === id ? { ...loc, location: formatted } : loc))
    );
  };

  const handleDescriptionChange = (id: string, value: string) => {
    // Capitalize first letter of each line
    const lines = value.split("\n");
    const formatted = lines
      .map((line) => {
        // Remove any existing numbering to process fresh
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

      // Just add a new line, don't add numbering yet
      const newValue = currentValue + "\n";

      setSnagLocations((prev) =>
        prev.map((loc) =>
          loc.id === id ? { ...loc, description: newValue } : loc
        )
      );

      // Set cursor position
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = newValue.length;
      }, 0);
    }
  };

  const handleDescriptionBlur = (id: string) => {
    // Add numbering only if there are 2+ lines
    setSnagLocations((prev) =>
      prev.map((loc) => {
        if (loc.id === id) {
          const lines = loc.description.split("\n").filter((line) => line.trim() !== "");

          if (lines.length >= 2) {
            // Add numbering
            const numbered = lines
              .map((line, index) => {
                const withoutNumber = line.replace(/^\d+\.\s*/, "");
                return `${index + 1}. ${withoutNumber}`;
              })
              .join("\n");
            return { ...loc, description: numbered };
          } else if (lines.length === 1) {
            // Remove any numbering for single line
            const withoutNumber = lines[0].replace(/^\d+\.\s*/, "");
            return { ...loc, description: withoutNumber };
          }
        }
        return loc;
      })
    );
  };

  const formatDescriptionLine = (id: string, value: string) => {
    const lines = value.split("\n");
    const formattedLines = lines.map((line, index) => {
      // Check if line starts with a number pattern like "1. " or "2. "
      const match = line.match(/^(\d+\.\s*)(.*)/);
      if (match) {
        const number = match[1];
        const text = match[2];
        // Capitalize first letter of the text after the number
        const capitalizedText = text.charAt(0).toUpperCase() + text.slice(1);
        return number + capitalizedText;
      }
      // If first line and doesn't have number, add "1. " and capitalize
      if (index === 0 && line.trim() !== "") {
        const capitalizedLine = line.charAt(0).toUpperCase() + line.slice(1);
        return capitalizedLine.startsWith("1. ") ? capitalizedLine : `1. ${capitalizedLine}`;
      }
      return line;
    });

    setSnagLocations((prev) =>
      prev.map((loc) =>
        loc.id === id ? { ...loc, description: formattedLines.join("\n") } : loc
      )
    );
  };

  const addNewLocation = () => {
    const newLocation: SnagLocation = {
      id: Date.now().toString(),
      location: "",
      description: "",
      photos: [],
    };
    setSnagLocations((prev) => [...prev, newLocation]);
  };

  const removeLocation = (id: string) => {
    if (snagLocations.length > 1) {
      setSnagLocations((prev) => prev.filter((loc) => loc.id !== id));
    }
  };

  const handleCameraCapture = (locationId: string) => {
    if (fileInputRefs.current[locationId]) {
      fileInputRefs.current[locationId]?.click();
    }
  };

  const handleFileSelect = (locationId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newPhotos: SnagPhoto[] = [];
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPhoto: SnagPhoto = {
          id: Math.random().toString(36).substr(2, 9),
          file,
          preview: reader.result as string,
        };
        newPhotos.push(newPhoto);

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

  const handleSubmit = async () => {
    // Filter out empty locations
    const validLocations = snagLocations.filter(
      (loc) => loc.location.trim() !== "" || loc.description.trim() !== ""
    );

    if (validLocations.length === 0) {
      alert("Please add at least one location with details");
      return;
    }

    // Generate PDF
    try {
      await generateSnagPDF({
        projectName,
        unitNumber,
        clientName,
        inspectionDate: getCurrentDate(),
        engineerName: user?.fullName || "Unknown",
        locations: validLocations.map((loc) => ({
          location: loc.location,
          description: loc.description,
          photos: loc.photos,
        })),
      });

      // TODO: Upload to Supabase Storage and create snag records
      console.log("PDF generated successfully");

      // Show success message
      alert("PDF Report generated successfully!");
      router.push("/");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    }
  };

  if (!isAuthenticated) {
    return null;
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
            <h1 className="text-3xl font-bold text-zinc-900 mb-2">
              Snags
            </h1>
            <p className="text-sm text-zinc-600">
              Document issues with location details and optional photos
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
                      onKeyDown={(e) => handleDescriptionKeyDown(snagLoc.id, e)}
                      onBlur={() => handleDescriptionBlur(snagLoc.id)}
                      placeholder="Wall defect"
                      rows={5}
                      className="w-full px-4 py-3 border-2 border-zinc-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent bg-white"
                    />
                  </div>

                  {/* Photos Section */}
                  <div>
                    <label className="text-sm font-semibold text-zinc-900 mb-2 block">
                      Photos <span className="text-xs text-zinc-500 font-normal">(Optional)</span>
                    </label>

                    {/* Hidden File Input */}
                    <input
                      ref={(el) => (fileInputRefs.current[snagLoc.id] = el)}
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

                    {/* Photo Thumbnails */}
                    {snagLoc.photos.length > 0 && (
                      <div className="grid grid-cols-3 gap-3">
                        {snagLoc.photos.map((photo) => (
                          <div key={photo.id} className="relative group">
                            <img
                              src={photo.preview}
                              alt="Snag"
                              className="w-full h-24 object-cover rounded-lg border-2 border-zinc-300"
                            />
                            <button
                              onClick={() => removePhoto(snagLoc.id, photo.id)}
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

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1 h-12"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              className="flex-1 h-12 bg-zinc-900 hover:bg-zinc-800 text-base font-semibold"
            >
              Submit All Snags
            </Button>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-zinc-300 bg-white/95 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-center gap-4 text-xs text-zinc-500 font-mono">
              <span>Snag Documentation</span>
              <span>·</span>
              <span>Step 2 of 3</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
