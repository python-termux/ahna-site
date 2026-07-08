import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";
import AuthRecover from "./AuthRecover";
import { getCachedBusinessesByUser } from "@/lib/dashboard-cache";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ r?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // First miss: let the client confirm its session and reload once (handles
    // the mobile cookie-commit race). Only redirect to login after that retry.
    if (sp?.r !== "1") return <AuthRecover />;
    redirect("/auth/login");
  }

  // Served from the Next.js Data Cache — Supabase is only queried on the first
  // visit or after a write revalidates the user's dash tag (see dashboard-cache).
  const businesses = await getCachedBusinessesByUser<Parameters<typeof DashboardClient>[0]["businesses"][number]>(user.id);

  return <DashboardClient user={user} businesses={businesses} />;
}
