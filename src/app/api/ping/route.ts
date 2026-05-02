import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const supabase = await createClient();
    // Cheapest possible query — just check the connection
    const { error } = await supabase.from("businesses").select("id").limit(1);
    if (error) throw error;
    return NextResponse.json({ ok: true, ts: Date.now() });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
