export function passwordChangedEmailHtml({
  userEmail,
}: {
  userEmail: string;
}): string {
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
  .body-text { font-size: 14px; color: #666; margin-bottom: 16px; line-height: 1.6; }
  .warning { padding: 16px; background: #fff3cd; border-radius: 6px; border-left: 3px solid #ffc107; font-size: 13px; color: #856404; margin-top: 16px; }
  .warning-ar { border-left: 0; border-right: 3px solid #ffc107; }
  .warning strong { color: #7a4e00; }
  .footer-text { font-size: 11px; color: #999; margin-top: 24px; border-top: 1px solid #f0f0f0; padding-top: 16px; }
  @media (prefers-color-scheme: dark) {
    body { background: #1c1c1e; }
    .section { background: #2c2c2e; border-top-color: #424245; }
    .body-text { color: #a0a0a5; }
    .warning { background: #664d03; border-left-color: #ffc107; color: #ffecb5; }
    .warning strong { color: #ffd700; }
    .footer-text { color: #666; border-top-color: #424245; }
  }
</style>
</head>
<body>
<div class="container">
  <!-- Arabic Section -->
  <div class="section section-ar">
    <div class="logo">سوريا فلو</div>
    <h2 class="title">تم تغيير كلمة المرور</h2>
    <p class="subtitle">تنبيه أمان حساب</p>
    <p class="body-text">تم تغيير كلمة المرور الخاصة بحسابك بنجاح.</p>
    <p class="body-text">إذا قمت بهذا التغيير بنفسك، فلا حاجة لاتخاذ أي إجراء إضافي.</p>
    <div class="warning warning-ar">
      <strong>⚠️ إذا لم تقم بهذا التغيير:</strong> تواصل معنا فوراً على team@syrflow.com وأخبرنا بذلك حتى نتمكن من حماية حسابك.
    </div>
    <p class="footer-text">© 2026 syrflow.com | team@syrflow.com</p>
  </div>

  <!-- English Section -->
  <div class="section section-en">
    <div class="logo">Syria Flow</div>
    <h2 class="title">Password Changed</h2>
    <p class="subtitle">Account security alert</p>
    <p class="body-text">Your account password was changed successfully.</p>
    <p class="body-text">If you made this change yourself, no further action is needed.</p>
    <div class="warning">
      <strong>⚠️ If you didn't make this change:</strong> Contact us immediately at team@syrflow.com so we can help secure your account.
    </div>
    <p class="footer-text">© 2026 syrflow.com | team@syrflow.com</p>
  </div>
</div>
</body>
</html>`;
}
