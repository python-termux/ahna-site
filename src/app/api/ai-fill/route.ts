import { NextResponse } from "next/server";

const URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

const FIELDS: Record<string, {
  minChars: number;
  maxChars: number;
  maxTokens: number;
  prompt: (ctx: Record<string, string>) => string;
}> = {
  tagline: {
    minChars: 250,
    maxChars: 300,
    maxTokens: 100,
    prompt: (c) =>
      `Write a tagline for a ${c.category} business called "${c.name}". It must be between 250 and 300 characters. Return ONLY the tagline text, no quotes, no explanation.`,
  },
  description: {
    minChars: 350,
    maxChars: 400,
    maxTokens: 140,
    prompt: (c) =>
      `Write an "About us" paragraph for a ${c.category} business called "${c.name}"${c.tagline ? ` (tagline: "${c.tagline}")` : ""}. It must be between 350 and 400 characters. Return ONLY the paragraph, no explanation.`,
  },
  service_title: {
    minChars: 0,
    maxChars: 50,
    maxTokens: 20,
    prompt: (c) =>
      `Suggest a service name for a ${c.category} business called "${c.name}". Max 50 characters. Return ONLY the name.`,
  },
  service_description: {
    minChars: 150,
    maxChars: 150,
    maxTokens: 70,
    prompt: (c) =>
      `Write a service description for "${c.serviceTitle}" at a ${c.category} business. It must be exactly 150 characters. Return ONLY the description.`,
  },
};

async function callAI(prompt: string, maxTokens: number, key: string): Promise<string> {
  const res = await fetch(URL, {
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
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`${res.status}: ${err}`);
  }
  const data = await res.json();
  return (data.choices?.[0]?.message?.content ?? "").trim().replace(/^["']|["']$/g, "");
}

export async function POST(request: Request) {
  const { field, context } = await request.json() as {
    field: string;
    context: Record<string, string>;
  };

  const cfg = FIELDS[field];
  if (!cfg) return NextResponse.json({ error: "Unknown field" }, { status: 400 });

  const key = process.env.GROQ_API_KEY;
  if (!key) return NextResponse.json({ error: "AI not configured" }, { status: 500 });

  try {
    let value = "";

    for (let attempt = 0; attempt < 3; attempt++) {
      const prompt = attempt === 0
        ? cfg.prompt(context)
        : `The text below is ${value.length} characters, but it MUST be between ${cfg.minChars} and ${cfg.maxChars} characters. Rewrite it and add more detail, description, and elaboration until it reaches at least ${cfg.minChars} characters. Count carefully. Return ONLY the rewritten text:\n\n${value}`;

      value = await callAI(prompt, cfg.maxTokens + attempt * 50, key);

      // Truncate if over max
      if (value.length > cfg.maxChars) {
        value = value.slice(0, cfg.maxChars);
        break;
      }

      // In range — done
      if (cfg.minChars === 0 || value.length >= cfg.minChars) break;
    }

    return NextResponse.json({ value });
  } catch (err) {
    console.error("AI error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
