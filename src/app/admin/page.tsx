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

  // Read the site list with the public-read client — works regardless of the
  // service-role key, so the admin always sees every site.
  const { data: businesses } = await supabase
    .from("businesses")
    .select("*")
    .order("created_at", { ascending: false });

  // Map user_id → { email, created_at } via the auth admin API (needs the
  // service-role key). Best-effort: if the key is missing/wrong, emails just
  // show "—" instead of crashing the page.
  const emailById = new Map<string, { email: string; createdAt: string }>();
  try {
    const admin = createAdminClient();
    for (let page = 1; page <= 50; page++) {
      const { data: list } = await admin.auth.admin.listUsers({ page, perPage: 200 });
      const users = list?.users ?? [];
      for (const u of users) {
        if (u.email) emailById.set(u.id, { email: u.email, createdAt: u.created_at });
      }
      if (users.length < 200) break;
    }
  } catch {
    // service-role key not usable — fall back to "—" emails
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
      published: b.published ?? false,
      publishedUntil: b.published_until ?? null,
      isTmp,
    };
  });

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "syrflow.com";

  return <AdminClient rows={rows} adminEmail={user.email ?? ""} rootDomain={rootDomain} />;
}
