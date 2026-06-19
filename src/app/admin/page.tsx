import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server-admin";
import { isAdminEmail } from "@/lib/admin";
import AdminClient, { type AdminRow } from "./AdminClient";
import AdminDenied from "./AdminDenied";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");
  if (!isAdminEmail(user.email)) return <AdminDenied email={user.email ?? ""} />;

  const admin = createAdminClient();

  // All businesses
  const { data: businesses } = await admin
    .from("businesses")
    .select("id, name, slug, user_id, created_at, published, published_until")
    .order("created_at", { ascending: false });

  // Map user_id → { email, created_at } via the auth admin API (paginated)
  const emailById = new Map<string, { email: string; createdAt: string }>();
  let page = 1;
  // Fetch up to ~10k users (200 per page × 50 pages) — plenty for now
  for (; page <= 50; page++) {
    const { data: list } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    const users = list?.users ?? [];
    for (const u of users) {
      if (u.email) emailById.set(u.id, { email: u.email, createdAt: u.created_at });
    }
    if (users.length < 200) break;
  }

  const rows: AdminRow[] = (businesses ?? []).map((b) => {
    const u = emailById.get(b.user_id);
    const isTmp = b.slug.startsWith("_tmp_");
    return {
      id: b.id,
      name: b.name || "(untitled)",
      slug: isTmp ? "" : b.slug,
      email: u?.email ?? "—",
      registeredAt: u?.createdAt ?? b.created_at,
      published: b.published,
      publishedUntil: b.published_until,
      isTmp,
    };
  });

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "syrflow.com";

  return <AdminClient rows={rows} adminEmail={user.email ?? ""} rootDomain={rootDomain} />;
}
