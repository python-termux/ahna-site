import { NextRequest, NextResponse } from "next/server";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";

function ip(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "anon"
  );
}

export function middleware(req: NextRequest) {
  const { pathname, method } = req.nextUrl;
  const clientIp = ip(req);

  // ── Per-IP rate limits for public / cheap-to-abuse endpoints ─────────────

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

  // Auth callback — 10 per minute (prevents token replay flooding)
  if (pathname === "/api/auth/callback") {
    const rl = rateLimit(`auth-cb:${clientIp}`, 10, 60);
    if (!rl.ok) return tooManyRequests(rl.retryAfter);
  }

  // ── Security headers on every response ───────────────────────────────────
  const res = NextResponse.next();
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.headers.set("X-DNS-Prefetch-Control", "off");

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|fonts/|social-icons/|images/).*)"],
};
