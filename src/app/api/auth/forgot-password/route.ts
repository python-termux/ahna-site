import { createAdminClient } from "@/lib/supabase/server-admin";
import { NextResponse } from "next/server";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { validateEmail } from "@/lib/validation";

export const runtime = "nodejs";

// POST /api/auth/forgot-password — public password-reset request (from the login
// page). Emails a scanner-safe reset link (token_hash verified by client JS).
// Always responds ok to avoid leaking whether an email is registered.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";

  const ev = validateEmail(email);
  if (!ev.valid) return NextResponse.json({ error: ev.error || "Invalid email" }, { status: 400 });

  // 3 requests per hour per email
  const rl = rateLimit(`forgot-password:${email.toLowerCase()}`, 3, 3600);
  if (!rl.ok) return tooManyRequests(rl.retryAfter);

  try {
    const admin = createAdminClient();
    const { data } = await admin.auth.admin.generateLink({ type: "recovery", email });
    const tokenHash = data?.properties?.hashed_token;

    // Only send if the account exists (generateLink returns a token). Otherwise
    // we silently succeed — no account enumeration.
    if (tokenHash) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.syrflow.com";
      const resetUrl = `${appUrl}/auth/reset-password?token_hash=${encodeURIComponent(tokenHash)}&type=recovery`;
      const { sendMail } = await import("@/lib/email/mailer");
      const { resetPasswordEmailHtml } = await import("@/lib/email/templates/reset-password");
      await sendMail(
        email,
        "Reset your password | إعادة تعيين كلمة المرور - syrflow.com",
        resetPasswordEmailHtml({ resetUrl })
      );
    }
  } catch (err) {
    console.error("Error sending forgot-password email:", err);
    // Still return ok — don't reveal anything to the caller.
  }

  return NextResponse.json({ ok: true });
}
