export interface WhyUsPoint {
  title: string;
  description: string;
}

// True when the text contains Arabic script — used to keep AI-generated copy
// in the same language as the site's own content.
export function hasArabic(text: string | null | undefined): boolean {
  return /[؀-ۿ]/.test(text ?? "");
}

export async function generateWhyUs(
  businessName: string,
  category: string,
  reviews: { text: string; rating: number }[],
  // Explicit language wins (e.g. detected from the site's tagline/description);
  // otherwise follow the language of the reviews themselves.
  lang?: "ar" | "en"
): Promise<WhyUsPoint[]> {
  const key = process.env.GROQ_API_KEY;
  if (!key || reviews.length === 0) return [];

  const topReviews = [...reviews]
    .filter((r) => r.rating >= 4 && r.text?.trim().length > 30)
    .sort((a, b) => b.rating - a.rating || b.text.length - a.text.length)
    .slice(0, 6)
    .map((r) => r.text.trim());

  if (topReviews.length === 0) return [];

  const useArabic = lang ? lang === "ar" : hasArabic(topReviews.join(" "));
  const langLine = useArabic
    ? "Write the titles and descriptions in Arabic (Modern Standard Arabic) only."
    : "Write the titles and descriptions in English only.";

  const prompt = `You are writing marketing copy for "${businessName}", a ${category} business.

Based on these real customer reviews, extract 3 distinct strengths or benefits. Present each as a professional benefit statement — NOT as a review or quote. Write like a marketing team describing what makes this business great. ${langLine}

Reviews:
${topReviews.map((t, i) => `${i + 1}. ${t}`).join("\n")}

Return ONLY a valid JSON array of exactly 3 objects. No explanation, no markdown, no code block.
Format: [{"title":"3-5 word benefit title","description":"One confident sentence under 90 characters describing this strength."}]`;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300,
        temperature: 0.5,
      }),
    });

    if (!res.ok) return [];

    const data = await res.json();
    const raw = (data.choices?.[0]?.message?.content ?? "").trim();
    const start = raw.indexOf("[");
    const end = raw.lastIndexOf("]");
    if (start === -1 || end === -1) return [];

    const parsed = JSON.parse(raw.slice(start, end + 1)) as WhyUsPoint[];
    if (!Array.isArray(parsed) || parsed.length === 0) return [];

    return parsed.slice(0, 3).map((p) => ({
      title: String(p.title ?? "").trim(),
      description: String(p.description ?? "").trim(),
    }));
  } catch {
    return [];
  }
}
