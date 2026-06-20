import { createClient } from "@/lib/supabase/server";
import { createClient as createAdmin } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { deleteUserAndData } from "@/lib/delete-user";

export async function DELETE() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  // 3 attempts per day — prevents abuse of the admin delete call
  const rl = rateLimit(`delete-account:${user.id}`, 3, 86400);
  if (!rl.ok) return tooManyRequests(rl.retryAfter);

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });

  const admin = createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey);

  // Removes R2 images + all business rows + the auth user.
  const result = await deleteUserAndData(admin, user.id);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 500 });

  return NextResponse.json({ ok: true });
}
