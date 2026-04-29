import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type { ResumeModel } from "@/types/resume";

export async function POST(
  req: Request,
  { params }: { params: { resumeId: string } }
) {
  const supabase = createSupabaseServerClient();
  const { data: userData, error: userErr } = await supabase.auth.getUser();

  if (userErr || !userData?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = userData.user.id;
  const resumeId = params.resumeId;

  const body = await req.json().catch(() => ({}));
  const { title, data } = body as { title?: string; data?: ResumeModel };

  if (!data) {
    return NextResponse.json({ error: "Missing resume data" }, { status: 400 });
  }

  const { data: existing, error: existingErr } = await supabase
    .from("resumes")
    .select("id, user_id")
    .eq("id", resumeId)
    .maybeSingle();

  if (existingErr || !existing) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  if (existing.user_id !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error: updateErr } = await supabase
    .from("resumes")
    .update({
      title: title || "Resume",
      data
    })
    .eq("id", resumeId);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

