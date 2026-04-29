import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { createDefaultResume } from "@/lib/resume/defaultResume";
import { ResumeBuilderClient } from "./ResumeBuilderClient";
import type { ResumeModel } from "@/types/resume";

export default async function ResumeBuilderPage() {
  const supabase = createSupabaseServerClient();
  const { data: userData, error: userErr } = await supabase.auth.getUser();

  if (userErr || !userData?.user) {
    redirect("/sign-in");
  }

  const user = userData.user;

  // Load existing resumes for the owner.
  const { data: resumesRows, error: resumesErr } = await supabase
    .from("resumes")
    .select("id, title, updated_at, data")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(20);

  if (resumesErr) {
    // If the table doesn't exist yet, show a deterministic fallback.
    // You can replace this once your Supabase migrations are applied.
    const fallback = createDefaultResume();
    const initial: ResumeModel = fallback;
    return <ResumeBuilderClient resumes={[]} initialResume={initial} userId={user.id} />;
  }

  let resumes = resumesRows ?? [];

  if (resumes.length === 0) {
    // Create a first resume row so the client can start immediately.
    const defaultData = createDefaultResume();
    const { data: inserted } = await supabase
      .from("resumes")
      .insert({
        user_id: user.id,
        title: "Resume 1",
        data: defaultData
      })
      .select("id, title, updated_at, data")
      .single();

    resumes = inserted ? [inserted] : [];
  }

  const initialResume = (resumes[0]?.data as ResumeModel) ?? createDefaultResume();

  return (
    <ResumeBuilderClient
      resumes={resumes.map((r: any) => ({
        id: r.id,
        title: r.title,
        updated_at: r.updated_at,
        data: r.data as ResumeModel
      }))}
      initialResume={initialResume}
      userId={user.id}
    />
  );
}

