import type { ResumeModel } from "@/types/resume";
import { interviewSystemPrompt, buildInterviewUserPrompt } from "@/lib/ai/prompt";
import { safeJsonParse } from "@/lib/utils/safeJson";
import { callOpenAiChat } from "@/lib/ai/providers/openai";
import { callGemini } from "@/lib/ai/providers/gemini";

export type InterviewAIResponse = {
  roleTitle: string;
  assistantMessage: string;
  bullets: string[];
  star?: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
  nextQuestion?: string;
};

export async function runInterviewStep(params: {
  provider: "openai" | "gemini";
  openaiApiKey: string;
  geminiApiKey: string;
  model: string;
  question: string;
  answer: string;
  conversation: Array<{ role: "user" | "assistant"; content: string }>;
  resume: ResumeModel;
}): Promise<InterviewAIResponse> {
  const { provider, openaiApiKey, geminiApiKey, model, question, answer, conversation, resume } = params;

  const systemPrompt = interviewSystemPrompt();
  const userPrompt = buildInterviewUserPrompt({
    question,
    answer,
    conversation,
    resume
  });

  const raw =
    provider === "openai"
      ? await callOpenAiChat({
          apiKey: openaiApiKey,
          model,
          systemPrompt,
          userPrompt
        })
      : await callGemini({
          apiKey: geminiApiKey,
          model,
          systemPrompt,
          userPrompt
        });

  const parsed = safeJsonParse<InterviewAIResponse>(raw);
  if (!parsed?.roleTitle || !Array.isArray(parsed.bullets) || !parsed?.assistantMessage || !parsed?.nextQuestion) {
    throw new Error("AI interview: invalid JSON payload");
  }

  return parsed;
}

