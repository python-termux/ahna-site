import { createClient } from "@/lib/supabase/server";

/** Comma-separated allowlist of admin emails from env, lowercased. */
export function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.toLowerCase());
}

/**
 * Verify the current session belongs to an allowlisted admin.
 * Returns { ok, email } — never throws.
 */
export async function requireAdmin(): Promise<{ ok: boolean; email?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) return { ok: false };
  return { ok: true, email: user.email! };
}
