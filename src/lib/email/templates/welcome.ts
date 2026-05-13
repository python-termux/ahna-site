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
  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
  .section { background: #ffffff; border-radius: 6px; padding: 32px; margin-bottom: 16px; border-top: 1px solid #e0e0e5; }
  .section-ar { direction: rtl; text-align: right; }
  .section-en { direction: ltr; text-align: left; }
  .logo { font-size: 16px; font-weight: 700; color: #0066cc; margin-bottom: 24px; }
  .title { font-size: 20px; font-weight: 700; margin-bottom: 8px; color: #1c1c1e; }
  .subtitle { font-size: 13px; color: #0066cc; font-weight: 600; margin-bottom: 16px; }
  .body-text { font-size: 14px; color: #666; margin-bottom: 16px; line-height: 1.6; }
  .strong { color: #1c1c1e; font-weight: 600; }
  .link { color: #0066cc; text-decoration: underline; font-weight: 500; }
  .link:hover { color: #0071e3; }
  .footer-text { font-size: 11px; color: #999; margin-top: 24px; border-top: 1px solid #f0f0f0; padding-top: 16px; }
  @media (prefers-color-scheme: dark) {
    body { background: #1c1c1e; }
    .section { background: #2c2c2e; border-top-color: #424245; }
    .body-text { color: #a0a0a5; }
    .strong { color: #f5f5f7; }
    .link { color: #2997ff; }
    .link:hover { color: #0066cc; }
    .footer-text { color: #666; border-top-color: #424245; }
  }
</style>
</head>
<body>
<div class="container">
  <!-- Arabic Section -->
  <div class="section section-ar">
    <div class="logo">سوريا فلو</div>
    <h2 class="title">مرحباً بك في سوريا فلو</h2>
    <p class="subtitle">حسابك جاهز للاستخدام</p>
    <p class="body-text">تم إنشاء صفحة نشاطك التجاري <span class="strong">${safeName}</span> بنجاح وهي جاهزة الآن.</p>
    <p class="body-text">انتقل إلى لوحة التحكم لتخصيص صفحتك وإضافة خدماتك والصور والتفاصيل الخاصة بك.</p>
    <p class="body-text">يمكنك إطلاق موقعك مباشرة بدون الحاجة إلى معرفة برمجية.</p>
    <p class="body-text"><a href="https://app.syrflow.com/dashboard" class="link">انتقل إلى لوحة التحكم</a></p>
    <p class="footer-text">© 2026 syrflow.com | team@syrflow.com</p>
  </div>

  <!-- English Section -->
  <div class="section section-en">
    <div class="logo">Syria Flow</div>
    <h2 class="title">Welcome to Syria Flow</h2>
    <p class="subtitle">Your account is ready to use</p>
    <p class="body-text">Your business page for <span class="strong">${safeName}</span> has been created successfully and is ready to go.</p>
    <p class="body-text">Go to your dashboard to customize your page, add your services, photos, and all your business details.</p>
    <p class="body-text">You can launch your site live right away without any coding knowledge required.</p>
    <p class="body-text"><a href="https://app.syrflow.com/dashboard" class="link">Go to Dashboard</a></p>
    <p class="footer-text">© 2026 syrflow.com | team@syrflow.com</p>
  </div>
</div>
</body>
</html>`;
}
