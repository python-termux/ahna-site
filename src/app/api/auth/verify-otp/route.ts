import { NextResponse } from "next/server";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { validateEmail } from "@/lib/validation";
import { verifyOtp, OtpPurpose } from "@/lib/otp";
import { createAdminClient } from "@/lib/supabase/server-admin";

export const runtime = "nodejs";

const VALID_PURPOSES = new Set<string>(["login", "password_change"]);

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const code = typeof body.code === "string" ? body.code.trim() : "";
  const purpose = typeof body.purpose === "string" ? body.purpose : "";

  const emailValidation = validateEmail(email);
  if (!emailValidation.valid)
    return NextResponse.json({ error: emailValidation.error }, { status: 400 });
  if (!VALID_PURPOSES.has(purpose))
    return NextResponse.json({ error: "Invalid purpose" }, { status: 400 });
  if (!/^\d{6}$/.test(code))
    return NextResponse.json({ error: "Code must be 6 digits" }, { status: 400 });

  // Rate limit: 5 attempts per 15 minutes per email
  const rl = rateLimit(`otp-verify:${email}`, 5, 900);
  if (!rl.ok) return tooManyRequests(rl.retryAfter);

  try {
    const valid = await verifyOtp(email, code, purpose as OtpPurpose);
    if (!valid) {
      console.error("OTP verification failed", { email, code: code.slice(0, 2) + "****", purpose });
      return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
    }

    if (purpose === "login") {
      // Generate a magic link for session creation
      const admin = createAdminClient();
      const { data, error } = await admin.auth.admin.generateLink({
        type: "magiclink",
        email,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://app.syrflow.com"}/auth/callback`,
        },
      });

      if (error || !data?.properties?.action_link) {
        return NextResponse.json({ error: "Session creation failed" }, { status: 500 });
      }

      const response = NextResponse.json({
        ok: true,
        redirectUrl: data.properties.action_link,
      });
      // Clear the otp_pending cookie
      response.cookies.set("otp_pending", "", { maxAge: 0, path: "/" });
      return response;
    }

    // For password_change: just confirm verified
    const response = NextResponse.json({ ok: true, verified: true });
    return response;
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
