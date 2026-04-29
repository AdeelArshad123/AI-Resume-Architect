import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { supabaseAdmin } from "@/lib/supabase/admin-client";

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

  // Verify resume ownership first.
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

  // Create a share token that maps to a private exported PDF object path.
  const shareToken = randomUUID();
  const objectPath = `exports/${userId}/${resumeId}/${shareToken}.pdf`;

  const origin = new URL(req.url).origin;
  const shareUrl = `${origin}/share/${shareToken}`;

  // Store token mapping for later verification at the public route.
  const { error: shareErr } = await supabaseAdmin
    .from("resume_shares")
    .insert({
      share_token: shareToken,
      resume_id: resumeId,
      object_path: objectPath,
      created_by: userId,
      expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString() // 7 days
    });

  if (shareErr) {
    return NextResponse.json({ error: shareErr.message }, { status: 500 });
  }

  return NextResponse.json({ shareUrl, objectPath });
}

