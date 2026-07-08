import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/server-admin";
import { deleteUserAndData } from "@/lib/delete-user";
import { revalidateSite } from "@/lib/site-cache";
import { revalidateDash } from "@/lib/dashboard-cache";

// POST /api/admin/site — publish or expire a site
export async function POST(request: Request) {
  const gate = await requireAdmin();
  if (!gate.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id.trim() : "";
  const action = body.action;
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const admin = createAdminClient();

  if (action === "publish") {
    // years: 1–10 → expiry; null/0 → no expiry (forever)
    let publishedUntil: string | null = null;
    if (body.years != null) {
      const years = Number(body.years);
      if (!Number.isInteger(years) || years < 1 || years > 10) {
        return NextResponse.json({ error: "years must be 1–10 or null" }, { status: 400 });
      }
      const d = new Date();
      d.setFullYear(d.getFullYear() + years);
      publishedUntil = d.toISOString();
    }

    const { error } = await admin
      .from("businesses")
      .update({ published: true, published_until: publishedUntil })
      .eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Refresh the cached public page now that it's live.
    {
      const { data: row } = await admin.from("businesses").select("slug, user_id").eq("id", id).single();
      revalidateSite(row?.slug ?? null);
      revalidateDash(row?.user_id);
    }

    // Best-effort "site activated" email to the owner (never blocks the response).
    (async () => {
      try {
        const { data: biz } = await admin
          .from("businesses")
          .select("name, slug, user_id")
          .eq("id", id)
          .single();
        if (!biz || !biz.slug || biz.slug.startsWith("_tmp_")) return;

        const { data: userRes } = await admin.auth.admin.getUserById(biz.user_id);
        const ownerEmail = userRes?.user?.email;
        if (!ownerEmail) return;

        const siteUrl = `https://${biz.slug}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "syrflow.com"}`;
        const fmt = (iso: string) =>
          new Date(iso).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" });

        const { sendMail } = await import("@/lib/email/mailer");
        const { siteActivatedEmailHtml } = await import("@/lib/email/templates/site-activated");
        await sendMail(
          ownerEmail,
          "Your Site Is Now Live | موقعك أصبح مباشراً - syrflow.com",
          siteActivatedEmailHtml({
            businessName: biz.name,
            siteUrl,
            startDate: fmt(new Date().toISOString()),
            expiryDate: publishedUntil ? fmt(publishedUntil) : null,
          })
        );
      } catch (err) {
        console.error("Error sending site-activated email:", err);
      }
    })();

    return NextResponse.json({ ok: true, publishedUntil });
  }

  if (action === "expire") {
    const { data: row } = await admin.from("businesses").select("slug, user_id").eq("id", id).single();
    const { error } = await admin
      .from("businesses")
      .update({ published: false })
      .eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Refresh the cached public page so it immediately shows as unavailable.
    revalidateSite(row?.slug ?? null);
    revalidateDash(row?.user_id);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

// DELETE /api/admin/site — permanently delete a site
export async function DELETE(request: Request) {
  const gate = await requireAdmin();
  if (!gate.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const id = body && typeof body.id === "string" ? body.id.trim() : "";
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const admin = createAdminClient();

  // Grab details before deletion so we can notify the owner and clean up.
  const { data: biz } = await admin
    .from("businesses")
    .select("name, slug, user_id, created_at")
    .eq("id", id)
    .single();

  if (!biz) return NextResponse.json({ error: "Site not found" }, { status: 404 });

  // Capture the owner's email before we delete the auth user.
  let ownerEmail: string | undefined;
  try {
    const { data: userRes } = await admin.auth.admin.getUserById(biz.user_id);
    ownerEmail = userRes?.user?.email ?? undefined;
  } catch (err) {
    console.error("Failed to look up site owner before deletion:", err);
  }

  // Fully remove the owner: R2 images + all their business rows + auth user.
  const result = await deleteUserAndData(admin, biz.user_id);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 500 });

  // Drop the deleted site's cached page + the owner's cached dashboard data.
  revalidateSite(biz.slug);
  revalidateDash(biz.user_id);

  // Best-effort "site removed" email to the owner (never blocks the response).
  (async () => {
    try {
      if (!ownerEmail || (biz.slug && biz.slug.startsWith("_tmp_"))) return;
      const registeredDate = biz.created_at
        ? new Date(biz.created_at).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })
        : "—";

      const { sendMail } = await import("@/lib/email/mailer");
      const { siteDeletedEmailHtml } = await import("@/lib/email/templates/site-deleted");
      await sendMail(
        ownerEmail,
        "Your Site Has Been Removed | تم حذف موقعك - syrflow.com",
        siteDeletedEmailHtml({ businessName: biz.name, registeredDate })
      );
    } catch (err) {
      console.error("Error sending site-deleted email:", err);
    }
  })();

  return NextResponse.json({ ok: true });
}
