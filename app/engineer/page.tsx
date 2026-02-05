import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { ClipboardList, CheckCircle2, Clock, AlertCircle } from "lucide-react";

export default async function EngineerDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [
    { count: totalSnags },
    { count: openSnags },
    { count: resolvedSnags },
  ] = await Promise.all([
    supabase
      .from("snags")
      .select("*", { count: "exact", head: true })
      .eq("reported_by", user!.id),
    supabase
      .from("snags")
      .select("*", { count: "exact", head: true })
      .eq("reported_by", user!.id)
      .in("status", ["open", "in_progress"]),
    supabase
      .from("snags")
      .select("*", { count: "exact", head: true })
      .eq("reported_by", user!.id)
      .eq("status", "resolved"),
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-slate-900 mb-2">
          My Dashboard
        </h1>
        <p className="text-zinc-600">
          Track your snag reports and project assignments
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-600 uppercase tracking-wide mb-1">
                Total Snags
              </p>
              <p className="text-3xl font-semibold text-slate-900">
                {totalSnags || 0}
              </p>
            </div>
            <ClipboardList className="h-12 w-12 text-zinc-400" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-600 uppercase tracking-wide mb-1">
                Open Snags
              </p>
              <p className="text-3xl font-semibold text-slate-900">
                {openSnags || 0}
              </p>
            </div>
            <Clock className="h-12 w-12 text-zinc-400" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-600 uppercase tracking-wide mb-1">
                Resolved
              </p>
              <p className="text-3xl font-semibold text-slate-900">
                {resolvedSnags || 0}
              </p>
            </div>
            <CheckCircle2 className="h-12 w-12 text-zinc-400" />
          </div>
        </Card>
      </div>

      <div className="bg-white border-2 border-zinc-800 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          Available Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-4 bg-zinc-50 rounded-lg border border-zinc-200">
            <ClipboardList className="h-6 w-6 text-slate-900 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">Log Snags</h3>
              <p className="text-sm text-zinc-600">Document issues with photos and detailed descriptions</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-zinc-50 rounded-lg border border-zinc-200">
            <Clock className="h-6 w-6 text-slate-900 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">Track Status</h3>
              <p className="text-sm text-zinc-600">Update snag status and monitor progress in real-time</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-zinc-50 rounded-lg border border-zinc-200">
            <CheckCircle2 className="h-6 w-6 text-slate-900 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">View Projects</h3>
              <p className="text-sm text-zinc-600">Access all your assigned projects and units</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-zinc-50 rounded-lg border border-zinc-200">
            <AlertCircle className="h-6 w-6 text-slate-900 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">Work History</h3>
              <p className="text-sm text-zinc-600">Track your completed work and statistics</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
