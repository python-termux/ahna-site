import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/server-admin";

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
    return NextResponse.json({ ok: true, publishedUntil });
  }

  if (action === "expire") {
    const { error } = await admin
      .from("businesses")
      .update({ published: false })
      .eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
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
  const { error } = await admin.from("businesses").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
