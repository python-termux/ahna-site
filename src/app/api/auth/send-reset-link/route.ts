import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server-admin";
import { NextResponse } from "next/server";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";

export const runtime = "nodejs";

// POST /api/auth/send-reset-link — emails a password-reset link to the logged-in
// user. We generate a recovery token_hash server-side and link to OUR page
// (/auth/reset-password?token_hash=...&type=recovery), which verifies via
// client-side JS. Email scanners do a plain GET and don't run JS, so the
// single-use token isn't consumed before the user clicks it.
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 3 reset emails per hour per user
  const rl = rateLimit(`reset-link:${user.id}`, 3, 3600);
  if (!rl.ok) return tooManyRequests(rl.retryAfter);

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.generateLink({
    type: "recovery",
    email: user.email,
  });

  const tokenHash = data?.properties?.hashed_token;
  if (error || !tokenHash) {
    return NextResponse.json({ error: "Failed to create reset link" }, { status: 500 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.syrflow.com";
  const resetUrl = `${appUrl}/auth/reset-password?token_hash=${encodeURIComponent(tokenHash)}&type=recovery`;

  try {
    const { sendMail } = await import("@/lib/email/mailer");
    const { resetPasswordEmailHtml } = await import("@/lib/email/templates/reset-password");
    await sendMail(
      user.email,
      "Reset your password | إعادة تعيين كلمة المرور - syrflow.com",
      resetPasswordEmailHtml({ resetUrl })
    );
  } catch (err) {
    console.error("Error sending reset email:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
