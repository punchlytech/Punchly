import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EngineerNav } from "@/components/layout/engineer-nav";

export default async function EngineerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, email")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "engineer") {
    redirect("/admin");
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <EngineerNav profile={profile} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
