import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server-admin";

export const runtime = "nodejs";

// Reminder offsets (days before expiry). Two reminders for paid sites.
const REMINDER_DAYS = [7, 3];

function startOfUtcDayPlus(days: number): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function fmt(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" });
}

// GET /api/cron/expiry-reminders — run daily. Sends a renewal reminder to paid
// sites whose expiry date is exactly 7 or 3 days away. The calendar-day window
// means each site gets each reminder once (when run once per day).
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });

  const url = new URL(request.url);
  const auth = request.headers.get("authorization");
  const provided = auth?.replace(/^Bearer\s+/i, "") || url.searchParams.get("secret");
  if (provided !== secret) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  let sent = 0;
  const results: Record<string, number> = {};

  for (const days of REMINDER_DAYS) {
    const start = startOfUtcDayPlus(days);
    const end = startOfUtcDayPlus(days + 1);

    const { data: rows } = await admin
      .from("businesses")
      .select("name, slug, user_id, published_until")
      .eq("published", true)
      .gte("published_until", start.toISOString())
      .lt("published_until", end.toISOString());

    let count = 0;
    for (const biz of rows ?? []) {
      if (!biz.user_id || !biz.slug || biz.slug.startsWith("_tmp_") || !biz.published_until) continue;
      try {
        const { data: userRes } = await admin.auth.admin.getUserById(biz.user_id);
        const email = userRes?.user?.email;
        if (!email) continue;

        const siteUrl = `https://${biz.slug}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "syrflow.com"}`;
        const { sendMail } = await import("@/lib/email/mailer");
        const { siteExpiringEmailHtml } = await import("@/lib/email/templates/site-expiring");
        await sendMail(
          email,
          "Your site is expiring soon | اشتراك موقعك على وشك الانتهاء - syrflow.com",
          siteExpiringEmailHtml({
            businessName: biz.name,
            siteUrl,
            expiryDate: fmt(biz.published_until),
            daysLeft: days,
          })
        );
        count++;
        sent++;
      } catch (err) {
        console.error("Error sending expiry reminder:", err);
      }
    }
    results[`${days}d`] = count;
  }

  // ── Trial reminder: unactivated sites on day 6 (one day before removal) ─────
  {
    const start = startOfUtcDayPlus(-6); // registered 6 calendar days ago
    const end = startOfUtcDayPlus(-5);

    const { data: rows } = await admin
      .from("businesses")
      .select("name, slug, user_id, created_at")
      .eq("published", false)
      .gte("created_at", start.toISOString())
      .lt("created_at", end.toISOString());

    let count = 0;
    for (const biz of rows ?? []) {
      if (!biz.user_id || !biz.slug || biz.slug.startsWith("_tmp_") || !biz.created_at) continue;
      try {
        const { data: userRes } = await admin.auth.admin.getUserById(biz.user_id);
        const email = userRes?.user?.email;
        if (!email) continue;

        const { sendMail } = await import("@/lib/email/mailer");
        const { siteTrialReminderEmailHtml } = await import("@/lib/email/templates/site-trial-reminder");
        await sendMail(
          email,
          "Your free trial ends tomorrow | تنتهي فترتك التجريبية غداً - syrflow.com",
          siteTrialReminderEmailHtml({ businessName: biz.name, registeredDate: fmt(biz.created_at) })
        );
        count++;
        sent++;
      } catch (err) {
        console.error("Error sending trial reminder:", err);
      }
    }
    results["trial6d"] = count;
  }

  return NextResponse.json({ ok: true, sent, results });
}
