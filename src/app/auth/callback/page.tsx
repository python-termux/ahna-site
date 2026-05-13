"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function handleCallback() {
      try {
        // Parse the URL hash to extract auth tokens
        // Supabase sends: #access_token=...&expires_in=...&refresh_token=...&token_type=bearer&type=magiclink
        const hash = window.location.hash.substring(1); // Remove #
        const params = new URLSearchParams(hash);

        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");
        const expiresIn = params.get("expires_in");

        if (accessToken && refreshToken && expiresIn) {
          // Set the session with the tokens
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error("Session setup error:", error);
            router.push("/auth/login");
            return;
          }

          // Clear the OTP pending cookie
          document.cookie = "otp_pending=; path=/; max-age=0";

          // Clear the hash from the URL for security
          window.history.replaceState({}, document.title, window.location.pathname);

          // Redirect to dashboard
          router.push("/dashboard");
          return;
        }

        // Fallback: Check if session exists (in case Supabase auto-set it)
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          // Clear the OTP pending cookie
          document.cookie = "otp_pending=; path=/; max-age=0";
          router.push("/dashboard");
        } else {
          // No session found, redirect to login
          router.push("/auth/login");
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        router.push("/auth/login");
      }
    }

    // Small delay to ensure document is ready
    setTimeout(handleCallback, 100);
  }, [router, supabase.auth]);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0066cc] mx-auto mb-4" />
        <p className="text-muted-foreground">Completing authentication...</p>
      </div>
    </div>
  );
}
