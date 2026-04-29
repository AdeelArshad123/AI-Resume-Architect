export type InterviewRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: InterviewRole;
  content: string;
  createdAt: string; // ISO
};

export type ResumeExperience = {
  id: string;
  title: string; // Role or project title
  company?: string;
  start?: string; // e.g. "Jan 2023"
  end?: string; // e.g. "Present"
  bullets: string[]; // ATS-friendly bullet points (STAR rewritten)
  // Optional: store the latest STAR framing for editing/debugging.
  star?: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
};

export type ResumeModel = {
  profile: {
    name: string;
    headline: string;
    summary: string;
    location?: string;
    email?: string;
    website?: string;
  };
  skills: string[];
  experiences: ResumeExperience[];
};

export type AtsState = {
  jobDescription: string;
  extractedKeywords: string[];
  missingKeywords: string[];
  matchScore: number; // 0..100
};

export type ResumeRow = {
  id: string;
  user_id: string;
  title: string;
  data: ResumeModel;
  updated_at: string;
};

