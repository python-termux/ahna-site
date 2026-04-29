import { createClient } from "@/lib/supabase/server";
import { fetchPlaceFromUrl } from "@/lib/places";
import { slugify } from "@/lib/slugify";
import { NextResponse } from "next/server";

async function uniqueSlugSupabase(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  base: string
): Promise<string> {
  let candidate = base || "business";
  let i = 2;
  while (true) {
    const { data } = await supabase
      .from("businesses")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    if (!data) return candidate;
    candidate = `${base}-${i++}`;
  }
}

// POST /api/places
// Body: { mapsUrl: string }
export async function POST(request: Request) {
  const { mapsUrl } = await request.json();
  if (!mapsUrl?.trim()) {
    return NextResponse.json({ error: "mapsUrl is required" }, { status: 400 });
  }

  let place;
  try {
    place = await fetchPlaceFromUrl(mapsUrl.trim());
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch place" },
      { status: 422 }
    );
  }

  const base = slugify(place.name || "business");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const slug = await uniqueSlugSupabase(supabase, base);

  const { data, error } = await supabase
    .from("businesses")
    .insert({
      user_id: user.id,
      slug,
      name: place.name,
      tagline: "",
      description: place.description,
      category: place.category,
      phone: place.phone,
      email: "",
      address: place.address,
      maps_url: place.mapsUrl,
      website: place.website,
      hero_image: place.images[0] ?? "",
      gallery: place.images.slice(1, 4),
      hours: place.hours,
      services: [],
      testimonials: place.reviews.map((r) => ({
        author: r.author,
        role: "",
        text: r.text,
        rating: r.rating,
      })),
      social: {},
      theme_color: "indigo",
      stat_years: "",
      stat_clients: place.reviewCount ? `${place.reviewCount.toLocaleString()}+` : "",
      stat_projects: place.rating ? `${place.rating} ★` : "",
    })
    .select("id, slug")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ slug: data.slug });
}
