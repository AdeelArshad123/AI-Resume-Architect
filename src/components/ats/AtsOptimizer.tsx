"use client";

import { useEffect, useMemo, useState } from "react";
import { Textarea } from "@/components/ui/Textarea";
import { GlassCard } from "@/components/ui/GlassCard";
import { useResumeStore } from "@/store/resumeStore";
import { resumeToPlainText } from "@/lib/ats/resumeToText";
import { scoreKeywords } from "@/lib/ats/score";

function debounce<T extends (...args: any[]) => void>(fn: T, ms: number) {
  let t: any;
  return (...args: Parameters<T>) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

export function AtsOptimizer() {
  const resume = useResumeStore((s) => s.resume);
  const setAts = useResumeStore((s) => s.setAts);

  const [jd, setJd] = useState("");
  const resumeText = useMemo(() => resumeToPlainText(resume), [resume]);

  useEffect(() => {
    // Start empty; user pastes JD to trigger scoring.
  }, []);

  async function refreshKeywordsAndScore(jobDescription: string) {
    const jdTrimmed = jobDescription.trim();

    if (!jdTrimmed) {
      setAts({ jobDescription: "", extractedKeywords: [], missingKeywords: [], matchScore: 0 });
      return;
    }

    // Try AI extraction; if it fails (missing keys), fall back to a basic keyword heuristic.
    let extractedKeywords: string[] = [];
    try {
      const res = await fetch("/api/ai/ats/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription: jdTrimmed,
          resumeText
        })
      });
      if (res.ok) {
        const data = await res.json();
        extractedKeywords = Array.isArray(data.keywords) ? data.keywords : [];
      }
    } catch {
      // ignore and fallback
    }

    if (!extractedKeywords.length) {
      // Fallback: pull frequent-ish terms from JD.
      extractedKeywords = jdTrimmed
        .toLowerCase()
        .replace(/[^a-z0-9\s\-+.#/]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length >= 3)
        .filter((w) => !["with", "and", "the", "for", "you", "are", "our", "will", "that", "have", "from"].includes(w))
        .slice(0, 40);
    }

    const scored = scoreKeywords({ keywords: extractedKeywords, resumeText });
    setAts({
      jobDescription: jdTrimmed,
      extractedKeywords,
      missingKeywords: scored.missingKeywords.slice(0, 18),
      matchScore: scored.matchScore
    });
  }

  const debouncedRefresh = useMemo(
    () => debounce((text: string) => refreshKeywordsAndScore(text), 700),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [resumeText]
  );

  useEffect(() => {
    debouncedRefresh(jd);
  }, [jd, debouncedRefresh]);

  const matchScore = useResumeStore((s) => s.ats.matchScore);
  const missing = useResumeStore((s) => s.ats.missingKeywords);

  return (
    <GlassCard className="p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold tracking-wide text-electric/90">ATS Optimizer</div>
        <div className="text-xs text-white/70">
          Match Score: <span className="text-electric/90 font-semibold">{matchScore}</span>/100
        </div>
      </div>

      <div className="mt-3 text-xs text-white/60">
        Paste a Job Description to detect missing keywords in real-time.
      </div>

      <div className="mt-3">
        <Textarea
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          placeholder="Paste job description here..."
          className="min-h-[140px] resize-none"
        />
      </div>

      <div className="mt-3">
        <div className="text-xs font-semibold text-white/80">Missing Keywords</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {missing.length ? (
            missing.map((k) => (
              <span
                key={k}
                className="rounded-full border border-lavender/30 bg-lavender/10 px-3 py-1 text-xs text-lavender/90"
              >
                {k}
              </span>
            ))
          ) : (
            <div className="text-sm text-white/55">Add a Job Description to see missing items.</div>
          )}
        </div>
      </div>
    </GlassCard>
  );
}

