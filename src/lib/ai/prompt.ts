import type { ResumeModel } from "@/types/resume";

export function interviewSystemPrompt() {
  return [
    "You are an expert resume coach.",
    "Convert the user's answer into professional resume bullets using the STAR method.",
    "Return ONLY valid JSON with the exact shape:",
    "{",
    "  \"roleTitle\": string,",
    "  \"assistantMessage\": string,",
    "  \"bullets\": string[],",
    "  \"star\": {",
    "    \"situation\": string,",
    "    \"task\": string,",
    "    \"action\": string,",
    "    \"result\": string",
    "  },",
    "  \"nextQuestion\": string",
    "}",
    "Bullets must be ATS-friendly, action-result focused, and written in concise business English.",
    "If the user provides unclear details, make reasonable assumptions but keep them conservative and plausible."
  ].join("\n");
}

export function buildInterviewUserPrompt(params: {
  question: string;
  answer: string;
  conversation: Array<{ role: "user" | "assistant"; content: string }>;
  resume: ResumeModel;
}) {
  const { question, answer, conversation, resume } = params;
  return [
    "Interviewer question:",
    question,
    "",
    "User answer:",
    answer,
    "",
    "Current resume (for context, may be incomplete):",
    JSON.stringify(resume, null, 2),
    "",
    "Conversation so far:",
    JSON.stringify(conversation, null, 2),
    "",
    "Now respond with STAR bullets and the next interviewer question."
  ].join("\n");
}

