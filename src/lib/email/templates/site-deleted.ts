export function siteDeletedEmailHtml({
  businessName,
  registeredDate,
}: {
  businessName: string;
  registeredDate: string; // already-formatted display date
}): string {
  const safeName = (businessName || "Your Business").slice(0, 100);
  const safeDate = registeredDate.slice(0, 40);

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
  .subtitle { font-size: 13px; color: #6b7280; font-weight: 600; margin-bottom: 16px; }
  .body-text { font-size: 14px; color: #666; margin-bottom: 16px; line-height: 1.6; }
  .strong { color: #1c1c1e; font-weight: 600; }
  .link { color: #0066cc; text-decoration: underline; font-weight: 500; }
  .btn { display: inline-block; background: #0066cc; color: #ffffff !important; text-decoration: none; font-size: 13px; font-weight: 600; padding: 10px 18px; border-radius: 6px; margin-top: 4px; }
  .footer-text { font-size: 11px; color: #999; margin-top: 24px; border-top: 1px solid #f0f0f0; padding-top: 16px; }
  @media (prefers-color-scheme: dark) {
    body { background: #1c1c1e; }
    .section { background: #2c2c2e; border-top-color: #424245; }
    .body-text { color: #a0a0a5; }
    .strong { color: #f5f5f7; }
    .subtitle { color: #9ca3af; }
    .link { color: #2997ff; }
    .footer-text { color: #666; border-top-color: #424245; }
  }
</style>
</head>
<body>
<div class="container">
  <!-- Arabic Section -->
  <div class="section section-ar">
    <div class="logo">سوريا فلو</div>
    <h2 class="title">تم حذف موقعك</h2>
    <p class="subtitle">انتهت الفترة التجريبية</p>
    <p class="body-text">موقعك <span class="strong">${safeName}</span>، المُسجّل بتاريخ <span class="strong">${safeDate}</span>، قد انتهت فترته التجريبية ولم يتم تفعيله، وبناءً عليه تمت إزالته من منصة سوريا فلو.</p>
    <p class="body-text">أصبح اسم الموقع متاحاً الآن للتسجيل من جديد عبر سوريا فلو. يمكنك إنشاء موقعك مرة أخرى في أي وقت.</p>
    <p class="body-text"><a href="https://app.syrflow.com/register" class="btn">إنشاء موقع جديد</a></p>
    <p class="body-text">نشكرك على اهتمامك بسوريا فلو، ويسعدنا خدمتك مجدداً.</p>
    <p class="footer-text">© 2026 syrflow.com | team@syrflow.com</p>
  </div>

  <!-- English Section -->
  <div class="section section-en">
    <div class="logo">Syria Flow</div>
    <h2 class="title">Your site has been removed</h2>
    <p class="subtitle">Trial period ended</p>
    <p class="body-text">Your site <span class="strong">${safeName}</span>, registered on <span class="strong">${safeDate}</span>, has finished its trial period and was not activated. As a result, it has now been removed from Syria Flow.</p>
    <p class="body-text">The site name is now available to register again on Syria Flow. You're welcome to create your site any time.</p>
    <p class="body-text"><a href="https://app.syrflow.com/register" class="btn">Create a new site</a></p>
    <p class="body-text">Thank you for your interest in Syria Flow — we'd be glad to have you back.</p>
    <p class="footer-text">© 2026 syrflow.com | team@syrflow.com</p>
  </div>
</div>
</body>
</html>`;
}
