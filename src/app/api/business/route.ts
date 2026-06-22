import { createClient } from "@/lib/supabase/server";
import { getHeroImage, getImagesForCategory } from "@/lib/images";
import { generateWhyUs } from "@/lib/why-us";
import { NextResponse } from "next/server";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { sanitizeInput, validatePhoneNumber, validateWebsiteUrl, validateThemeColor } from "@/lib/validation";
import { revalidateSite } from "@/lib/site-cache";
import { SECTION_IDS, SECTION_FIELDS, sectionLimit, SECTION_EDIT_WINDOW } from "@/lib/section-limits";

// Strip control characters and null bytes, enforce max length
function clean(v: unknown, max = 500): string {
  return sanitizeInput(v, max);
}

// Fields the client is allowed to update via PATCH — nothing else touches the DB
const ALLOWED_PATCH_FIELDS = new Set([
  "name", "tagline", "description", "phone", "email",
  "website", "hero_image", "gallery", "about_image",
  "hours", "services", "testimonials", "social",
  "theme_color", "corner_radius", "stat_years", "stat_clients", "stat_projects",
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

  // Validate phone if provided
  const phone = clean(body.phone, 30);
  if (phone) {
    const phoneValidation = validatePhoneNumber(phone);
    if (!phoneValidation.valid) {
      return NextResponse.json({ error: phoneValidation.error || "Invalid phone number" }, { status: 400 });
    }
  }

  // Validate website if provided
  const website = clean(body.website, 500);
  if (website) {
    const websiteValidation = validateWebsiteUrl(website);
    if (!websiteValidation.valid) {
      return NextResponse.json({ error: websiteValidation.error || "Invalid website URL" }, { status: 400 });
    }
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 5 business creations per hour per user
  const rlPost = rateLimit(`biz-create:${user.id}`, 5, 3600);
  if (!rlPost.ok) return tooManyRequests(rlPost.retryAfter);

  const hero = body.hero_image || getHeroImage(category);
  const gallery = Array.isArray(body.gallery) && body.gallery.length
    ? body.gallery.filter((u: unknown) => typeof u === "string" && u.length < 1000)
    : getImagesForCategory(category).slice(1, 4);

  const slug = `_tmp_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
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
      theme_color: clean(body.theme_color, 50) || "white-emerald",
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

  // 30 saves per 5 minutes per user
  const rlPatch = rateLimit(`biz-update:${user.id}`, 30, 300);
  if (!rlPatch.ok) return tooManyRequests(rlPatch.retryAfter);

  // Build update object — only whitelisted keys, nothing else
  const fields: Record<string, unknown> = {};
  for (const key of ALLOWED_PATCH_FIELDS) {
    if (key in body) {
      if (typeof body[key] === "string") {
        fields[key] = clean(body[key], 500);

        // Additional validation for specific fields
        if (key === "phone") {
          const validation = validatePhoneNumber(fields[key] as string);
          if (!validation.valid) {
            return NextResponse.json({ error: validation.error || "Invalid phone number" }, { status: 400 });
          }
        } else if (key === "website") {
          const validation = validateWebsiteUrl(fields[key] as string);
          if (!validation.valid) {
            return NextResponse.json({ error: validation.error || "Invalid website URL" }, { status: 400 });
          }
        } else if (key === "theme_color") {
          const validation = validateThemeColor(fields[key] as string);
          if (!validation.valid) {
            return NextResponse.json({ error: validation.error || "Invalid theme color" }, { status: 400 });
          }
        }
      } else {
        fields[key] = body[key];
      }
    }
  }

  if (Object.keys(fields).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  // Load the current row once: for the category-change image refresh and to
  // diff which sections actually changed (for per-section rate limiting).
  const { data: current } = await supabase
    .from("businesses").select("*").eq("id", id).eq("user_id", user.id).single();
  if (!current) return NextResponse.json({ error: "Business not found" }, { status: 404 });
  const cur = current as Record<string, unknown>;

  // Auto-update images when category changes
  if (fields.category && !fields.hero_image && cur.category !== fields.category) {
    fields.hero_image = getHeroImage(fields.category as string);
    fields.gallery = getImagesForCategory(fields.category as string).slice(1, 4);
  }

  // ── Per-section rate limiting ───────────────────────────────────────────────
  // Each section has its own hourly limit and only consumes a token when it
  // actually changed. Over-limit sections are skipped (not saved); every other
  // section still saves — one section's limit never blocks the rest.
  const changed = (key: string): boolean => {
    const a = fields[key];
    const b = cur[key];
    if (a === null || typeof a !== "object") return a !== b;
    return JSON.stringify(a) !== JSON.stringify(b);
  };

  const saved: string[] = [];
  const limited: { section: string; retryAfter: number }[] = [];

  for (const section of SECTION_IDS) {
    const sectionFields = SECTION_FIELDS[section].filter((f) => f in fields);
    if (sectionFields.length === 0 || !sectionFields.some(changed)) continue; // unchanged → free
    const rl = rateLimit(`edit:${user.id}:${section}`, sectionLimit(section), SECTION_EDIT_WINDOW);
    if (rl.ok) {
      saved.push(section);
    } else {
      limited.push({ section, retryAfter: rl.retryAfter });
      for (const f of SECTION_FIELDS[section]) delete fields[f]; // don't save this section
    }
  }

  // Apply only the allowed sections (skip a no-op write when nothing was allowed).
  if (saved.length > 0) {
    const { error } = await supabase
      .from("businesses")
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Refresh this site's cached public page so visitors see the change.
    revalidateSite(typeof cur.slug === "string" ? cur.slug : null);

    // Send "changes live" email (fire-and-forget, throttled to 1/hr)
    const emailRl = rateLimit(`changes-live-email:${user.id}`, 1, 3600);
    if (emailRl.ok && typeof cur.slug === "string" && !cur.slug.startsWith("_tmp_")) {
      (async () => {
        try {
          const siteUrl = `https://${cur.slug}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "syrflow.com"}`;
          const { sendMail } = await import("@/lib/email/mailer");
          const { changesLiveEmailHtml } = await import("@/lib/email/templates/changes-live");
          await sendMail(
            user.email!,
            "Your Changes Are Live | تغييراتك أصبحت مباشرة - syrflow.com",
            changesLiveEmailHtml({ businessName: String(fields.name ?? cur.name ?? ""), siteUrl })
          );
        } catch (err) {
          console.error("Error sending changes-live email:", err);
        }
      })();
    }
  }

  return NextResponse.json({ ok: true, saved, limited });
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
