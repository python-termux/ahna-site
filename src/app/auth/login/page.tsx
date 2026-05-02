"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/lib/language";
import { ThemeToggle } from "@/components/ThemeProvider";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const { t } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const id = toast.loading(t.login.loggingIn);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message, { id });
      setError(error.message);
    } else {
      toast.success("Welcome back!", { id });
      router.push("/dashboard");
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="anim-up w-full max-w-sm">
          <Link
            href={`https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "syrflow.com"}`}
            className="flex justify-center items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-foreground transition-colors mb-8"
          >
            {t.login.returnHome}
          </Link>

          <div className="bg-card border border-border rounded-[6px] p-8">
            <h2 className="text-xl font-semibold mb-1 text-center">{t.login.welcome}</h2>
            <p className="text-sm text-muted-foreground mb-6 text-center">{t.login.sub}</p>

            {error && (
              <div className="mb-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-[6px] px-3 py-2">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="relative">
                <Mail size={15} className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input
                  type="email"
                  placeholder={t.login.email}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-background border border-input rounded-[6px] pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2.5 text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none focus:border-[#0066cc] transition-colors"
                />
              </div>

              <div className="relative">
                <Lock size={15} className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input
                  type={showPw ? "text" : "password"}
                  placeholder={t.login.password}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-background border border-input rounded-[6px] pl-9 rtl:pl-10 rtl:pr-9 pr-10 py-2.5 text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none focus:border-[#0066cc] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              <div className="flex justify-end rtl:justify-start -mt-1">
                <Link href="/auth/forgot-password" className="text-xs text-muted-foreground hover:text-[#0066cc] dark:hover:text-[#2997ff] transition-colors">
                  {t.login.forgot}
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 bg-[#0066cc] hover:bg-[#0071e3] disabled:opacity-60 text-white font-medium py-2.5 rounded-[4px] text-sm transition-colors"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <><span>{t.login.submit}</span><ArrowRight size={15} /></>}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-muted-foreground">
              {t.login.noAccount}{" "}
              <Link href="/register" className="text-[#0066cc] dark:text-[#2997ff] hover:text-[#2997ff] transition-colors">
                {t.login.register}
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="fixed bottom-5 right-5 z-50">
        <ThemeToggle />
      </div>
    </div>
  );
}
