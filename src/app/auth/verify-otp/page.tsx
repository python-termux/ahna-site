"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useLanguage } from "@/lib/language";

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, lang, isAr } = useLanguage();

  const email = searchParams.get("email") || "";
  const purpose = (searchParams.get("purpose") || "login") as "login" | "password_change";

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(60);
  const [error, setError] = useState("");

  // Start resend countdown on mount
  useEffect(() => {
    const timer = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError(isAr ? "بريد إلكتروني غير صالح" : "Invalid email");
      return;
    }
    if (!/^\d{6}$/.test(code)) {
      setError(isAr ? "أدخل 6 أرقام" : "Enter 6 digits");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, purpose }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || (isAr ? "فشل التحقق" : "Verification failed"));
        setLoading(false);
        return;
      }

      const data = await res.json();

      if (purpose === "login" && data.redirectUrl) {
        // Navigate to magic link
        window.location.href = data.redirectUrl;
      } else if (purpose === "password_change") {
        // Redirect to reset-password form
        toast.success(isAr ? "تم التحقق بنجاح" : "Verified successfully");
        router.push(
          `/auth/reset-password?verified=true&email=${encodeURIComponent(email)}`
        );
      }
    } catch (err) {
      setError(isAr ? "حدث خطأ في الاتصال" : "Connection error");
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCountdown > 0) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, purpose }),
      });

      if (!res.ok) {
        setError(isAr ? "فشل إرسال الرمز" : "Failed to send code");
        setLoading(false);
        return;
      }

      setResendCountdown(60);
      toast.success(isAr ? "تم إعادة الإرسال" : "Code resent");
    } catch (err) {
      setError(isAr ? "حدث خطأ في الاتصال" : "Connection error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
            {t.otp.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t.otp.subtitle(email)}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                setCode(val);
              }}
              placeholder="000000"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg text-center text-2xl font-mono bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors"
          >
            {loading ? (isAr ? "جاري التحقق..." : "Verifying...") : isAr ? "تحقق" : "Verify"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={handleResend}
            disabled={resendCountdown > 0 || loading}
            className="text-blue-600 hover:text-blue-700 disabled:text-gray-400 font-medium text-sm transition-colors"
          >
            {resendCountdown > 0
              ? `${isAr ? "إعادة الإرسال خلال" : "Resend in"} ${resendCountdown}s`
              : isAr
                ? "إعادة الإرسال"
                : "Resend code"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white dark:bg-gray-950" />}>
      <VerifyOtpContent />
    </Suspense>
  );
}
