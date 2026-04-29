import type { ResumeModel } from "@/types/resume";

export function resumeToPlainText(resume: ResumeModel) {
  const parts: string[] = [];

  if (resume.profile?.name) parts.push(resume.profile.name);
  if (resume.profile?.headline) parts.push(resume.profile.headline);
  if (resume.profile?.summary) parts.push(resume.profile.summary);
  if (resume.profile?.location) parts.push(resume.profile.location);
  if (resume.profile?.email) parts.push(resume.profile.email);

  if (resume.skills?.length) parts.push(resume.skills.join(" "));

  for (const exp of resume.experiences ?? []) {
    parts.push(exp.title);
    if (exp.company) parts.push(exp.company);
    if (exp.start) parts.push(exp.start);
    if (exp.end) parts.push(exp.end);
    parts.push(exp.bullets.join(" "));
  }

  return parts.join("\n");
}

