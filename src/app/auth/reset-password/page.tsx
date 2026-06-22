"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { useLanguage } from "@/lib/language";
import { createClient } from "@/lib/supabase/client";

type Step = "loading" | "otp_entry" | "password_form" | "success" | "error";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, lang, isAr } = useLanguage();
  const supabase = createClient();

  // token_hash (our own reset link) is the primary path; `code` kept for compat.
  const tokenHash = searchParams.get("token_hash");
  const linkType = (searchParams.get("type") as "recovery" | null) ?? "recovery";
  const code = searchParams.get("code");
  const emailParam = searchParams.get("email") || "";
  const verified = searchParams.get("verified") === "true";
  const showOtp = searchParams.get("otp") === "true";
  const ranRef = useRef(false);

  const [step, setStep] = useState<Step>("loading");
  const [email, setEmail] = useState(emailParam);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Run once — verifying a single-use token twice would fail the second time.
    if (ranRef.current) return;
    ranRef.current = true;

    async function initPage() {
      const hash = tokenHash || code;

      // Reset link with a token_hash — verify on the client (scanner-safe).
      if (hash) {
        try {
          // If the user is already logged in (clicked the link in the same
          // browser), they can change their password without re-verifying.
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setStep("password_form");
            return;
          }

          const { error: err } = await supabase.auth.verifyOtp({
            token_hash: hash,
            type: linkType,
          });

          if (err) {
            setError(isAr ? "الرابط غير صالح أو انتهى" : "Invalid or expired link");
            setStep("error");
            return;
          }

          setStep("password_form");
        } catch {
          setError(isAr ? "حدث خطأ" : "Error occurred");
          setStep("error");
        }
        return;
      }

      if (verified) {
        setStep("password_form");
        return;
      }

      if (showOtp) {
        setStep("otp_entry");
        return;
      }

      setError(isAr ? "رابط غير صالح" : "Invalid link");
      setStep("error");
    }

    initPage();
  }, [tokenHash, linkType, code, verified, showOtp, isAr, supabase.auth]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !passwordConfirm) {
      setError(isAr ? "أدخل كلمة المرور" : "Enter password");
      return;
    }
    if (password.length < 6) {
      setError(isAr ? "كلمة المرور قصيرة جداً" : "Password too short");
      return;
    }
    if (password !== passwordConfirm) {
      setError(isAr ? "كلمات المرور غير متطابقة" : "Passwords don't match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }

      // Send password-changed notification while the session is still valid.
      // Awaited so signOut below doesn't cancel the request / drop the session.
      await fetch("/api/auth/password-changed-notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }).catch(() => {});

      // Sign out so the user logs in fresh with the new password.
      await supabase.auth.signOut();
      toast.success(isAr ? "تم تحديث كلمة المرور" : "Password updated");
      setStep("success");
      setTimeout(() => router.push("/auth/login"), 1500);
    } catch (err: any) {
      setError(err.message || (isAr ? "حدث خطأ" : "Error occurred"));
      setLoading(false);
    }
  };

  if (step === "loading") {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (step === "error") {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <p className="text-red-500 text-lg font-medium mb-4">{error}</p>
          <button
            onClick={() => router.push("/auth/forgot-password")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {isAr ? "طلب رمز جديد" : "Request New Code"}
          </button>
        </div>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto">
              <svg
                className="w-8 h-8 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
            {isAr ? "تم بنجاح" : "Success"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {isAr ? "تم تحديث كلمة المرور. جارٍ تحويلك لتسجيل الدخول…" : "Your password has been updated. Redirecting to login…"}
          </p>
          <button
            onClick={() => router.push("/auth/login")}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
          >
            {isAr ? "تسجيل الدخول" : "Go to login"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
            {step === "password_form"
              ? isAr
                ? "كلمة مرور جديدة"
                : "New Password"
              : isAr
                ? "التحقق من الرمز"
                : "Verify Code"}
          </h1>
        </div>

        {step === "password_form" && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                {isAr ? "كلمة المرور الجديدة" : "New Password"}
              </label>
              <div className="relative">
                <input
                  dir="ltr"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-11 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                {isAr ? "تأكيد كلمة المرور" : "Confirm Password"}
              </label>
              <div className="relative">
                <input
                  dir="ltr"
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  className="w-full px-4 py-3 pr-11 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  disabled={loading}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading || !password || !passwordConfirm}
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors"
            >
              {loading ? (isAr ? "جاري التحديث..." : "Updating...") : isAr ? "تحديث" : "Update"}
            </button>
          </form>
        )}

        {step === "otp_entry" && email && (
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {isAr ? `أرسلنا رمزاً إلى ${email}` : `We sent a code to ${email}`}
            </p>
            <a
              href={`/auth/verify-otp?email=${encodeURIComponent(email)}&purpose=password_change`}
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {isAr ? "إدخال الرمز" : "Enter Code"}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white dark:bg-gray-950" />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
