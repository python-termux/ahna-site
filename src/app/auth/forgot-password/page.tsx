"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

import { Mail, Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/language";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="anim-up w-full max-w-sm">
          <Link
            href={`https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "syrflow.com"}`}
            className="flex justify-center items-center gap-1.5 text-xs text-gray-500 hover:text-foreground transition-colors mb-8"
          >
            {t.forgot.returnHome}
          </Link>

          <div className="bg-card border border-border rounded-[6px] p-8">
            {sent ? (
              <div className="text-center">
                <div className="w-12 h-12 rounded-[6px] bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 flex items-center justify-center mx-auto mb-4">
                  <Mail size={20} className="text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-xl font-semibold mb-2">{t.forgot.checkEmail}</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  {t.forgot.sentTo} <span className="font-medium text-foreground">{email}</span>.
                </p>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-1.5 text-sm text-[#0066cc] dark:text-[#2997ff] hover:text-[#2997ff] transition-colors"
                >
                  {t.forgot.backToLogin}
                </Link>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-semibold mb-1 text-center">{t.forgot.title}</h2>
                <p className="text-sm text-muted-foreground mb-6 text-center">{t.forgot.sub}</p>

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
                      placeholder={t.forgot.email}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-background border border-input rounded-[6px] pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2.5 text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none focus:border-[#0066cc] transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center gap-2 bg-[#0066cc] hover:bg-[#0071e3] disabled:opacity-60 text-white font-medium py-2.5 rounded-[4px] text-sm transition-colors"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : t.forgot.submit}
                  </button>
                </form>

                <p className="mt-5 text-center text-sm text-muted-foreground">
                  <Link href="/auth/login" className="inline-flex items-center gap-1 text-[#0066cc] dark:text-[#2997ff] hover:text-[#2997ff] transition-colors">
                    {t.forgot.backToLogin}
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
