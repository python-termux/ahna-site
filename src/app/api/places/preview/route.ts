import { fetchPlaceFromUrl } from "@/lib/places";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";

const MAPS_URL_RE = /^https:\/\/(maps\.app\.goo\.gl|maps\.google\.com|www\.google\.com\/maps|goo\.gl\/maps)\//;

function getIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "anon"
  );
}

// POST /api/places/preview — public (used during registration before account exists)
export async function POST(request: NextRequest) {
  // 5 previews per minute per IP — middleware also enforces this as a first layer
  const rl = rateLimit(`preview:${getIP(request)}`, 5, 60);
  if (!rl.ok) return tooManyRequests(rl.retryAfter);

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const mapsUrl = typeof body.mapsUrl === "string" ? body.mapsUrl.trim() : "";

  if (!mapsUrl) return NextResponse.json({ error: "mapsUrl is required" }, { status: 400 });
  if (mapsUrl.length > 500) return NextResponse.json({ error: "URL too long" }, { status: 400 });
  if (!MAPS_URL_RE.test(mapsUrl)) {
    return NextResponse.json({ error: "Must be a valid Google Maps URL" }, { status: 400 });
  }

  try {
    const place = await fetchPlaceFromUrl(mapsUrl);
    return NextResponse.json(place);
  } catch {
    return NextResponse.json({ error: "Could not fetch business data from that URL" }, { status: 422 });
  }
}
