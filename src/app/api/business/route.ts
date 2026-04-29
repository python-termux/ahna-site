import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slugify";
import { getHeroImage, getImagesForCategory } from "@/lib/images";
import { generateWhyUs } from "@/lib/why-us";
import { NextResponse } from "next/server";

// Strip control characters and null bytes, enforce max length
function clean(v: unknown, max = 500): string {
  return String(v ?? "")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .trim()
    .slice(0, max);
}

// Fields the client is allowed to update via PATCH — nothing else touches the DB
const ALLOWED_PATCH_FIELDS = new Set([
  "name", "tagline", "description", "phone", "email",
  "website", "hero_image", "gallery", "about_image",
  "hours", "services", "testimonials", "social",
  "theme_color", "stat_years", "stat_clients", "stat_projects",
]);

// POST /api/business — create
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const name = clean(body.name, 100);
  const category = clean(body.category, 100) || "Other";
  if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const hero = body.hero_image || getHeroImage(category);
  const gallery = Array.isArray(body.gallery) && body.gallery.length
    ? body.gallery.filter((u: unknown) => typeof u === "string" && u.length < 1000)
    : getImagesForCategory(category).slice(1, 4);

  const slug = await uniqueSlug(supabase, slugify(name));
  const whyUs = await generateWhyUs(name, category, body.testimonials ?? []);

  const { data, error } = await supabase
    .from("businesses")
    .insert({
      user_id: user.id, slug, name,
      tagline: clean(body.tagline, 400),
      description: clean(body.description, 500),
      category,
      phone: clean(body.phone, 30),
      email: clean(body.email, 200),
      address: clean(body.address, 300),
      maps_url: clean(body.maps_url, 500),
      website: clean(body.website, 500),
      hero_image: hero,
      gallery,
      hours: typeof body.hours === "object" && body.hours !== null ? body.hours : {},
      services: Array.isArray(body.services) ? body.services : [],
      testimonials: Array.isArray(body.testimonials) ? body.testimonials : [],
      social: typeof body.social === "object" && body.social !== null ? body.social : {},
      theme_color: clean(body.theme_color, 50) || "indigo",
      stat_years: clean(body.stat_years, 50),
      stat_clients: clean(body.stat_clients, 50),
      stat_projects: clean(body.stat_projects, 50),
      why_us: whyUs,
    })
    .select("id, slug")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id, slug: data.slug });
}

// PATCH /api/business — update (whitelisted fields only)
export async function PATCH(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id.trim() : "";
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Build update object — only whitelisted keys, nothing else
  const fields: Record<string, unknown> = {};
  for (const key of ALLOWED_PATCH_FIELDS) {
    if (key in body) {
      if (typeof body[key] === "string") {
        fields[key] = clean(body[key], 500);
      } else {
        fields[key] = body[key];
      }
    }
  }

  if (Object.keys(fields).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  // Auto-update images when category changes
  if (fields.category && !fields.hero_image) {
    const { data: existing } = await supabase
      .from("businesses").select("category").eq("id", id).eq("user_id", user.id).single();
    if (existing && existing.category !== fields.category) {
      fields.hero_image = getHeroImage(fields.category as string);
      fields.gallery = getImagesForCategory(fields.category as string).slice(1, 4);
    }
  }

  const { error } = await supabase
    .from("businesses")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function uniqueSlug(supabase: any, base: string): Promise<string> {
  const MAX = 50;
  let candidate = base || "business";
  let i = 2;
  while (i <= MAX) {
    const { data } = await supabase.from("businesses").select("id").eq("slug", candidate).maybeSingle();
    if (!data) return candidate;
    candidate = `${base}-${i++}`;
  }
  // Fallback: append random suffix
  return `${base}-${Math.random().toString(36).slice(2, 8)}`;
}
