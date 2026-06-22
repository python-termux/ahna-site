import { unstable_cache, revalidateTag } from "next/cache";
import { createClient } from "@supabase/supabase-js";

// One cache tag per published site. Revalidating it refreshes that site's page.
export function siteTag(slug: string): string {
  return `site:${slug}`;
}

// Cookieless anon client — cacheable (no per-request cookies/headers).
function publicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

// Public read of a business by slug, served from the Next.js Data Cache.
// Supabase is only queried on the first request, after the fallback revalidate
// window, or when the site's tag is revalidated on a DB change — so repeated
// public visits cost zero Supabase usage.
export function getCachedBusinessBySlug<T = unknown>(slug: string): Promise<T | null> {
  return unstable_cache(
    async () => {
      const sb = publicClient();
      const { data } = await sb.from("businesses").select("*").eq("slug", slug).single();
      return (data as T) ?? null;
    },
    ["site-business", slug],
    { tags: [siteTag(slug)], revalidate: 3600 } // 1h fallback; on-demand on changes
  )();
}

// Call after any DB change to a business so its cached public page refreshes.
export function revalidateSite(slug: string | null | undefined): void {
  if (!slug || slug.startsWith("_tmp_")) return;
  // "max" = stale-while-revalidate: keep serving the cached page, refresh in the
  // background on the next visit. Must be called from a route handler (not Proxy).
  revalidateTag(siteTag(slug), "max");
}
