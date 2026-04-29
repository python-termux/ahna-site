import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "ahna.ae";

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const hostWithoutPort = host.split(":")[0];
  const { pathname } = request.nextUrl;

  // ── Subdomain routing ──────────────────────────────────────────────────────
  // mybiz.ahna.ae  →  rewrite to /site/mybiz
  const isApex = hostWithoutPort === ROOT_DOMAIN || hostWithoutPort === `www.${ROOT_DOMAIN}`;
  const isLocal = hostWithoutPort === "localhost" || hostWithoutPort === "127.0.0.1";

  if (!isApex && !isLocal && hostWithoutPort.endsWith(`.${ROOT_DOMAIN}`)) {
    const slug = hostWithoutPort.slice(0, -(ROOT_DOMAIN.length + 1));
    if (slug && !pathname.startsWith("/site/")) {
      const url = request.nextUrl.clone();
      url.pathname = `/site/${slug}${pathname === "/" ? "" : pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  // ── Demo bypass ────────────────────────────────────────────────────────────
  if (request.cookies.get("shirka_demo")?.value === "1") {
    return NextResponse.next({ request });
  }

  // ── Supabase session + auth guard ──────────────────────────────────────────
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (pathname.startsWith("/dashboard") && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
