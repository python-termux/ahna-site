import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

// Matches the dashboard language: Arabic dashboards get Arabic AI text.
function langLine(lang: "ar" | "en"): string {
  return lang === "ar"
    ? " Write the text in Arabic (Modern Standard Arabic) only."
    : " Write the text in English only.";
}

const FIELDS: Record<string, {
  minChars: number;
  maxChars: number;
  maxTokens: number;
  prompt: (ctx: Record<string, string>, lang: "ar" | "en") => string;
}> = {
  tagline: {
    minChars: 250,
    maxChars: 300,
    maxTokens: 100,
    prompt: (c, l) =>
      `Write a tagline for a ${c.category} business called "${c.name}". It must be between 250 and 300 characters. Return ONLY the tagline text, no quotes, no explanation.${langLine(l)}`,
  },
  description: {
    minChars: 350,
    maxChars: 400,
    maxTokens: 140,
    prompt: (c, l) =>
      `Write an "About us" paragraph for a ${c.category} business called "${c.name}"${c.tagline ? ` (tagline: "${c.tagline}")` : ""}. It must be between 350 and 400 characters. Return ONLY the paragraph, no explanation.${langLine(l)}`,
  },
  service_title: {
    minChars: 0,
    maxChars: 50,
    maxTokens: 20,
    prompt: (c, l) =>
      `Suggest a service name for a ${c.category} business called "${c.name}". Max 50 characters. Return ONLY the name.${langLine(l)}`,
  },
  service_description: {
    minChars: 150,
    maxChars: 150,
    maxTokens: 70,
    prompt: (c, l) =>
      `Write a service description for "${c.serviceTitle}" at a ${c.category} business. It must be exactly 150 characters. Return ONLY the description.${langLine(l)}`,
  },
};

// Strip control characters and null bytes from a string, enforce max length
function sanitize(v: unknown, maxLen = 300): string {
  return String(v ?? "")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .trim()
    .slice(0, maxLen);
}

async function callAI(prompt: string, maxTokens: number, key: string): Promise<string> {
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  });
  if (!res.ok) throw new Error("AI request failed");
  const data = await res.json();
  return (data.choices?.[0]?.message?.content ?? "").trim().replace(/^["']|["']$/g, "");
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 10 AI calls per minute per user
  const rl = rateLimit(`ai-fill:${user.id}`, 10, 60);
  if (!rl.ok) return tooManyRequests(rl.retryAfter);

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const field = sanitize(body.field, 50);
  const lang: "ar" | "en" = body.lang === "ar" ? "ar" : "en";
  const rawCtx = body.context as Record<string, unknown>;

  const cfg = FIELDS[field];
  if (!cfg) return NextResponse.json({ error: "Unknown field" }, { status: 400 });

  // Sanitize every context value — these go into AI prompts
  const context: Record<string, string> = {};
  if (rawCtx && typeof rawCtx === "object") {
    for (const [k, v] of Object.entries(rawCtx)) {
      context[sanitize(k, 50)] = sanitize(v, 300);
    }
  }

  const key = process.env.GROQ_API_KEY;
  if (!key) return NextResponse.json({ error: "AI not configured" }, { status: 500 });

  try {
    let value = "";

    for (let attempt = 0; attempt < 3; attempt++) {
      const prompt = attempt === 0
        ? cfg.prompt(context, lang)
        : `The text below is ${value.length} characters, but it MUST be between ${cfg.minChars} and ${cfg.maxChars} characters. Rewrite it and add more detail until it reaches at least ${cfg.minChars} characters. Count carefully. Keep the same language as the text. Return ONLY the rewritten text:\n\n${value}`;

      // Arabic needs more token headroom for the same character count.
      const tokenBudget = Math.ceil((cfg.maxTokens + attempt * 50) * (lang === "ar" ? 1.6 : 1));
      value = await callAI(prompt, tokenBudget, key);

      if (value.length > cfg.maxChars) { value = value.slice(0, cfg.maxChars); break; }
      if (cfg.minChars === 0 || value.length >= cfg.minChars) break;
    }

    return NextResponse.json({ value });
  } catch {
    return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
  }
}
