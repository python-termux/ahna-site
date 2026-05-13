export function welcomeEmailHtml({ businessName }: { businessName: string }): string {
  const safeName = (businessName || "Your Business").slice(0, 100);

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
  .body-text { font-size: 14px; color: #666; margin-bottom: 20px; line-height: 1.6; }
  .strong { font-weight: 600; color: #1c1c1e; }
  .button { display: inline-block; padding: 10px 20px; background: #0066cc; color: white; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: 600; }
  .button:hover { background: #0071e3; }
  .footer { padding: 20px 32px; border-top: 1px solid #e0e0e5; text-align: center; font-size: 12px; color: #999; }
  .footer-links { margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; }
  .footer-left { text-align: left; }
  .footer-right { text-align: right; direction: rtl; }
  .support { margin-top: 12px; font-size: 11px; }
  @media (prefers-color-scheme: dark) {
    body { background: #1c1c1e; color: #f5f5f7; }
    .container { background: #2c2c2e; }
    .header { border-bottom-color: #424245; }
    .col-en, .col-ar { border-color: #424245; }
    .col-en { border-right-color: #424245; }
    .col-ar { border-left-color: #424245; }
    .body-text { color: #a0a0a5; }
    .strong { color: #f5f5f7; }
    .button { background: #2997ff; }
    .button:hover { background: #0066cc; }
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
      <h2 class="title">Welcome to SyrFlow</h2>
      <p class="body-text">Your business page <span class="strong">${safeName}</span> has been created successfully.</p>
      <p class="body-text">Start customizing your site, add your services, and go live in minutes. No coding required.</p>
      <a href="https://app.syrflow.com/dashboard" class="button">Go to Dashboard</a>
    </div>

    <!-- Arabic Column -->
    <div class="col col-ar">
      <h2 class="title">مرحباً بك في سوريا فلو</h2>
      <p class="body-text">تم إنشاء صفحة نشاطك <span class="strong">${safeName}</span> بنجاح.</p>
      <p class="body-text">ابدأ بتخصيص موقعك وأضف خدماتك واعرضه مباشرة في دقائق. بدون برمجة.</p>
      <a href="https://app.syrflow.com/dashboard" class="button">انتقل إلى لوحة التحكم</a>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <div class="footer-links">
      <div class="footer-left">© 2026 syrflow.com</div>
      <div class="footer-right">© 2026 syrflow.com</div>
    </div>
    <div class="support">For support: <strong>team@syrflow.com</strong></div>
  </div>
</div>
</body>
</html>`;
}
