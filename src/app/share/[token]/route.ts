import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin-client";

export async function GET(
  req: Request,
  { params }: { params: { token: string } }
) {
  const shareToken = params.token;
  const { data, error } = await supabaseAdmin
    .from("resume_shares")
    .select("object_path, expires_at, revoked_at")
    .eq("share_token", shareToken)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "Share not found" }, { status: 404 });
  }

  const now = Date.now();
  const expiresAt = data.expires_at ? new Date(data.expires_at).getTime() : null;
  const revoked = !!data.revoked_at;

  if (revoked || (expiresAt !== null && expiresAt <= now)) {
    return NextResponse.json({ error: "Share expired" }, { status: 404 });
  }

  const objectPath = data.object_path;
  const signedTtlSeconds = 60 * 10; // 10 minutes

  const signedRes = await supabaseAdmin.storage
    .from("resume-exports")
    .createSignedUrl(objectPath, signedTtlSeconds);

  if (!signedRes?.data?.signedUrl) {
    return NextResponse.json({ error: "Export missing" }, { status: 404 });
  }

  return NextResponse.redirect(signedRes.data.signedUrl);
}

