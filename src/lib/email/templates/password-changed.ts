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
  .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
  .header { padding: 24px 32px; border-bottom: 1px solid #e0e0e5; display: flex; justify-content: space-between; align-items: center; }
  .logo-en { font-size: 16px; font-weight: 700; color: #0066cc; }
  .logo-ar { font-size: 16px; font-weight: 700; color: #0066cc; }
  .content { display: flex; }
  .col { flex: 1; padding: 32px; }
  .col-en { text-align: left; border-right: 1px solid #f0f0f0; direction: ltr; }
  .col-ar { text-align: right; border-left: 1px solid #f0f0f0; direction: rtl; }
  .title { font-size: 18px; font-weight: 700; margin-bottom: 12px; color: #1c1c1e; }
  .body-text { font-size: 14px; color: #666; margin-bottom: 16px; line-height: 1.6; }
  .warning { padding: 12px; background: #fff3cd; border-left: 3px solid #ffc107; border-radius: 4px; font-size: 13px; color: #856404; margin-top: 16px; }
  .warning-ar { border-left: 0; border-right: 3px solid #ffc107; }
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
    .warning { background: #664d03; border-left-color: #ffc107; color: #ffecb5; }
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
      <h2 class="title">Password Changed</h2>
      <p class="body-text">Your account password was changed successfully.</p>
      <div class="warning">
        <strong>Security Notice:</strong> If you didn't make this change, contact us immediately at team@syrflow.com
      </div>
    </div>

    <!-- Arabic Column -->
    <div class="col col-ar">
      <h2 class="title">تم تغيير كلمة المرور</h2>
      <p class="body-text">تم تغيير كلمة المرور الخاصة بحسابك بنجاح.</p>
      <div class="warning warning-ar">
        <strong>تنبيه أمان:</strong> إذا لم تقم بهذا التغيير، تواصل معنا فوراً على team@syrflow.com
      </div>
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
