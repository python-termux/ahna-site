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
<html lang="ar">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body { margin:0; padding:0; background:#f5f5f7; font-family:'Segoe UI',Tahoma,Arial,sans-serif; }
  .card { background:#ffffff; }
  .text-main { color:#1c1c1e; }
  .muted { color:#6e6e73; }
  .divider { border-color:#e0e0e5; }
  .button { background:#0066cc; color:#ffffff; }
  .code { background:#f0f6ff; color:#0066cc; font-family:'Courier New',Courier,monospace; }
  @media (prefers-color-scheme: dark) {
    body { background:#1c1c1e !important; }
    .card { background:#2c2c2e !important; }
    .text-main { color:#f5f5f7 !important; }
    .muted { color:#98989d !important; }
    .divider { border-color:#38383a !important; }
    .button { background:#2997ff !important; }
    .code { background:#1a3a5c !important; color:#2997ff !important; }
  }
</style>
</head>
<body>
<table width="100%" cellpadding="0" cellspacing="0" role="presentation">
<tr><td align="center" style="padding:32px 16px">
<table class="card" width="520" cellpadding="0" cellspacing="0" role="presentation" style="max-width:520px;width:100%;border-radius:8px;overflow:hidden;border:1px solid #e0e0e5">

  <tr><td style="padding:24px 32px 0;text-align:center">
    <span style="font-size:18px;font-weight:700;letter-spacing:-0.3px" class="text-main">syrflow</span>
  </td></tr>

  <tr><td dir="rtl" style="padding:28px 32px 24px;text-align:right">
    <p style="margin:0 0 6px;font-size:18px;font-weight:700" class="text-main">تغييراتك أصبحت مباشرة</p>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6" class="muted">تم نشر التغييرات على موقعك <strong>${safeName}</strong> بنجاح. يمكنك الآن عرض الموقع.</p>
    <div class="code" style="border-radius:6px;padding:12px;margin-bottom:20px;font-size:13px;word-break:break-all">
      ${safeUrl}
    </div>
    <table role="presentation" cellpadding="0" cellspacing="0">
    <tr><td class="button" style="border-radius:6px">
      <a href="${safeUrl}" style="display:inline-block;padding:12px 28px;color:#ffffff;font-weight:600;font-size:14px;text-decoration:none">
        اعرض الموقع
      </a>
    </td></tr>
    </table>
  </td></tr>

  <tr><td style="padding:0 32px">
    <hr class="divider" style="border:none;border-top:1px solid #e0e0e5;margin:0">
  </td></tr>

  <tr><td dir="ltr" style="padding:24px 32px 28px;text-align:left">
    <p style="margin:0 0 6px;font-size:18px;font-weight:700" class="text-main">Your Changes Are Live</p>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6" class="muted">Your changes for <strong>${safeName}</strong> have been published successfully. Visit your site now.</p>
    <div class="code" style="border-radius:6px;padding:12px;margin-bottom:20px;font-size:13px;word-break:break-all">
      ${safeUrl}
    </div>
    <table role="presentation" cellpadding="0" cellspacing="0">
    <tr><td class="button" style="border-radius:6px">
      <a href="${safeUrl}" style="display:inline-block;padding:12px 28px;color:#ffffff;font-weight:600;font-size:14px;text-decoration:none">
        View Site
      </a>
    </td></tr>
    </table>
  </td></tr>

  <tr><td style="padding:16px 32px 24px;text-align:center;border-top:1px solid #e0e0e5">
    <p style="margin:0;font-size:11px" class="muted">syrflow.com — Automated message, do not reply.</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}
