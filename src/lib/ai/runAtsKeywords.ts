import { safeJsonParse } from "@/lib/utils/safeJson";
import { callOpenAiChat } from "@/lib/ai/providers/openai";
import { callGemini } from "@/lib/ai/providers/gemini";

export async function runAtsKeywordExtraction(params: {
  provider: "openai" | "gemini";
  openaiApiKey: string;
  geminiApiKey: string;
  model: string;
  jobDescription: string;
  resumeText: string;
}): Promise<{ keywords: string[] }> {
  const systemPrompt = [
    "You are an ATS keyword extraction engine.",
    "Extract the most important skills, technologies, and requirements from the job description.",
    "Return ONLY JSON with the shape: {\"keywords\": string[]}.",
    "Keywords should be short phrases (1-4 words) when possible.",
    "Avoid generic filler words."
  ].join("\n");

  const userPrompt = [
    "JOB DESCRIPTION:",
    params.jobDescription,
    "",
    "EXISTING RESUME TEXT (for context; do not repeat generic phrases):",
    params.resumeText,
    "",
    "Extract keywords."
  ].join("\n");

  const raw =
    params.provider === "openai"
      ? await callOpenAiChat({
          apiKey: params.openaiApiKey,
          model: params.model,
          systemPrompt,
          userPrompt
        })
      : await callGemini({
          apiKey: params.geminiApiKey,
          model: params.model,
          systemPrompt,
          userPrompt
        });

  const parsed = safeJsonParse<{ keywords: string[] }>(raw);
  if (!parsed || !Array.isArray(parsed.keywords)) {
    // Fallback empty rather than throwing to keep UX responsive.
    return { keywords: [] };
  }

  return { keywords: parsed.keywords.slice(0, 40) };
}

