"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useLanguage } from "@/lib/language";

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, lang, isAr } = useLanguage();

  const email = searchParams.get("email") || "";
  const purpose = (searchParams.get("purpose") || "login") as "login" | "password_change";

  const [codes, setCodes] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(60);
  const [error, setError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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

  const handleInputChange = (index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, "").slice(-1);
    const newCodes = [...codes];
    newCodes[index] = digit;
    setCodes(newCodes);

    // Auto-focus next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !codes[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = codes.join("");

    if (code.length !== 6) {
      setError(isAr ? "أدخل جميع الأرقام الستة" : "Enter all 6 digits");
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

      setCodes(["", "", "", "", "", ""]);
      setResendCountdown(60);
      inputRefs.current[0]?.focus();
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 6 OTP Input Boxes */}
          <div className="flex gap-2 justify-center">
            {codes.map((code, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={code}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                placeholder="0"
                disabled={loading}
                className="w-12 h-12 text-center text-2xl font-bold border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
              />
            ))}
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading || codes.join("").length !== 6}
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
