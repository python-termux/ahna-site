import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "syrflow.com";
const APP_SUBDOMAINS = new Set(["app", "www", "api", "dashboard", "mail", "smtp", "admin"]);

function securityHeaders(res: NextResponse): NextResponse {
  // Prevent MIME type sniffing
  res.headers.set("X-Content-Type-Options", "nosniff");

  // Control referrer information
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Disable dangerous APIs
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");

  // Prevent DNS prefetch which can leak hostnames
  res.headers.set("X-DNS-Prefetch-Control", "off");

  // XSS protection for older browsers
  res.headers.set("X-XSS-Protection", "1; mode=block");

  // Prevent clickjacking attacks
  res.headers.set("X-Frame-Options", "SAMEORIGIN");

  // Content Security Policy - strict but allows necessary resources
  res.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' *.vercel.app cdn.jsdelivr.net; " +
    "style-src 'self' 'unsafe-inline' cdn.jsdelivr.net; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' data:; " +
    "connect-src 'self' https:; " +
    "frame-ancestors 'self'; " +
    "base-uri 'self'; " +
    "form-action 'self';"
  );

  // Strict Transport Security
  res.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");

  return res;
}

// True only when Supabase says the refresh token itself is invalid/revoked
// (400-class auth error mentioning the refresh token, or its known codes) —
// never for network/transient failures, which have no such code/message.
// Variants seen in the wild: "Invalid Refresh Token: Refresh Token Not Found",
// "Refresh token is not valid", codes refresh_token_not_found / _already_used.
function isDeadRefreshToken(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { code?: string; status?: number; message?: string };
  if (e.code === "refresh_token_not_found" || e.code === "refresh_token_already_used") return true;
  const msg = e.message ?? "";
  return (e.status === undefined || (e.status >= 400 && e.status < 500)) &&
    /refresh token/i.test(msg) &&
    /not valid|invalid|not found|already used|revoked/i.test(msg);
}

