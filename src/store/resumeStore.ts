"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { AtsState, ChatMessage, ResumeModel, ResumeExperience } from "@/types/resume";

type ResumeStore = {
  // Selected resume in the dashboard.
  selectedResumeId: string | null;

  // Chat state for the AI interview.
  messages: ChatMessage[];

  // Resume state rendered in the Bento preview.
  resume: ResumeModel;

  // ATS optimizer state.
  ats: AtsState;

  // Actions
  setSelectedResumeId: (id: string | null) => void;
  setResume: (resume: ResumeModel) => void;

  resetForNewInterview: () => void;
  addMessage: (message: Omit<ChatMessage, "id" | "createdAt">) => void;

  applyInterviewResult: (payload: {
    roleTitle: string;
    bullets: string[];
    star?: ResumeExperience["star"];
  }) => void;

  setAts: (partial: Partial<AtsState>) => void;
};

export const useResumeStore = create(
  immer<ResumeStore>((set, get) => ({
    selectedResumeId: null,

    messages: [],

    resume: {
      profile: { name: "Your Name", headline: "Target Role Headline", summary: "", location: "", email: "", website: "" },
      skills: [],
      experiences: []
    },

    ats: {
      jobDescription: "",
      extractedKeywords: [],
      missingKeywords: [],
      matchScore: 0
    },

    setSelectedResumeId: (id) => set((s) => { s.selectedResumeId = id; }),
    setResume: (resume) => set((s) => { s.resume = resume; }),

    resetForNewInterview: () =>
      set((s) => {
        s.messages = [];
        s.ats = { jobDescription: "", extractedKeywords: [], missingKeywords: [], matchScore: 0 };
        // Keep the resume data; the user may want to iterate while preserving previous sections.
      }),

    addMessage: (message) =>
      set((s) => {
        s.messages.push({
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          ...message
        });
      }),

    applyInterviewResult: ({ roleTitle, bullets, star }) =>
      set((s) => {
        const last = s.resume.experiences[s.resume.experiences.length - 1];

        // Heuristic: if the last entry matches this role title, append bullets.
        if (last && last.title.trim().toLowerCase() === roleTitle.trim().toLowerCase()) {
          last.bullets = [...last.bullets, ...bullets];
          if (star) last.star = star;
        } else {
          s.resume.experiences.push({
            id: crypto.randomUUID(),
            title: roleTitle,
            bullets,
            star
          });
        }
      }),

    setAts: (partial) => set((s) => { s.ats = { ...s.ats, ...partial }; })
  }))
);

