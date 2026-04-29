export const runtime = "edge";

import { fetchPlaceFromUrl } from "@/lib/places";
import { NextResponse } from "next/server";

// POST /api/places/preview
// Body: { mapsUrl: string }
// Returns place data WITHOUT saving anything — used during registration preview step
export async function POST(request: Request) {
  const { mapsUrl } = await request.json();
  if (!mapsUrl?.trim()) {
    return NextResponse.json({ error: "mapsUrl is required" }, { status: 400 });
  }

  try {
    const place = await fetchPlaceFromUrl(mapsUrl.trim());
    return NextResponse.json(place);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch place" },
      { status: 422 }
    );
  }
}
