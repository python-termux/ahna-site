import { emailShell } from "./_layout";

export function otpEmailHtml({
  code,
  purpose,
}: {
  code: string;
  purpose: "login" | "password_change";
}): string {
  const enTitle = purpose === "login" ? "Verify Your Login" : "Verify Password Change";
  const enDesc = purpose === "login" ? "Complete your login to syrflow.com" : "Confirm your password change";
  const enBody =
    purpose === "login"
      ? "Use this verification code to complete your login. This code will expire in 5 minutes."
      : "Use this verification code to confirm your password change. This code will expire in 5 minutes.";

  const arTitle = purpose === "login" ? "تحقق من تسجيل الدخول" : "تحقق من تغيير كلمة المرور";
  const arDesc = purpose === "login" ? "أكمل تسجيل الدخول إلى syrflow.com" : "أكد تغيير كلمة المرور";
  const arBody =
    purpose === "login"
      ? "استخدم رمز التحقق هذا لإكمال تسجيل الدخول. سينتهي صلاح هذا الرمز خلال 5 دقائق."
      : "استخدم رمز التحقق هذا لتأكيد تغيير كلمة المرور. سينتهي صلاح هذا الرمز خلال 5 دقائق.";

  const ar = `
      <div class="logo">سوريا فلو</div>
      <h2 class="title">${arTitle}</h2>
      <p class="subtitle">${arDesc}</p>
      <p class="body-text">${arBody}</p>
      <div class="codebox"><div class="code">${code}</div></div>
      <p class="muted">إذا لم تطلب هذا الرمز، يرجى تجاهل هذا البريد الإلكتروني.</p>`;

  const en = `
      <div class="logo">Syria Flow</div>
      <h2 class="title">${enTitle}</h2>
      <p class="subtitle">${enDesc}</p>
      <p class="body-text">${enBody}</p>
      <div class="codebox"><div class="code">${code}</div></div>
      <p class="muted">If you didn't request this code, please ignore this email.</p>`;

  return emailShell(ar, en);
}
