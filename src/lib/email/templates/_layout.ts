// Shared email shell — one consistent, clean SaaS layout for every email.
// Provide the Arabic and English inner content (built from the shared classes
// below) and this wraps them: card → Arabic → dashed divider → English →
// dashed divider → centered footer. Light + dark mode included.
//
// Shared classes available to content:
//   .logo .title .subtitle .body-text .strong .link
//   .btn                       (single brand-blue button — use everywhere)
//   .callout .callout-title .callout-text  + .callout-amber/.callout-green/.callout-red
//   .data .data-row .data-label .data-value (bordered key/value box)
//   .codebox .code             (OTP code)
//   .urlbox                    (monospace URL/link, full border)
//   .muted                     (small secondary note)
export function emailShell(ar: string, en: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: #f4f5f7; color: #1c1c1e; line-height: 1.6; }
  .container { max-width: 600px; margin: 0 auto; padding: 24px; }
  .card { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 32px; }
  .section-ar { direction: rtl; text-align: right; }
  .section-en { direction: ltr; text-align: left; }
  .divider { border: none; border-top: 1px dashed #d1d5db; margin: 28px 0; }
  .logo { font-size: 16px; font-weight: 700; color: #0066cc; margin-bottom: 20px; }
  .title { font-size: 20px; font-weight: 700; color: #111827; margin-bottom: 6px; }
  .subtitle { font-size: 13px; font-weight: 600; color: #6b7280; margin-bottom: 16px; }
  .body-text { font-size: 14px; color: #6b7280; margin-bottom: 14px; }
  .strong { color: #111827; font-weight: 600; }
  .link { color: #0066cc; text-decoration: underline; font-weight: 500; }
  .btn { display: inline-block; background: #0066cc; color: #ffffff !important; text-decoration: none; font-size: 14px; font-weight: 600; padding: 11px 20px; border-radius: 6px; margin-top: 6px; }
  .callout { border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; margin: 16px 0; }
  .callout-title { font-size: 14px; font-weight: 700; margin-bottom: 6px; }
  .callout-text { font-size: 13px; line-height: 1.6; margin-bottom: 4px; }
  .callout-amber { background: #fff8ed; border-color: #fcd9a8; }
  .callout-amber .callout-title, .callout-amber .callout-text { color: #92400e; }
  .callout-green { background: #f0fdf4; border-color: #bbf7d0; }
  .callout-green .callout-title, .callout-green .callout-text { color: #166534; }
  .callout-red { background: #fef2f2; border-color: #fecaca; }
  .callout-red .callout-title, .callout-red .callout-text { color: #b91c1c; }
  .data { border: 1px solid #e5e7eb; border-radius: 6px; margin: 16px 0; }
  .data-row { font-size: 13px; padding: 11px 14px; border-bottom: 1px solid #f0f1f3; }
  .data-row:last-child { border-bottom: none; }
  .data-label { color: #6b7280; font-weight: 600; }
  .data-value { color: #111827; font-weight: 600; }
  .codebox { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; text-align: center; margin: 18px 0; }
  .code { font-size: 32px; font-weight: 700; letter-spacing: 6px; font-family: 'Courier New', Courier, monospace; color: #0066cc; }
  .urlbox { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; font-size: 12px; font-family: 'Courier New', Courier, monospace; color: #6b7280; margin: 16px 0; word-break: break-all; direction: ltr; }
  .muted { font-size: 12px; color: #9ca3af; margin-top: 12px; }
  .footer-text { font-size: 11px; color: #9ca3af; text-align: center; }
  @media (prefers-color-scheme: dark) {
    body { background: #18191b; }
    .card { background: #232427; border-color: #34363a; }
    .title, .strong, .data-value { color: #f3f4f6; }
    .subtitle, .body-text, .data-label { color: #9ca3af; }
    .divider { border-top-color: #3a3c41; }
    .link { color: #4ea1ff; }
    .data, .data-row { border-color: #34363a; }
    .data-row { border-bottom-color: #2c2e31; }
    .codebox, .urlbox { background: #1b1c1f; border-color: #34363a; color: #9ca3af; }
    .code { color: #4ea1ff; }
    .callout-amber { background: #2a2310; border-color: #4d3f17; }
    .callout-amber .callout-title, .callout-amber .callout-text { color: #f3cf8a; }
    .callout-green { background: #11271a; border-color: #1f4d31; }
    .callout-green .callout-title, .callout-green .callout-text { color: #86efac; }
    .callout-red { background: #2a1414; border-color: #5c2626; }
    .callout-red .callout-title, .callout-red .callout-text { color: #fca5a5; }
    .muted, .footer-text { color: #6b7280; }
  }
</style>
</head>
<body>
<div class="container">
  <div class="card">
    <div class="section-ar">
${ar}
    </div>
    <hr class="divider" />
    <div class="section-en">
${en}
    </div>
    <hr class="divider" />
    <p class="footer-text">© 2026 syrflow.com | team@syrflow.com</p>
  </div>
</div>
</body>
</html>`;
}
