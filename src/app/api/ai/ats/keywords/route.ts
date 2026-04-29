import { NextResponse } from "next/server";
import { runAtsKeywordExtraction } from "@/lib/ai/runAtsKeywords";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { jobDescription, resumeText } = body as {
      jobDescription: string;
      resumeText: string;
    };

    if (!jobDescription || typeof jobDescription !== "string") {
      return NextResponse.json({ error: "Missing jobDescription" }, { status: 400 });
    }

    const openaiApiKey = process.env.OPENAI_API_KEY || "";
    const geminiApiKey = process.env.GEMINI_API_KEY || "";
    const provider = (process.env.AI_PROVIDER || "openai") as "openai" | "gemini";
    const openaiModel = process.env.OPENAI_MODEL || "gpt-4o";
    const geminiModel = process.env.GEMINI_MODEL || "gemini-1.5-pro";

    const effectiveProvider: "openai" | "gemini" =
      provider === "openai"
        ? openaiApiKey
          ? "openai"
          : "gemini"
        : geminiApiKey
          ? "gemini"
          : "openai";

    const model = effectiveProvider === "openai" ? openaiModel : geminiModel;

    if (effectiveProvider === "openai" && !openaiApiKey) {
      return NextResponse.json({ keywords: [] }, { status: 200 });
    }
    if (effectiveProvider === "gemini" && !geminiApiKey) {
      return NextResponse.json({ keywords: [] }, { status: 200 });
    }

    const data = await runAtsKeywordExtraction({
      provider: effectiveProvider,
      openaiApiKey,
      geminiApiKey,
      model,
      jobDescription,
      resumeText: resumeText || ""
    });

    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Keyword extraction failed" },
      { status: 500 }
    );
  }
}

