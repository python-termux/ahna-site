import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "syrflow.com";

export async function createClient() {
  const cookieStore = await cookies();
  const headerStore = await headers();

  // Share the auth cookie across all *.syrflow.com subdomains (owner preview).
  // Undefined on localhost / preview hosts so login keeps working there.
  const host = (headerStore.get("host") ?? "").split(":")[0];
  const domain =
    host === ROOT_DOMAIN || host.endsWith(`.${ROOT_DOMAIN}`) ? `.${ROOT_DOMAIN}` : undefined;

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, domain ? { ...options, domain } : options)
            );
          } catch {}
        },
      },
    }
  );
}
