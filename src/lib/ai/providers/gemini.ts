import { GoogleGenerativeAI } from "@google/generative-ai";

export async function callGemini(params: {
  apiKey: string;
  model: string;
  systemPrompt: string;
  userPrompt: string;
}) {
  const { apiKey, model, systemPrompt, userPrompt } = params;
  const genAI = new GoogleGenerativeAI(apiKey);

  const gModel = genAI.getGenerativeModel({ model });

  const result = await gModel.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          { text: `${systemPrompt}\n\n${userPrompt}` }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.3
    }
  });

  const text = result.response.text();
  if (!text) throw new Error("Gemini: empty response");
  return text;
}

