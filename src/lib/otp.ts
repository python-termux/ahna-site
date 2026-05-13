import { createAdminClient } from "@/lib/supabase/server-admin";

export type OtpPurpose = "login" | "password_change";

function generateOtp(): string {
  const n = Math.floor(Math.random() * 1_000_000);
  return String(n).padStart(6, "0");
}

async function hashOtp(code: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(code);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function issueOtp(
  email: string,
  purpose: OtpPurpose
): Promise<string> {
  const supabase = createAdminClient();

  // Remove any existing OTP for this email+purpose
  await supabase
    .from("otp_codes")
    .delete()
    .eq("email", email)
    .eq("purpose", purpose)
    .eq("used", false);

  const code = generateOtp();
  const hashed = await hashOtp(code);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  await supabase.from("otp_codes").insert({
    email,
    code: hashed,
    purpose,
    expires_at: expiresAt,
  });

  return code;
}

export async function verifyOtp(
  email: string,
  submittedCode: string,
  purpose: OtpPurpose
): Promise<boolean> {
  const supabase = createAdminClient();

  // Clean up expired and used OTPs
  const now = new Date().toISOString();
  await supabase
    .from("otp_codes")
    .delete()
    .eq("email", email)
    .or(`used.eq.true,expires_at.lt.${now}`);

  // Get the most recent unused OTP for this email+purpose
  const { data, error } = await supabase
    .from("otp_codes")
    .select("id, code, expires_at")
    .eq("email", email)
    .eq("purpose", purpose)
    .eq("used", false)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return false;
  if (new Date(data.expires_at) < new Date()) return false;

  const hashed = await hashOtp(submittedCode);
  if (hashed !== data.code) return false;

  // Mark OTP as used
  await supabase.from("otp_codes").update({ used: true }).eq("id", data.id);

  return true;
}
