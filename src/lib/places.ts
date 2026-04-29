const BASE = "https://places.googleapis.com/v1";

export interface PlaceResult {
  name: string;
  address: string;
  phone: string;
  website: string;
  rating: number;
  reviewCount: number;
  category: string;
  description: string;
  hours: Record<string, string>;
  images: string[];
  reviews: PlaceReview[];
  mapsUrl: string;
}

export interface PlaceReview {
  author: string;
  rating: number;
  text: string;
  date: string;
}

// Follow short URLs (maps.app.goo.gl, goo.gl) to get the real Maps URL
async function expandUrl(url: string): Promise<string> {
  const isShort = url.includes("maps.app.goo.gl") || url.includes("goo.gl/maps");
  if (!isShort) return url;
  try {
    const res = await fetch(url, {
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    return res.url || url;
  } catch {
    return url;
  }
}

export function extractQueryFromMapsUrl(url: string): { query: string; placeId?: string } {
  try {
    const parsed = new URL(url);

    // ChIJ place ID embedded in data segment
    const pidMatch = url.match(/!1s(ChIJ[^!&]+)/);
    if (pidMatch) return { query: "", placeId: decodeURIComponent(pidMatch[1]) };

    // /maps/place/NAME/...
    const placeMatch = parsed.pathname.match(/\/maps\/place\/([^/]+)/);
    if (placeMatch) {
      return { query: decodeURIComponent(placeMatch[1].replace(/\+/g, " ")) };
    }

    // ?q= or ?query=
    const q = parsed.searchParams.get("q") ?? parsed.searchParams.get("query");
    if (q) return { query: q };

    return { query: url };
  } catch {
    return { query: url };
  }
}

async function textSearch(query: string): Promise<string | null> {
  const key = process.env.GOOGLE_PLACES_API_KEY!;
  const res = await fetch(`${BASE}/places:searchText`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": "places.id,places.displayName",
    },
    body: JSON.stringify({ textQuery: query }),
  });
  if (!res.ok) throw new Error(`Places text search failed: ${res.status}`);
  const data = await res.json();
  return (data.places?.[0]?.id as string) ?? null;
}

async function placeDetails(placeId: string): Promise<Record<string, unknown>> {
  const key = process.env.GOOGLE_PLACES_API_KEY!;
  const fields = [
    "id",
    "displayName",
    "formattedAddress",
    "nationalPhoneNumber",
    "internationalPhoneNumber",
    "websiteUri",
    "rating",
    "userRatingCount",
    "regularOpeningHours",
    "photos",
    "reviews",
    "primaryTypeDisplayName",
    "editorialSummary",
    "googleMapsUri",
  ].join(",");

  const res = await fetch(`${BASE}/places/${placeId}`, {
    headers: {
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": fields,
    },
  });
  if (!res.ok) throw new Error(`Place details failed: ${res.status}`);
  return res.json();
}

function photoUrl(photoName: string): string {
  const key = process.env.GOOGLE_PLACES_API_KEY!;
  return `${BASE}/${photoName}/media?maxHeightPx=1600&maxWidthPx=1600&key=${key}&skipHttpRedirect=true`;
}

async function resolvePhotoUrls(photoNames: string[]): Promise<string[]> {
  const urls = await Promise.allSettled(
    photoNames.slice(0, 8).map(async (name) => {
      const res = await fetch(photoUrl(name));
      if (!res.ok) return null;
      const json = await res.json();
      return (json.photoUri as string) ?? null;
    })
  );
  return urls
    .filter((r): r is PromiseFulfilledResult<string> => r.status === "fulfilled" && !!r.value)
    .map((r) => r.value);
}

function parseHours(opening: Record<string, unknown> | undefined): Record<string, string> {
  if (!opening) return {};
  const periods = opening.weekdayDescriptions as string[] | undefined;
  if (!Array.isArray(periods)) return {};
  const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  const result: Record<string, string> = {};
  periods.forEach((line, i) => {
    const colon = line.indexOf(":");
    const value = colon >= 0 ? line.slice(colon + 1).trim() : line;
    if (days[i]) result[days[i]] = value;
  });
  return result;
}

export async function fetchPlaceFromUrl(mapsUrl: string): Promise<PlaceResult> {
  const expanded = await expandUrl(mapsUrl);
  const { query, placeId: directId } = extractQueryFromMapsUrl(expanded);

  const placeId = directId ?? (await textSearch(query));
  if (!placeId) throw new Error("Place not found — check the Google Maps URL.");

  const raw = await placeDetails(placeId);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = raw as Record<string, any>;

  const photoNames: string[] = (r.photos ?? []).map(
    (p: Record<string, string>) => p.name
  );
  const images = await resolvePhotoUrls(photoNames);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reviews: PlaceReview[] = (r.reviews ?? []).map((rv: Record<string, any>) => ({
    author: rv.authorAttribution?.displayName ?? "Anonymous",
    rating: Number(rv.rating) ?? 5,
    text: rv.text?.text ?? "",
    date: rv.relativePublishTimeDescription ?? "",
  }));

  return {
    name:        r.displayName?.text ?? "",
    address:     r.formattedAddress ?? "",
    phone:       r.nationalPhoneNumber ?? r.internationalPhoneNumber ?? "",
    website:     r.websiteUri ?? "",
    rating:      Number(r.rating) || 0,
    reviewCount: Number(r.userRatingCount) || 0,
    category:    r.primaryTypeDisplayName?.text ?? "Other",
    description: r.editorialSummary?.text ?? "",
    hours:       parseHours(r.regularOpeningHours),
    images,
    reviews,
    mapsUrl:     r.googleMapsUri ?? mapsUrl,
  };
}
