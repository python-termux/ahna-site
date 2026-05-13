export function changesLiveEmailHtml({
  businessName,
  siteUrl,
}: {
  businessName: string;
  siteUrl: string;
}): string {
  const safeName = (businessName || "Your Business").slice(0, 100);
  const safeUrl = siteUrl.slice(0, 200);

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
  .strong { font-weight: 600; color: #1c1c1e; }
  .url-box { background: #f5f5f7; border-left: 3px solid #0066cc; padding: 12px; border-radius: 4px; font-size: 12px; font-family: 'Courier New', Courier, monospace; color: #666; margin-bottom: 16px; word-break: break-all; }
  .link { color: #0066cc; text-decoration: underline; font-weight: 500; }
  .link:hover { color: #0071e3; }
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
    .strong { color: #f5f5f7; }
    .url-box { background: #1a3a5c; border-left-color: #2997ff; color: #a0a0a5; }
    .link { color: #2997ff; }
    .link:hover { color: #0066cc; }
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
      <h2 class="title">Your Changes Are Live</h2>
      <p class="body-text">Your updates for <span class="strong">${safeName}</span> have been published successfully.</p>
      <p class="body-text">Visit your site to see the changes:</p>
      <div class="url-box">${safeUrl}</div>
      <p class="body-text"><a href="${safeUrl}" class="link">View Site</a></p>
    </div>

    <!-- Arabic Column -->
    <div class="col col-ar">
      <h2 class="title">تغييراتك مباشرة الآن</h2>
      <p class="body-text">تم نشر تحديثاتك لـ <span class="strong">${safeName}</span> بنجاح.</p>
      <p class="body-text">اعرض موقعك لترى التغييرات:</p>
      <div class="url-box">${safeUrl}</div>
      <p class="body-text"><a href="${safeUrl}" class="link">اعرض الموقع</a></p>
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
