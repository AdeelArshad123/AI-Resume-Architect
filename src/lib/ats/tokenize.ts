export function normalizeForMatch(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s\-+.#/]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenizeKeywords(keywords: string[]): string[] {
  const out = new Set<string>();
  for (const k of keywords) {
    const norm = normalizeForMatch(k);
    if (!norm) continue;
    out.add(norm);
  }
  return [...out];
}

