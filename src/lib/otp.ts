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
    .eq("purpose", purpose);

  const code = generateOtp();
  const hashed = await hashOtp(code);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  const { error } = await supabase.from("otp_codes").insert({
    email,
    code: hashed,
    purpose,
    expires_at: expiresAt,
  });

  if (error) {
    console.error("OTP insert error:", error);
    throw new Error(`Failed to store OTP: ${error.message}`);
  }

  return code;
}

export async function verifyOtp(
  email: string,
  submittedCode: string,
  purpose: OtpPurpose
): Promise<boolean> {
  const supabase = createAdminClient();

  // Normalize the code: trim and ensure it's 6 digits
  const normalizedCode = submittedCode.trim().replace(/\D/g, "").slice(0, 6);
  if (normalizedCode.length !== 6) {
    console.error("Code validation failed: not 6 digits", { submittedCode, normalizedCode });
    return false;
  }

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

  if (error) {
    console.error("OTP lookup error:", error);
    return false;
  }

  if (!data) {
    console.error("No OTP found", { email, purpose });
    return false;
  }

  if (new Date(data.expires_at) < new Date()) {
    console.error("OTP expired", { expires_at: data.expires_at });
    return false;
  }

  const hashed = await hashOtp(normalizedCode);
  if (hashed !== data.code) {
    console.error("OTP hash mismatch", { submitted: normalizedCode, stored: data.code, hashed });
    return false;
  }

  // Mark OTP as used
  const { error: updateError } = await supabase
    .from("otp_codes")
    .update({ used: true })
    .eq("id", data.id);

  if (updateError) {
    console.error("Failed to mark OTP as used:", updateError);
    return false;
  }

  return true;
}
