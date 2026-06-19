"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeProvider";

export default function AdminLoginPage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const id = toast.loading("Signing in…");
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      toast.error(error.message, { id });
      setError(error.message);
      setLoading(false);
      return;
    }

    toast.success("Welcome, admin", { id });
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="anim-up w-full max-w-sm">
          <div className="flex justify-center items-center gap-1.5 text-xs font-semibold text-gray-500 mb-8">
            <ShieldCheck size={14} className="text-[#0066cc]" />
            Admin Panel
          </div>

          <div className="bg-card border border-border rounded-[6px] p-8">
            <h2 className="text-xl font-semibold mb-1 text-center">Admin sign in</h2>
            <p className="text-sm text-muted-foreground mb-6 text-center">Restricted access — authorized accounts only.</p>

            {error && (
              <div className="mb-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-[6px] px-3 py-2">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-background border border-input rounded-[6px] pl-9 pr-3 py-2.5 text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none focus:border-[#0066cc] transition-colors"
                />
              </div>

              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-background border border-input rounded-[6px] pl-9 pr-10 py-2.5 text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none focus:border-[#0066cc] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 bg-[#0066cc] hover:bg-[#0071e3] disabled:opacity-60 text-white font-medium py-2.5 rounded-[4px] text-sm transition-colors"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <><span>Sign in</span><ArrowRight size={15} /></>}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="fixed bottom-5 right-5 z-50">
        <ThemeToggle />
      </div>
    </div>
  );
}
