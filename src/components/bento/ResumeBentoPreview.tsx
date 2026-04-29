"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { BentoGrid } from "@/components/bento/BentoGrid";
import { BentoCard } from "@/components/bento/BentoCard";
import { useResumeStore } from "@/store/resumeStore";

function SectionTitle({ children }: { children: string }) {
  return <div className="text-xs font-semibold tracking-wide text-electric/90">{children}</div>;
}

export function ResumeBentoPreview() {
  const resume = useResumeStore((s) => s.resume);

  const experiences = resume.experiences ?? [];
  const skills = resume.skills ?? [];

  const header = useMemo(() => {
    const name = resume.profile?.name?.trim() || "Your Name";
    const headline = resume.profile?.headline?.trim() || "Target Role Headline";
    const summary = resume.profile?.summary?.trim() || "Add a concise summary optimized for ATS and STAR stories.";
    return { name, headline, summary };
  }, [resume.profile]);

  return (
    <div className="h-full">
      <motion.div
        key={resume.profile?.name}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
      >
        <BentoGrid>
          <BentoCard colSpan={12} rowSpan={2} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <SectionTitle>Resume Snapshot</SectionTitle>
                <div className="mt-2 text-2xl font-semibold tracking-tight">
                  {header.name}
                </div>
                <div className="mt-1 text-electric/90 text-sm font-medium">
                  {header.headline}
                </div>
                <div className="mt-3 text-sm text-white/80">{header.summary}</div>
              </div>
              <div className="hidden sm:block text-right text-white/60 text-xs">
                ATS-ready • STAR bullets
              </div>
            </div>
          </BentoCard>

          <BentoCard colSpan={6} rowSpan={2} className="p-4">
            <SectionTitle>Skills</SectionTitle>
            <div className="mt-3 flex flex-wrap gap-2">
              {skills.length ? (
                skills.slice(0, 24).map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/85"
                  >
                    {s}
                  </span>
                ))
              ) : (
                <div className="text-sm text-white/60">Add skills to strengthen keyword matching.</div>
              )}
            </div>
          </BentoCard>

          <BentoCard colSpan={6} rowSpan={2} className="p-4 overflow-hidden">
            <SectionTitle>Experience</SectionTitle>
            <div className="mt-3 space-y-4 overflow-auto pr-1" style={{ maxHeight: 420 }}>
              {experiences.length ? (
                experiences.slice(0, 6).map((exp) => (
                  <div key={exp.id} className="border border-white/10 rounded-xl bg-black/10 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold">{exp.title}</div>
                        {exp.company ? <div className="text-xs text-white/60">{exp.company}</div> : null}
                      </div>
                      {exp.bullets?.length ? (
                        <div className="text-xs text-lavender/80">{exp.bullets.length} bullets</div>
                      ) : null}
                    </div>
                    {exp.bullets?.length ? (
                      <ul className="mt-2 space-y-1 text-sm text-white/85 list-disc pl-4">
                        {exp.bullets.slice(0, 6).map((b, idx) => (
                          <li key={`${exp.id}-${idx}`}>{b}</li>
                        ))}
                      </ul>
                    ) : (
                      <div className="mt-2 text-sm text-white/60">Complete the AI interview to generate STAR bullets.</div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-sm text-white/60">
                  Start the interview to transform your work into STAR stories.
                </div>
              )}
            </div>
          </BentoCard>
        </BentoGrid>
      </motion.div>
    </div>
  );
}

