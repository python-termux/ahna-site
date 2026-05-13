import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendMail } from "@/lib/email/mailer";
import { welcomeEmailHtml } from "@/lib/email/templates/welcome";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const businessName =
    typeof body?.businessName === "string" ? body.businessName.slice(0, 100) : "";

  try {
    await sendMail(user.email!, "Welcome to Syria Flow | مرحباً بك في سوريا فلو", welcomeEmailHtml({ businessName }));
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error sending welcome email:", error);
    // Don't fail the response — fire-and-forget
    return NextResponse.json({ ok: true });
  }
}
