export function siteActivatedEmailHtml({
  businessName,
  siteUrl,
  startDate,
  expiryDate,
}: {
  businessName: string;
  siteUrl: string;
  startDate: string;        // already-formatted display date
  expiryDate: string | null; // formatted date, or null for no expiry
}): string {
  const safeName = (businessName || "Your Business").slice(0, 100);
  const safeUrl = siteUrl.slice(0, 200);
  const safeStart = startDate.slice(0, 40);
  const safeExpiry = expiryDate ? expiryDate.slice(0, 40) : null;

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
  .subtitle { font-size: 13px; color: #16a34a; font-weight: 600; margin-bottom: 16px; }
  .body-text { font-size: 14px; color: #666; margin-bottom: 16px; line-height: 1.6; }
  .strong { color: #1c1c1e; font-weight: 600; }
  .url-box { background: #f5f5f7; border-left: 3px solid #16a34a; padding: 12px; border-radius: 6px; font-size: 12px; font-family: 'Courier New', Courier, monospace; color: #666; margin: 16px 0; word-break: break-all; direction: ltr; }
  .info { background: #ecfdf3; border: 1px solid #c6f0d4; border-radius: 6px; padding: 16px; margin: 16px 0; }
  .info-row { font-size: 13px; color: #166534; margin-bottom: 6px; }
  .info-row:last-child { margin-bottom: 0; }
  .info-label { font-weight: 700; }
  .link { color: #16a34a; text-decoration: underline; font-weight: 500; }
  .footer-text { font-size: 11px; color: #999; margin-top: 24px; border-top: 1px solid #f0f0f0; padding-top: 16px; }
  @media (prefers-color-scheme: dark) {
    body { background: #1c1c1e; }
    .section { background: #2c2c2e; border-top-color: #424245; }
    .body-text { color: #a0a0a5; }
    .strong { color: #f5f5f7; }
    .url-box { background: #14321f; border-left-color: #22c55e; color: #a0a0a5; }
    .info { background: #122a1b; border-color: #1f4d31; }
    .info-row, .info-label { color: #86efac; }
    .link { color: #4ade80; }
    .footer-text { color: #666; border-top-color: #424245; }
  }
</style>
</head>
<body>
<div class="container">
  <!-- Arabic Section -->
  <div class="section section-ar">
    <div class="logo">سوريا فلو</div>
    <h2 class="title">موقعك أصبح مباشراً الآن 🎉</h2>
    <p class="subtitle">تم تفعيل موقعك بنجاح</p>
    <p class="body-text">تهانينا! تم تفعيل موقع <span class="strong">${safeName}</span> وهو الآن متاح للعامة على الإنترنت.</p>
    <div class="info">
      <p class="info-row"><span class="info-label">تاريخ البدء:</span> ${safeStart}</p>
      <p class="info-row"><span class="info-label">تاريخ الانتهاء:</span> ${safeExpiry ?? "بدون تاريخ انتهاء"}</p>
    </div>
    <p class="body-text">رابط موقعك:</p>
    <div class="url-box">${safeUrl}</div>
    <p class="body-text"><a href="${safeUrl}" class="link">عرض الموقع</a></p>
    <p class="footer-text">© 2026 syrflow.com | team@syrflow.com</p>
  </div>

  <!-- English Section -->
  <div class="section section-en">
    <div class="logo">Syria Flow</div>
    <h2 class="title">Your Site Is Now Live 🎉</h2>
    <p class="subtitle">Your site has been activated</p>
    <p class="body-text">Congratulations! Your site <span class="strong">${safeName}</span> has been activated and is now public online.</p>
    <div class="info">
      <p class="info-row"><span class="info-label">Start date:</span> ${safeStart}</p>
      <p class="info-row"><span class="info-label">Expiry date:</span> ${safeExpiry ?? "No expiry date"}</p>
    </div>
    <p class="body-text">Your site link:</p>
    <div class="url-box">${safeUrl}</div>
    <p class="body-text"><a href="${safeUrl}" class="link">View Your Site</a></p>
    <p class="footer-text">© 2026 syrflow.com | team@syrflow.com</p>
  </div>
</div>
</body>
</html>`;
}
