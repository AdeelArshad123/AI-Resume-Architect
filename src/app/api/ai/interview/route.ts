import { NextResponse } from "next/server";
import { createDefaultResume } from "@/lib/resume/defaultResume";
import { runInterviewStep } from "@/lib/ai/runInterview";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { answer, conversation, resume } = body as {
      answer: string;
      conversation: Array<{ role: "user" | "assistant"; content: string }>;
      resume?: any;
    };

    if (!answer || !Array.isArray(conversation)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const lastAssistant = [...conversation].reverse().find((m) => m.role === "assistant");
    const question = lastAssistant?.content || "Tell me about your most challenging project.";

    const openaiApiKey = process.env.OPENAI_API_KEY || "";
    const geminiApiKey = process.env.GEMINI_API_KEY || "";

    const provider = (process.env.AI_PROVIDER || "openai") as "openai" | "gemini";
    const openaiModel = process.env.OPENAI_MODEL || "gpt-4o";
    const geminiModel = process.env.GEMINI_MODEL || "gemini-1.5-pro";

    const safeResume = resume ?? createDefaultResume();

    const effectiveProvider: "openai" | "gemini" =
      provider === "openai"
        ? openaiApiKey
          ? "openai"
          : "gemini"
        : geminiApiKey
          ? "gemini"
          : "openai";

    if (effectiveProvider === "openai" && !openaiApiKey) {
      return NextResponse.json({ error: "OpenAI API key missing" }, { status: 500 });
    }
    if (effectiveProvider === "gemini" && !geminiApiKey) {
      return NextResponse.json({ error: "Gemini API key missing" }, { status: 500 });
    }

    const ai = await runInterviewStep({
      provider: effectiveProvider,
      openaiApiKey,
      geminiApiKey,
      model: effectiveProvider === "openai" ? openaiModel : geminiModel,
      question,
      answer,
      conversation: conversation.map((m) => ({ role: m.role, content: m.content })),
      resume: safeResume
    });

    return NextResponse.json({
      roleTitle: ai.roleTitle,
      assistantMessage: ai.assistantMessage,
      bullets: ai.bullets,
      star: ai.star,
      nextQuestion: ai.nextQuestion
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Interview AI failed" },
      { status: 500 }
    );
  }
}

