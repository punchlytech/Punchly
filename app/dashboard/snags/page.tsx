"use client";

import { useAuth } from "@/lib/context/auth-context";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardFooter } from "@/components/dashboard/dashboard-footer";
import { SnagSearch } from "@/components/snags/snag-search";
import { SnagList } from "@/components/snags/snag-list";
import { BulkActions } from "@/components/snags/bulk-actions";
import {
  getProjectsWithSnagCounts,
  getSnagsByProject,
} from "@/lib/actions/snags";
import { ArrowLeft, ClipboardList, ChevronDown, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ProjectFolder {
  id: string;
  name: string;
  snag_count: number;
  unit_count: number;
  latest_activity: string | null;
}

interface SnagRow {
  id: string;
  title: string;
  description: string;
  location: string;
  status: string;
  priority: string;
  category: string;
  photo_url: string | null;
  annotated_photo_url: string | null;
  created_at: string;
  units?: { unit_number: string; unit_type: string; floor?: string } | null;
}

export default function SnagsLibraryPage() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();

  const [projects, setProjects] = useState<ProjectFolder[]>([]);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [snags, setSnags] = useState<SnagRow[]>([]);
  const [filteredSnags, setFilteredSnags] = useState<SnagRow[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingSnags, setLoadingSnags] = useState(false);
  const [selectedSnagIds, setSelectedSnagIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const isManager = user?.role === "manager";

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/");
    }
  }, [loading, isAuthenticated, router]);

  // Fetch projects on mount
  useEffect(() => {
    async function fetchProjects() {
      try {
        const data = await getProjectsWithSnagCounts();
        setProjects(data as ProjectFolder[]);
      } catch {
        // Silently fail
      } finally {
        setLoadingProjects(false);
      }
    }
    fetchProjects();
  }, []);

  // Fetch snags when a project is expanded
  const toggleProject = async (projectId: string) => {
    if (expandedProject === projectId) {
      setExpandedProject(null);
      setSnags([]);
      setFilteredSnags([]);
      setSelectedSnagIds([]);
      setSearchQuery("");
      return;
    }

    setExpandedProject(projectId);
    setLoadingSnags(true);
    setSelectedSnagIds([]);
    setSearchQuery("");

    try {
      const data = await getSnagsByProject(projectId);
      setSnags(data as SnagRow[]);
      setFilteredSnags(data as SnagRow[]);
    } catch {
      setSnags([]);
      setFilteredSnags([]);
    } finally {
      setLoadingSnags(false);
    }
  };

  // Filter snags by search query
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredSnags(snags);
      return;
    }

    const lower = query.toLowerCase();
    const filtered = snags.filter(
      (s) =>
        s.title?.toLowerCase().includes(lower) ||
        s.location?.toLowerCase().includes(lower) ||
        s.description?.toLowerCase().includes(lower) ||
        s.units?.unit_number?.toLowerCase().includes(lower)
    );
    setFilteredSnags(filtered);
  };

  const handleBulkCloseSuccess = () => {
    setSelectedSnagIds([]);
    // Re-fetch snags for the expanded project
    if (expandedProject) {
      toggleProject(expandedProject);
      // Re-expand after refresh
      setTimeout(() => toggleProject(expandedProject), 100);
    }
  };

  if (loading || !isAuthenticated || !user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-punchly-bg">
      <DashboardHeader user={user} onLogout={() => { logout(); router.push("/"); }} />

      <main className="flex-1 py-8 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Back + Title */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 text-sm text-punchly-text-secondary hover:text-punchly-navy transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </button>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-punchly-navy mb-2">
              Snags Library
            </h1>
            <p className="text-punchly-text-secondary">
              Organized by project. Tap a folder to view snags.
            </p>
          </div>

          {/* Project Folders */}
          {loadingProjects ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-5 bg-white border border-punchly-border rounded-lg animate-pulse"
                >
                  <div className="h-10 w-10 bg-gray-200 rounded-lg mb-3" />
                  <div className="h-5 w-32 bg-gray-200 rounded mb-2" />
                  <div className="h-4 w-20 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-16 bg-white border border-punchly-border rounded-lg">
              <ClipboardList className="h-12 w-12 text-punchly-text-secondary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-punchly-navy mb-2">
                No Projects Yet
              </h3>
              <p className="text-punchly-text-secondary">
                Start an inspection to create your first project.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <div key={project.id}>
                  {/* Folder Card */}
                  <button
                    onClick={() => toggleProject(project.id)}
                    className={`w-full p-5 text-left transition-all duration-200 bg-white border rounded-lg ${
                      expandedProject === project.id
                        ? "border-punchly-blue shadow-sm"
                        : "border-punchly-border hover:border-punchly-blue"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 flex items-center justify-center bg-punchly-blue/10 rounded-lg">
                          <ClipboardList className="h-5 w-5 text-punchly-blue" strokeWidth={2} />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-punchly-navy">
                            {project.name}
                          </h3>
                          <p className="text-xs text-punchly-text-secondary">
                            {project.unit_count} units &middot; {project.snag_count} snags
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs px-2 py-1 rounded bg-punchly-issue/15 text-punchly-issue font-medium">
                          {project.snag_count} snags
                        </span>
                        {expandedProject === project.id ? (
                          <ChevronDown className="h-5 w-5 text-punchly-text-secondary" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-punchly-text-secondary" />
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Expanded Snag List */}
                  {expandedProject === project.id && (
                    <div className="mt-2 ml-4 pl-4 border-l-2 border-punchly-blue/20">
                      {/* Search */}
                      <SnagSearch
                        query={searchQuery}
                        onChange={handleSearch}
                        totalCount={snags.length}
                        filteredCount={filteredSnags.length}
                      />

                      {/* Snag List */}
                      {loadingSnags ? (
                        <div className="py-8 text-center text-punchly-text-secondary text-sm">
                          Loading snags...
                        </div>
                      ) : filteredSnags.length === 0 ? (
                        <div className="py-8 text-center text-punchly-text-secondary text-sm">
                          {searchQuery ? "No snags match your search." : "No snags in this project yet."}
                        </div>
                      ) : (
                        <SnagList
                          snags={filteredSnags}
                          selectedIds={selectedSnagIds}
                          onSelectionChange={setSelectedSnagIds}
                          showCheckboxes={!!isManager}
                        />
                      )}

                      {/* Bulk Actions */}
                      {isManager && selectedSnagIds.length > 0 && (
                        <BulkActions
                          selectedIds={selectedSnagIds}
                          onSuccess={handleBulkCloseSuccess}
                          onCancel={() => setSelectedSnagIds([])}
                        />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <DashboardFooter />
    </div>
  );
}
