import { NextResponse } from "next/server";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { validateEmail } from "@/lib/validation";
import { issueOtp, OtpPurpose } from "@/lib/otp";
import { sendMail } from "@/lib/email/mailer";
import { otpEmailHtml } from "@/lib/email/templates/otp";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const VALID_PURPOSES = new Set<string>(["login", "password_change"]);

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const purpose = typeof body.purpose === "string" ? body.purpose : "";

  const emailValidation = validateEmail(email);
  if (!emailValidation.valid)
    return NextResponse.json({ error: emailValidation.error }, { status: 400 });
  if (!VALID_PURPOSES.has(purpose))
    return NextResponse.json({ error: "Invalid purpose" }, { status: 400 });

  // For password_change: require authenticated session
  if (purpose === "password_change") {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // Ensure the email matches the authenticated user
    if (user.email !== email)
      return NextResponse.json({ error: "Email mismatch" }, { status: 403 });
  }

  // Rate limit: 3 per hour per email per purpose
  const rl = rateLimit(`otp-send:${purpose}:${email}`, 3, 3600);
  if (!rl.ok) return tooManyRequests(rl.retryAfter);

  try {
    const code = await issueOtp(email, purpose as OtpPurpose);
    const subject =
      purpose === "login"
        ? "رمز التحقق — syrflow.com"
        : "رمز تغيير كلمة المرور — syrflow.com";
    await sendMail(email, subject, otpEmailHtml({ code, purpose: purpose as OtpPurpose }));
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return NextResponse.json({ error: "Failed to send code" }, { status: 500 });
  }
}
