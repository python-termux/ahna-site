import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { validateEmail, validatePassword } from "@/lib/validation";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";

export const runtime = "nodejs";

// POST /api/auth/register — create the account on the SERVER so the session
// cookies are returned as real Set-Cookie headers (reliably stored by the
// browser) instead of being written by client-side JS. This guarantees the
// session exists before the client navigates to /dashboard — no bounce to login.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  const ev = validateEmail(email);
  if (!ev.valid) return NextResponse.json({ error: ev.error || "Invalid email" }, { status: 400 });
  const pv = validatePassword(password);
  if (!pv.valid) return NextResponse.json({ error: pv.error || "Invalid password" }, { status: 400 });

  // 5 signups per hour per email (abuse guard)
  const rl = rateLimit(`register:${email.toLowerCase()}`, 5, 3600);
  if (!rl.ok) return tooManyRequests(rl.retryAfter);

  const supabase = await createClient();

  const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({ email, password });
  if (signUpErr) return NextResponse.json({ error: signUpErr.message }, { status: 400 });

  // If email confirmation is off, signUp already returns a session (cookies set).
  // If it didn't, sign in explicitly so the session cookies are written.
  if (!signUpData.session) {
    const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
    if (signInErr) {
      return NextResponse.json(
        { error: signInErr.message || "Account created but sign-in failed. Please log in." },
        { status: 400 }
      );
    }
  }

  // Confirm the session and return its tokens so the client can also write the
  // cookies via setSession() — mobile browsers don't reliably persist cookies
  // from a fetch() Set-Cookie header, so this guarantees the session sticks.
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: "Could not establish a session. Please log in." }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  });
}
