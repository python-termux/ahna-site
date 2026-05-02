import { NextRequest, NextResponse } from "next/server";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "syrflow.com";

// These subdomains belong to the main app — never rewrite them to /site/
const APP_SUBDOMAINS = new Set(["app", "www", "api", "dashboard", "mail", "smtp"]);

function ip(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "anon"
  );
}

function securityHeaders(res: NextResponse): NextResponse {
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.headers.set("X-DNS-Prefetch-Control", "off");
  return res;
}

export function middleware(req: NextRequest) {
  const hostname = req.headers.get("host") ?? "";
  const { pathname } = req.nextUrl;
  const { method } = req;
  const clientIp = ip(req);

  // ── Subdomain routing: {slug}.syrflow.com → /site/{slug} ──────────────────
  // Must run FIRST — this is what makes user sites work at all
  if (hostname.endsWith(`.${ROOT_DOMAIN}`)) {
    const subdomain = hostname.slice(0, -(ROOT_DOMAIN.length + 1));
    if (subdomain && !APP_SUBDOMAINS.has(subdomain)) {
      const url = req.nextUrl.clone();
      url.pathname = pathname === "/" ? `/site/${subdomain}` : `/site/${subdomain}${pathname}`;
      const res = NextResponse.rewrite(url);
      securityHeaders(res);
      return res;
    }
  }

  // ── Per-IP rate limits for main app endpoints ──────────────────────────────

  // Public places preview (no auth) — 5 per minute
  if (pathname === "/api/places/preview") {
    const rl = rateLimit(`preview:${clientIp}`, 5, 60);
    if (!rl.ok) return tooManyRequests(rl.retryAfter);
  }

  // Slug availability check — 30 per minute
  if (pathname === "/api/set-slug" && method === "GET") {
    const rl = rateLimit(`slug-check:${clientIp}`, 30, 60);
    if (!rl.ok) return tooManyRequests(rl.retryAfter);
  }

  // Auth callback — 10 per minute
  if (pathname === "/api/auth/callback") {
    const rl = rateLimit(`auth-cb:${clientIp}`, 10, 60);
    if (!rl.ok) return tooManyRequests(rl.retryAfter);
  }

  // ── Security headers on all main app responses ─────────────────────────────
  const res = NextResponse.next();
  res.headers.set("X-Frame-Options", "DENY");
  securityHeaders(res);
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|fonts/|social-icons/|images/).*)"],
};
