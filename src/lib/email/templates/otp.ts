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

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  * { margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: #f5f5f7; color: #1c1c1e; line-height: 1.6; }
  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
  .section { background: #ffffff; border-radius: 6px; padding: 32px; margin-bottom: 16px; border-top: 1px solid #e0e0e5; }
  .section-ar { direction: rtl; text-align: right; }
  .section-en { direction: ltr; text-align: left; }
  .logo { font-size: 16px; font-weight: 700; color: #0066cc; margin-bottom: 24px; }
  .title { font-size: 20px; font-weight: 700; margin-bottom: 8px; color: #1c1c1e; }
  .subtitle { font-size: 13px; color: #0066cc; font-weight: 600; margin-bottom: 16px; }
  .body-text { font-size: 14px; color: #666; margin-bottom: 24px; line-height: 1.6; }
  .code-box { background: #f0f6ff; border-radius: 6px; padding: 24px; text-align: center; margin: 24px 0; }
  .code { font-size: 36px; font-weight: 700; letter-spacing: 6px; font-family: 'Courier New', Courier, monospace; color: #0066cc; }
  .expiry { font-size: 12px; color: #999; margin-top: 16px; }
  .footer-text { font-size: 11px; color: #999; margin-top: 24px; border-top: 1px solid #f0f0f0; padding-top: 16px; }
  @media (prefers-color-scheme: dark) {
    body { background: #1c1c1e; }
    .section { background: #2c2c2e; border-top-color: #424245; }
    .body-text { color: #a0a0a5; }
    .code-box { background: #1a3a5c; }
    .code { color: #2997ff; }
    .footer-text { color: #666; border-top-color: #424245; }
  }
</style>
</head>
<body>
<div class="container">
  <!-- Arabic Section -->
  <div class="section section-ar">
    <div class="logo">سوريا فلو</div>
    <h2 class="title">${arTitle}</h2>
    <p class="subtitle">${arDesc}</p>
    <p class="body-text">${arBody}</p>
    <div class="code-box">
      <div class="code">${code}</div>
    </div>
    <p class="expiry">إذا لم تطلب هذا الرمز، يرجى تجاهل هذا البريد الإلكتروني.</p>
    <p class="footer-text">© 2026 syrflow.com | team@syrflow.com</p>
  </div>

  <!-- English Section -->
  <div class="section section-en">
    <div class="logo">Syria Flow</div>
    <h2 class="title">${enTitle}</h2>
    <p class="subtitle">${enDesc}</p>
    <p class="body-text">${enBody}</p>
    <div class="code-box">
      <div class="code">${code}</div>
    </div>
    <p class="expiry">If you didn't request this code, please ignore this email.</p>
    <p class="footer-text">© 2026 syrflow.com | team@syrflow.com</p>
  </div>
</div>
</body>
</html>`;
}
