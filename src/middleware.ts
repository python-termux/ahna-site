import { NextRequest, NextResponse } from "next/server";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "syrflow.com";

const APP_SUBDOMAINS = new Set(["app", "www", "api", "dashboard", "mail", "smtp"]);

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

  // ── Subdomain routing: {slug}.syrflow.com → /site/{slug} ──────────────────
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

  // ── Security headers on all main app responses ─────────────────────────────
  const res = NextResponse.next();
  res.headers.set("X-Frame-Options", "DENY");
  securityHeaders(res);
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|fonts/|social-icons/|images/).*)"],
};
