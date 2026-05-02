import { createClient } from "@/lib/supabase/server";
import { fetchPlaceFromUrl } from "@/lib/places";
import { generateWhyUs } from "@/lib/why-us";
import { NextResponse } from "next/server";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";

const MAPS_URL_RE = /^https:\/\/(maps\.app\.goo\.gl|maps\.google\.com|www\.google\.com\/maps|goo\.gl\/maps)\//;

// POST /api/places
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 5 imports per hour per user
  const rl = rateLimit(`places:${user.id}`, 5, 3600);
  if (!rl.ok) return tooManyRequests(rl.retryAfter);

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const mapsUrl = typeof body.mapsUrl === "string" ? body.mapsUrl.trim() : "";

  if (!mapsUrl) {
    return NextResponse.json({ error: "mapsUrl is required" }, { status: 400 });
  }
  if (mapsUrl.length > 500) {
    return NextResponse.json({ error: "URL too long" }, { status: 400 });
  }
  if (!MAPS_URL_RE.test(mapsUrl)) {
    return NextResponse.json({ error: "Must be a valid Google Maps URL" }, { status: 400 });
  }

  let place;
  try {
    place = await fetchPlaceFromUrl(mapsUrl);
  } catch {
    return NextResponse.json({ error: "Could not fetch business data from that URL" }, { status: 422 });
  }

  const slug = `_tmp_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
  const whyUs = await generateWhyUs(place.name, place.category, place.reviews);

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
      maps_url: mapsUrl,
      website: place.website,
      hero_image: "",
      gallery: place.images,
      hours: place.hours,
      services: [],
      testimonials: place.reviews.map((r) => ({
        author: r.author,
        role: "",
        text: r.text,
        rating: r.rating,
      })),
      social: {},
      theme_color: "white-emerald",
      stat_years: "",
      stat_clients: place.reviewCount ? `${place.reviewCount.toLocaleString()}+` : "",
      stat_projects: place.rating ? `${place.rating} ★` : "",
      why_us: whyUs,
    })
    .select("id, slug")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ slug: data.slug });
}
