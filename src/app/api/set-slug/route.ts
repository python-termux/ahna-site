import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";

const SLUG_RE = /^[a-z0-9]{4,30}$/;
const RESERVED = new Set([
  "www", "app", "api", "admin", "mail", "smtp", "ftp",
  "dev", "staging", "test", "blog", "shop", "store",
  "help", "support", "status", "cdn", "static", "assets",
]);

// GET /api/set-slug?slug=xxx — check availability only
export async function GET(request: Request) {
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug")?.trim().toLowerCase() ?? "";

  if (!SLUG_RE.test(slug)) {
    return NextResponse.json({ available: false, error: "Invalid format" });
  }
  if (RESERVED.has(slug)) {
    return NextResponse.json({ available: false, error: "Reserved name" });
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("businesses")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  return NextResponse.json({ available: !data });
}

// POST /api/set-slug — set slug once (locked after)
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const businessId = typeof body.businessId === "string" ? body.businessId.trim() : "";
  const slug = typeof body.slug === "string" ? body.slug.trim().toLowerCase() : "";

  if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });

  if (!SLUG_RE.test(slug)) {
    return NextResponse.json(
      { error: "Slug must be 4–30 lowercase letters or numbers, no spaces or special characters" },
      { status: 400 }
    );
  }
  if (RESERVED.has(slug)) {
    return NextResponse.json({ error: "That name is reserved" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 10 slug attempts per hour per user
  const rl = rateLimit(`set-slug:${user.id}`, 10, 3600);
  if (!rl.ok) return tooManyRequests(rl.retryAfter);

  // Verify business belongs to this user and still has a temp slug
  const { data: biz } = await supabase
    .from("businesses")
    .select("id, slug")
    .eq("id", businessId)
    .eq("user_id", user.id)
    .single();

  if (!biz) return NextResponse.json({ error: "Business not found" }, { status: 404 });
  if (!biz.slug.startsWith("_tmp_")) {
    return NextResponse.json({ error: "Site link already set and cannot be changed" }, { status: 409 });
  }

  // Check uniqueness
  const { data: taken } = await supabase
    .from("businesses")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (taken) return NextResponse.json({ error: "That name is already taken, please choose another" }, { status: 409 });

  // Commit
  const { error } = await supabase
    .from("businesses")
    .update({ slug, updated_at: new Date().toISOString() })
    .eq("id", businessId)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, slug });
}
