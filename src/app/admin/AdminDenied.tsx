"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ShieldAlert, LogOut } from "lucide-react";

export default function AdminDenied({ email }: { email: string }) {
  const router = useRouter();

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center bg-card border border-border rounded-[6px] p-8">
        <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/50 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert size={22} className="text-red-500" />
        </div>
        <h1 className="text-lg font-semibold mb-1">Access denied</h1>
        <p className="text-sm text-muted-foreground mb-6">
          <span className="font-medium text-foreground">{email}</span> is not an authorized admin account.
        </p>
        <button
          onClick={signOut}
          className="inline-flex items-center justify-center gap-2 border border-border hover:bg-accent text-sm font-medium py-2.5 px-4 rounded-[6px] transition-colors w-full"
        >
          <LogOut size={15} /> Sign out
        </button>
      </div>
    </div>
  );
}
