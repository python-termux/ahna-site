// In-memory sliding-window rate limiter
// Works correctly for single-process deployments (dev + Vercel edge/lambda)

interface Entry { count: number; resetAt: number }

const store = new Map<string, Entry>();

// Prune expired entries every 5 minutes to avoid memory growth
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of store) if (v.resetAt <= now) store.delete(k);
}, 5 * 60 * 1000).unref?.();

export interface RateLimitResult {
  ok: boolean;
  retryAfter: number; // seconds until window resets (0 when ok)
  remaining: number;
}

export function rateLimit(key: string, limit: number, windowSec: number): RateLimitResult {
  const now = Date.now();
  const windowMs = windowSec * 1000;
  let e = store.get(key);

  if (!e || e.resetAt <= now) {
    e = { count: 1, resetAt: now + windowMs };
    store.set(key, e);
    return { ok: true, retryAfter: 0, remaining: limit - 1 };
  }

  e.count++;
  if (e.count > limit) {
    return { ok: false, retryAfter: Math.ceil((e.resetAt - now) / 1000), remaining: 0 };
  }
  return { ok: true, retryAfter: 0, remaining: limit - e.count };
}

export function tooManyRequests(retryAfter: number): Response {
  return new Response(
    JSON.stringify({ error: "Too many requests — please wait before trying again.", retryAfter }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfter),
        "X-RateLimit-Remaining": "0",
      },
    }
  );
}
