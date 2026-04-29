import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { createDefaultResume } from "@/lib/resume/defaultResume";

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient();
  const { data: userData, error: userErr } = await supabase.auth.getUser();

  if (userErr || !userData?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = userData.user.id;
  const body = await req.json().catch(() => ({}));
  const { title } = body as { title?: string };

  const defaultData = createDefaultResume();

  const { data: inserted, error: insertErr } = await supabase
    .from("resumes")
    .insert({
      user_id: userId,
      title: title || "New Resume",
      data: defaultData
    })
    .select("id, title, updated_at, data")
    .single();

  if (insertErr || !inserted) {
    return NextResponse.json({ error: insertErr?.message || "Insert failed" }, { status: 500 });
  }

  return NextResponse.json({ resume: inserted });
}

