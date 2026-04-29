import { normalizeForMatch } from "@/lib/ats/tokenize";

export function scoreKeywords(params: {
  keywords: string[];
  resumeText: string;
}) {
  const { keywords, resumeText } = params;
  const normResume = normalizeForMatch(resumeText);

  const normalizedKeywords = keywords
    .map((k) => normalizeForMatch(k))
    .filter(Boolean);

  const unique = Array.from(new Set(normalizedKeywords));
  if (unique.length === 0) {
    return { matchScore: 0, missingKeywords: [], matchedKeywords: [] as string[] };
  }

  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  for (const kw of unique) {
    // Phrase containment match (simple but effective for ATS keyword presence).
    if (normResume.includes(kw)) matchedKeywords.push(kw);
    else missingKeywords.push(kw);
  }

  const matchScore = Math.round((matchedKeywords.length / unique.length) * 100);
  return { matchScore, missingKeywords, matchedKeywords };
}

