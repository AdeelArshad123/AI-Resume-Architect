import type { ResumeModel } from "@/types/resume";

export function createDefaultResume(): ResumeModel {
  return {
    profile: {
      name: "Your Name",
      headline: "Target Role Headline",
      summary:
        "AI-powered resume story bullets written using STAR for maximum impact and ATS relevance."
    },
    skills: [],
    experiences: []
  };
}

