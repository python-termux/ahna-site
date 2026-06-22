import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";
import AuthRecover from "./AuthRecover";

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

  const { data: businesses } = await supabase
    .from("businesses")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return <DashboardClient user={user} businesses={businesses ?? []} />;
}
