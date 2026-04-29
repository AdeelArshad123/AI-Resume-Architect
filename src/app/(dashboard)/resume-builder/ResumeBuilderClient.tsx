"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AiInterviewChat } from "@/components/chat/AiInterviewChat";
import { ResumeBentoPreview } from "@/components/bento/ResumeBentoPreview";
import { AtsOptimizer } from "@/components/ats/AtsOptimizer";
import { useResumeStore } from "@/store/resumeStore";
import type { ResumeModel } from "@/types/resume";
import { Button } from "@/components/ui/Button";
import { ExportResumeButton } from "@/components/pdf/ExportResumeButton";
import { Textarea } from "@/components/ui/Textarea";
import { ATSResumeDocument } from "@/components/pdf/ATSResumeDocument";
import { pdf } from "@react-pdf/renderer";
import { GlassCard } from "@/components/ui/GlassCard";
import { supabase } from "@/lib/supabase/browser-client";
import { useRouter } from "next/navigation";

function debounce<T extends (...args: any[]) => void>(fn: T, ms: number) {
  let t: any;
  return (...args: Parameters<T>) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

type ResumeWithData = { id: string; title: string; updated_at: string; data: ResumeModel };

export function ResumeBuilderClient({
  resumes,
  initialResume,
  userId
}: {
  resumes: ResumeWithData[];
  initialResume: ResumeModel;
  userId: string;
}) {
  const router = useRouter();
  const selectedResumeId = useResumeStore((s) => s.selectedResumeId);
  const setSelectedResumeId = useResumeStore((s) => s.setSelectedResumeId);
  const resume = useResumeStore((s) => s.resume);
  const setResume = useResumeStore((s) => s.setResume);

  const [resumesLoaded, setResumesLoaded] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareBusy, setShareBusy] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);

  const activeResume = useMemo(() => {
    return resumes.find((r) => r.id === selectedResumeId) ?? null;
  }, [resumes, selectedResumeId]);

  // Initialize store with first resume.
  useEffect(() => {
    if (!resumesLoaded) {
      if (resumes.length) {
        setSelectedResumeId(resumes[0].id);
        setResume(resumes[0].data);
        setTitleDraft(resumes[0].title);
      } else {
        setSelectedResumeId(null);
        setResume(initialResume);
        setTitleDraft("Resume 1");
      }
      setResumesLoaded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumesLoaded]);

  // Keep title draft synced when switching resumes.
  useEffect(() => {
    if (activeResume) setTitleDraft(activeResume.title);
  }, [activeResume]);

  const saveResume = debounce(async (id: string, payload: { title: string; data: ResumeModel }) => {
    setSaveBusy(true);
    try {
      const res = await fetch(`/api/resumes/${id}/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        // No-op; the UI will retry on next debounce tick.
      }
    } finally {
      setSaveBusy(false);
    }
  }, 1100);

  useEffect(() => {
    if (!selectedResumeId) return;
    saveResume(selectedResumeId, { title: titleDraft || "Resume", data: resume });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resume, titleDraft, selectedResumeId]);

  async function onCreateShareLink() {
    if (!selectedResumeId) return;
    setShareBusy(true);
    setShareUrl(null);
    try {
      const tokenRes = await fetch(`/api/resumes/${selectedResumeId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format: "pdf" })
      });
      if (!tokenRes.ok) throw new Error(`Share token request failed: ${tokenRes.status}`);
      const tokenData = (await tokenRes.json()) as { shareUrl: string; objectPath: string };

      // Generate PDF blob client-side, then upload to a private storage object.
      const blob = await pdf(<ATSResumeDocument resume={resume} />).toBlob();

      const uploadRes = await supabase.storage
        .from("resume-exports")
        .upload(tokenData.objectPath, blob, {
          contentType: "application/pdf",
          upsert: true
        });

      if (uploadRes.error) {
        throw new Error(uploadRes.error.message);
      }

      setShareUrl(tokenData.shareUrl);
    } finally {
      setShareBusy(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-lg font-semibold tracking-tight">Resume Builder</div>
            <div className="text-xs text-white/60">
              AI interview converts your answers into STAR bullets.
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div className="text-xs text-white/60">Resume</div>
              <select
                value={selectedResumeId ?? ""}
                onChange={(e) => {
                  const id = e.target.value;
                  setSelectedResumeId(id);
                  const found = resumes.find((r) => r.id === id);
                  if (found) setResume(found.data);
                }}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 focus:outline-none focus:ring-2 focus:ring-electric/40"
              >
                {resumes.map((r) => (
                  <option key={r.id} value={r.id} className="bg-[#121212]">
                    {r.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={async () => {
                  setSaveBusy(false);
                  const res = await fetch("/api/resumes/create", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ title: "New Resume" })
                  });
                  if (res.ok) router.refresh();
                }}
              >
                New Resume
              </Button>
              {selectedResumeId ? (
                <ExportResumeButton resume={resume} fileName={`${titleDraft || "resume"}.pdf`} />
              ) : null}
              <Button onClick={onCreateShareLink} disabled={shareBusy || !selectedResumeId}>
                {shareBusy ? "Creating..." : "Create Share Link"}
              </Button>
              <Button
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push("/sign-in");
                  router.refresh();
                }}
                className="px-3"
              >
                Sign out
              </Button>
            </div>
          </div>
        </div>

        {selectedResumeId ? (
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-4">
              <GlassCard className="p-4">
                <div className="flex flex-col gap-3">
                  <div>
                    <div className="text-xs font-semibold tracking-wide text-electric/90">Resume Title</div>
                    <Textarea
                      value={titleDraft}
                      onChange={(e) => setTitleDraft(e.target.value)}
                      className="mt-2 min-h-[46px] max-h-[80px] resize-none"
                    />
                    <div className="mt-2 text-xs text-white/60">
                      {saveBusy ? "Saving..." : "Auto-saves your STAR bullets to this resume."}
                    </div>
                  </div>
                  <div className="h-[560px] overflow-hidden">
                    <AiInterviewChat />
                  </div>
                </div>
              </GlassCard>
            </div>

            <div className="col-span-12 md:col-span-5">
              <div className="h-full">
                <ResumeBentoPreview />
              </div>
            </div>

            <div className="col-span-12 md:col-span-3">
              <AtsOptimizer />
              {shareUrl ? (
                <div className="mt-4">
                  <GlassCard className="p-4">
                    <div className="text-sm font-semibold">Your Share Link</div>
                    <div className="mt-2 text-xs text-white/60 break-all">{shareUrl}</div>
                    <div className="mt-3">
                      <Button
                        className="w-full"
                        onClick={async () => {
                          await navigator.clipboard.writeText(shareUrl);
                        }}
                      >
                        Copy
                      </Button>
                    </div>
                  </GlassCard>
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <GlassCard className="p-6">
            <div className="text-sm text-white/70">No resume selected yet.</div>
          </GlassCard>
        )}
      </div>
    </motion.div>
  );
}

