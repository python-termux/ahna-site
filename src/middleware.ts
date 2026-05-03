import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "syrflow.com";
const APP_SUBDOMAINS = new Set(["app", "www", "api", "dashboard", "mail", "smtp"]);

function securityHeaders(res: NextResponse): NextResponse {
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.headers.set("X-DNS-Prefetch-Control", "off");
  return res;
}

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const hostWithoutPort = host.split(":")[0];
  const { pathname } = request.nextUrl;

  const isApex = hostWithoutPort === ROOT_DOMAIN || hostWithoutPort === `www.${ROOT_DOMAIN}`;
  const isApp  = hostWithoutPort === `app.${ROOT_DOMAIN}`;
  const isLocal = hostWithoutPort === "localhost" || hostWithoutPort === "127.0.0.1";

  // ── Subdomain routing (user sites) ────────────────────────────────────────
  if (!isApex && !isApp && !isLocal && hostWithoutPort.endsWith(`.${ROOT_DOMAIN}`)) {
    const slug = hostWithoutPort.slice(0, -(ROOT_DOMAIN.length + 1));
    if (slug && !APP_SUBDOMAINS.has(slug) && !pathname.startsWith("/site/")) {
      const url = request.nextUrl.clone();
      url.pathname = `/site/${slug}${pathname === "/" ? "" : pathname}`;
      const res = NextResponse.rewrite(url);
      securityHeaders(res);
      return res; // ✅ early return, skip auth guard
    }
    // any other subdomain — skip auth guard
    const res = NextResponse.next({ request });
    securityHeaders(res);
    return res;
  }

  // ── app.syrflow.com root → /dashboard ─────────────────────────────────────
  if (isApp && pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // ── Redirect /site/[slug] → [slug].syrflow.com ────────────────────────────
  if ((isApex || isApp) && pathname.startsWith("/site/")) {
    const slug = pathname.split("/")[2];
    if (slug) {
      const url = request.nextUrl.clone();
      url.hostname = `${slug}.${ROOT_DOMAIN}`;
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  // ── App routes on apex → redirect to app.syrflow.com ──────────────────────
  const APP_ROUTES = ["/dashboard", "/auth", "/register"];
  if (isApex && APP_ROUTES.some((r) => pathname.startsWith(r))) {
    const url = request.nextUrl.clone();
    url.hostname = `app.${ROOT_DOMAIN}`;
    return NextResponse.redirect(url);
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
    url.hostname = `app.${ROOT_DOMAIN}`;
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  securityHeaders(supabaseResponse);
  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|fonts/|social-icons/|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};