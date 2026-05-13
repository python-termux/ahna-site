import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendMail } from "@/lib/email/mailer";
import { passwordChangedEmailHtml } from "@/lib/email/templates/password-changed";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await sendMail(
      user.email!,
      "Your Password Changed | تم تغيير كلمة المرور - syrflow.com",
      passwordChangedEmailHtml({ userEmail: user.email! })
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error sending password changed email:", error);
    // Fire-and-forget — don't fail
    return NextResponse.json({ ok: true });
  }
}
