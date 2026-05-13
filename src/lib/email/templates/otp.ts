export function otpEmailHtml({
  code,
  purpose,
}: {
  code: string;
  purpose: "login" | "password_change";
}): string {
  const enTitle = purpose === "login" ? "Verify Your Login" : "Verify Password Change";
  const enBody =
    purpose === "login"
      ? "Enter this code to complete your login to syrflow.com."
      : "Enter this code to confirm your password change.";

  const arTitle = purpose === "login" ? "تحقق من تسجيل الدخول" : "تحقق من تغيير كلمة المرور";
  const arBody =
    purpose === "login"
      ? "أدخل هذا الرمز لإكمال تسجيل الدخول إلى syrflow.com."
      : "أدخل هذا الرمز لتأكيد تغيير كلمة المرور.";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  * { margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: #f5f5f7; color: #1c1c1e; line-height: 1.6; }
  .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
  .header { padding: 24px 32px; border-bottom: 1px solid #e0e0e5; display: flex; justify-content: space-between; align-items: center; }
  .logo-en { font-size: 16px; font-weight: 700; color: #0066cc; text-align: left; }
  .logo-ar { font-size: 16px; font-weight: 700; color: #0066cc; text-align: right; direction: rtl; }
  .content { display: flex; }
  .col { flex: 1; padding: 32px; }
  .col-en { text-align: left; border-right: 1px solid #f0f0f0; direction: ltr; }
  .col-ar { text-align: right; border-left: 1px solid #f0f0f0; direction: rtl; }
  .title { font-size: 18px; font-weight: 700; margin-bottom: 12px; color: #1c1c1e; }
  .body-text { font-size: 14px; color: #666; margin-bottom: 24px; }
  .code-box { background: #f0f6ff; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 20px; }
  .code { font-size: 32px; font-weight: 700; letter-spacing: 4px; font-family: 'Courier New', Courier, monospace; color: #0066cc; }
  .expiry { font-size: 12px; color: #999; margin-top: 16px; }
  .footer { padding: 20px 32px; border-top: 1px solid #e0e0e5; text-align: center; font-size: 12px; color: #999; }
  .support { font-size: 11px; }
  @media (prefers-color-scheme: dark) {
    body { background: #1c1c1e; color: #f5f5f7; }
    .container { background: #2c2c2e; }
    .header { border-bottom-color: #424245; }
    .col-en, .col-ar { border-color: #424245; }
    .col-en { border-right-color: #424245; }
    .col-ar { border-left-color: #424245; }
    .body-text { color: #a0a0a5; }
    .code-box { background: #1a3a5c; }
    .code { color: #2997ff; }
    .footer { border-top-color: #424245; color: #666; }
  }
</style>
</head>
<body>
<div class="container">
  <!-- Header -->
  <div class="header">
    <div class="logo-en">Syria Flow</div>
    <div class="logo-ar">سوريا فلو</div>
  </div>

  <!-- Content -->
  <div class="content">
    <!-- English Column -->
    <div class="col col-en">
      <h2 class="title">${enTitle}</h2>
      <p class="body-text">${enBody}</p>
      <div class="code-box">
        <div class="code">${code}</div>
      </div>
      <p class="expiry">This code expires in 5 minutes. If you didn't request this, ignore this email.</p>
    </div>

    <!-- Arabic Column -->
    <div class="col col-ar">
      <h2 class="title">${arTitle}</h2>
      <p class="body-text">${arBody}</p>
      <div class="code-box">
        <div class="code">${code}</div>
      </div>
      <p class="expiry">ينتهي هذا الرمز خلال 5 دقائق. إن لم تكن قد طلبته، تجاهل هذا البريد.</p>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <div>© 2026 syrflow.com</div>
    <div class="support">For support: <strong>team@syrflow.com</strong></div>
  </div>
</div>
</body>
</html>`;
}
