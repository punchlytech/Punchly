import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { LayoutDashboard, Users, FolderKanban, AlertCircle } from "lucide-react";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { count: projectCount },
    { count: snagCount },
    { count: engineerCount },
  ] = await Promise.all([
    supabase.from("projects").select("*", { count: "exact", head: true }),
    supabase.from("snags").select("*", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "engineer"),
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-slate-900 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-zinc-600">
          Manage projects, staff, and monitor snag resolution
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-600 uppercase tracking-wide mb-1">
                Total Projects
              </p>
              <p className="text-3xl font-semibold text-slate-900">
                {projectCount || 0}
              </p>
            </div>
            <FolderKanban className="h-12 w-12 text-zinc-400" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-600 uppercase tracking-wide mb-1">
                Active Snags
              </p>
              <p className="text-3xl font-semibold text-slate-900">
                {snagCount || 0}
              </p>
            </div>
            <AlertCircle className="h-12 w-12 text-zinc-400" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-600 uppercase tracking-wide mb-1">
                Engineers
              </p>
              <p className="text-3xl font-semibold text-slate-900">
                {engineerCount || 0}
              </p>
            </div>
            <Users className="h-12 w-12 text-zinc-400" />
          </div>
        </Card>
      </div>

      <div className="bg-white border-2 border-zinc-800 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          Available Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-4 bg-zinc-50 rounded-lg border border-zinc-200">
            <FolderKanban className="h-6 w-6 text-slate-900 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">Manage Projects</h3>
              <p className="text-sm text-zinc-600">Create and oversee all projects across your organization</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-zinc-50 rounded-lg border border-zinc-200">
            <LayoutDashboard className="h-6 w-6 text-slate-900 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">Manage Units</h3>
              <p className="text-sm text-zinc-600">Add and track units within each project</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-zinc-50 rounded-lg border border-zinc-200">
            <AlertCircle className="h-6 w-6 text-slate-900 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">Monitor Snags</h3>
              <p className="text-sm text-zinc-600">Track snag resolution status in real-time</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-zinc-50 rounded-lg border border-zinc-200">
            <Users className="h-6 w-6 text-slate-900 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">Manage Staff</h3>
              <p className="text-sm text-zinc-600">Assign tasks to engineers and track their progress</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
