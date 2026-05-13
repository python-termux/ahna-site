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
  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
  .section { background: #ffffff; border-radius: 6px; padding: 32px; margin-bottom: 16px; border-top: 1px solid #e0e0e5; }
  .section-ar { direction: rtl; text-align: right; }
  .section-en { direction: ltr; text-align: left; }
  .logo { font-size: 16px; font-weight: 700; color: #0066cc; margin-bottom: 24px; }
  .title { font-size: 20px; font-weight: 700; margin-bottom: 8px; color: #1c1c1e; }
  .subtitle { font-size: 13px; color: #0066cc; font-weight: 600; margin-bottom: 16px; }
  .body-text { font-size: 14px; color: #666; margin-bottom: 16px; line-height: 1.6; }
  .strong { color: #1c1c1e; font-weight: 600; }
  .url-box { background: #f5f5f7; border-left: 3px solid #0066cc; padding: 12px; border-radius: 6px; font-size: 12px; font-family: 'Courier New', Courier, monospace; color: #666; margin: 16px 0; word-break: break-all; }
  .link { color: #0066cc; text-decoration: underline; font-weight: 500; }
  .link:hover { color: #0071e3; }
  .footer-text { font-size: 11px; color: #999; margin-top: 24px; border-top: 1px solid #f0f0f0; padding-top: 16px; }
  @media (prefers-color-scheme: dark) {
    body { background: #1c1c1e; }
    .section { background: #2c2c2e; border-top-color: #424245; }
    .body-text { color: #a0a0a5; }
    .strong { color: #f5f5f7; }
    .url-box { background: #1a3a5c; border-left-color: #2997ff; color: #a0a0a5; }
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
    <h2 class="title">تغييراتك مباشرة الآن 🎉</h2>
    <p class="subtitle">تم نشر التحديثات بنجاح</p>
    <p class="body-text">تم نشر جميع التحديثات والتغييرات الخاصة بـ <span class="strong">${safeName}</span> بنجاح وهي الآن مباشرة على الإنترنت.</p>
    <p class="body-text">انقر على الرابط أدناه لعرض موقعك ورؤية جميع التغييرات:</p>
    <div class="url-box">${safeUrl}</div>
    <p class="body-text"><a href="${safeUrl}" class="link">عرض الموقع</a></p>
    <p class="footer-text">© 2026 syrflow.com | team@syrflow.com</p>
  </div>

  <!-- English Section -->
  <div class="section section-en">
    <div class="logo">Syria Flow</div>
    <h2 class="title">Your Changes Are Live 🎉</h2>
    <p class="subtitle">Updates published successfully</p>
    <p class="body-text">All updates and changes for <span class="strong">${safeName}</span> have been published successfully and are now live online.</p>
    <p class="body-text">Click the link below to view your site and see all the changes:</p>
    <div class="url-box">${safeUrl}</div>
    <p class="body-text"><a href="${safeUrl}" class="link">View Your Site</a></p>
    <p class="footer-text">© 2026 syrflow.com | team@syrflow.com</p>
  </div>
</div>
</body>
</html>`;
}
