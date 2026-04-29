export const runtime = "edge";

import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slugify";
import { getHeroImage, getImagesForCategory } from "@/lib/images";
import { NextResponse } from "next/server";

// POST /api/business — create
export async function POST(request: Request) {
  const body = await request.json();
  const name: string = (body.name ?? "").trim();
  const category: string = body.category ?? "Other";
  if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });

  const hero = body.hero_image || getHeroImage(category);
  const gallery = body.gallery?.length ? body.gallery : getImagesForCategory(category).slice(1, 4);
  const base = slugify(name);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const slug = await uniqueSlug(supabase, base);

  const { data, error } = await supabase
    .from("businesses")
    .insert({
      user_id: user.id, slug, name,
      tagline: body.tagline ?? "", description: body.description ?? "",
      category, phone: body.phone ?? "", email: body.email ?? "",
      address: body.address ?? "", website: body.website ?? "",
      hero_image: hero, gallery, hours: body.hours ?? {},
      services: body.services ?? [], testimonials: body.testimonials ?? [],
      social: body.social ?? {}, theme_color: body.theme_color ?? "indigo",
      stat_years: body.stat_years ?? "", stat_clients: body.stat_clients ?? "",
      stat_projects: body.stat_projects ?? "",
    })
    .select("id, slug")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id, slug: data.slug });
}

// PATCH /api/business — update
export async function PATCH(request: Request) {
  const body = await request.json();
  const { id, ...fields } = body;
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (fields.category && !fields.hero_image) {
    const { data: existing } = await supabase
      .from("businesses").select("category").eq("id", id).eq("user_id", user.id).single();
    if (existing && existing.category !== fields.category) {
      fields.hero_image = getHeroImage(fields.category);
      fields.gallery = getImagesForCategory(fields.category).slice(1, 4);
    }
  }

  const { error } = await supabase
    .from("businesses")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id).eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function uniqueSlug(supabase: any, base: string): Promise<string> {
  let candidate = base || "business";
  let i = 2;
  while (true) {
    const { data } = await supabase.from("businesses").select("id").eq("slug", candidate).maybeSingle();
    if (!data) return candidate;
    candidate = `${base}-${i++}`;
  }
}
