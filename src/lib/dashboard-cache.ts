import { unstable_cache, revalidateTag } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server-admin";

// One cache tag per user's dashboard data. Revalidating it refreshes the
// cached businesses list after any write.
export function dashTag(userId: string): string {
  return `dash:${userId}`;
}

// The user's businesses, served from the Next.js Data Cache. Supabase is only
// queried on the first dashboard visit, after the fallback window, or when the
// user's tag is revalidated by a write — so repeat visits / tab switches cost
// zero Supabase usage. The userId always comes from a verified auth.getUser()
// call in the caller, so filtering with the admin client is safe.
export function getCachedBusinessesByUser<T = unknown>(userId: string): Promise<T[]> {
  return unstable_cache(
    async () => {
      const sb = createAdminClient();
      const { data } = await sb
        .from("businesses")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      return (data as T[]) ?? [];
    },
    ["dash-businesses", userId],
    { tags: [dashTag(userId)], revalidate: 300 } // 5 min fallback; on-demand on writes
  )();
}

// Call after any DB write that affects a user's businesses so their next
// dashboard render sees fresh data. Must run in a route handler.
export function revalidateDash(userId: string | null | undefined): void {
  if (!userId) return;
  revalidateTag(dashTag(userId), "max");
}