export async function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const hostWithoutPort = host.split(":")[0];
  const { pathname } = request.nextUrl;

  const isApex = hostWithoutPort === ROOT_DOMAIN || hostWithoutPort === `www.${ROOT_DOMAIN}`;
  const isApp = hostWithoutPort === `app.${ROOT_DOMAIN}`;
  const isAdminHost = hostWithoutPort === `admin.${ROOT_DOMAIN}`;
  const isLocal = hostWithoutPort === "localhost" || hostWithoutPort === "127.0.0.1";

  // Share the auth cookie across *.syrflow.com so login persists on subdomains.
  const cookieDomain =
    hostWithoutPort === ROOT_DOMAIN || hostWithoutPort.endsWith(`.${ROOT_DOMAIN}`)
      ? `.${ROOT_DOMAIN}`
      : undefined;

  // ── Refresh the Supabase session — ONLY on authenticated hosts ────────────
  // Token refresh can't be persisted from a Server Component render, so we do it
  // here (middleware) where Set-Cookie is allowed. We skip it entirely for public
  // user sites (slug.syrflow.com) and the marketing apex, so a public visit (or a
  // logged-in user browsing a public page) never costs a Supabase auth call.
  // Skip /api/* (route handlers run their own getUser and can set cookies) and
  // requests carrying no Supabase cookie — avoids burning Supabase's per-IP auth
  // rate limit with redundant calls (seen as login 429s + dashboard bounce on mobile).
  const hasSbCookie = request.cookies.getAll().some((c) => c.name.startsWith("sb-"));
  const needsAuth = (isApp || isAdminHost) && hasSbCookie && !pathname.startsWith("/api");
  const refreshedCookies: { name: string; value: string; options: CookieOptions }[] = [];
  let deadSession = false;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (needsAuth && supabaseUrl && supabaseKey) {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            refreshedCookies.push({ name, value, options });
          });
        },
      },
    });
    try {
      const { data, error } = await supabase.auth.getUser();
      // Only persist refreshed cookies for a confirmed user. This prevents a
      // transient validation failure from writing sign-out/clearing cookies and
      // wiping a freshly-created session (seen on mobile right after register).
      if (!data.user) {
        refreshedCookies.length = 0;
        // BUT: a definitively-dead refresh token must be cleared, or every
        // subsequent request retries the refresh and hammers /token until
        // Supabase rate-limits the IP — which then 429s even fresh password
        // logins (seen in auth logs as refresh_token 400/429 storms on mobile).
        if (isDeadRefreshToken(error)) deadSession = true;
      }
    } catch (error) {
      // Network/refresh errors must not break routing — and must not clear cookies.
      refreshedCookies.length = 0;
      if (isDeadRefreshToken(error)) deadSession = true;
    }
  }

  // Apply refreshed auth cookies + security headers to any outgoing response.
  function finalize(res: NextResponse): NextResponse {
    refreshedCookies.forEach(({ name, value, options }) =>
      res.cookies.set(name, value, cookieDomain ? { ...options, domain: cookieDomain } : options)
    );
    if (deadSession) {
      // Expire every Supabase auth cookie — both the shared-domain variant and
      // any host-only leftover — so the dead refresh token stops being resent.
      for (const c of request.cookies.getAll()) {
        if (!c.name.startsWith("sb-")) continue;
        res.headers.append("Set-Cookie", `${c.name}=; Path=/; Max-Age=0`);
        if (cookieDomain) {
          res.headers.append("Set-Cookie", `${c.name}=; Path=/; Max-Age=0; Domain=${cookieDomain}`);
        }
      }
    }
    return securityHeaders(res);
  }

  // ── admin.syrflow.com → /admin/* ──────────────────────────────────────────
  if (isAdminHost) {
    // Let API routes pass through untouched; rewrite everything else under /admin.
    if (!pathname.startsWith("/admin") && !pathname.startsWith("/api")) {
      const url = request.nextUrl.clone();
      url.pathname = `/admin${pathname === "/" ? "" : pathname}`;
      return finalize(NextResponse.rewrite(url, { request }));
    }
    return finalize(NextResponse.next({ request }));
  }

  // ── Subdomain routing (user sites) ────────────────────────────────────────
  if (!isApex && !isApp && !isLocal && hostWithoutPort.endsWith(`.${ROOT_DOMAIN}`)) {
    const slug = hostWithoutPort.slice(0, -(ROOT_DOMAIN.length + 1));
    if (slug && !APP_SUBDOMAINS.has(slug) && !pathname.startsWith("/site/")) {
      const url = request.nextUrl.clone();
      url.pathname = `/site/${slug}${pathname === "/" ? "" : pathname}`;
      return finalize(NextResponse.rewrite(url, { request }));
    }
    return finalize(NextResponse.next({ request }));
  }

  // ── app.syrflow.com root → /dashboard ─────────────────────────────────────
  if (isApp && pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return finalize(NextResponse.redirect(url));
  }

  // ── Redirect /site/[slug] → [slug].syrflow.com ────────────────────────────
  if ((isApex || isApp) && pathname.startsWith("/site/")) {
    const slug = pathname.split("/")[2];
    if (slug) {
      const url = request.nextUrl.clone();
      url.hostname = `${slug}.${ROOT_DOMAIN}`;
      url.pathname = "/";
      return finalize(NextResponse.redirect(url));
    }
  }

  // ── App routes on apex → redirect to app.syrflow.com ──────────────────────
  const APP_ROUTES = ["/dashboard", "/auth", "/register"];
  if (isApex && APP_ROUTES.some((r) => pathname.startsWith(r))) {
    const url = request.nextUrl.clone();
    url.hostname = `app.${ROOT_DOMAIN}`;
    return finalize(NextResponse.redirect(url));
  }

  return finalize(NextResponse.next({ request }));
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|fonts/|social-icons/|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
