export function passwordChangedEmailHtml({
  userEmail,
}: {
  userEmail: string;
}): string {
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
  .warning { color:#d70015; }
  @media (prefers-color-scheme: dark) {
    body { background:#1c1c1e !important; }
    .card { background:#2c2c2e !important; }
    .text-main { color:#f5f5f7 !important; }
    .muted { color:#98989d !important; }
    .divider { border-color:#38383a !important; }
    .warning { color:#ff453a !important; }
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
    <p style="margin:0 0 6px;font-size:18px;font-weight:700" class="text-main">تم تغيير كلمة المرور</p>
    <p style="margin:0 0 12px;font-size:14px;line-height:1.6" class="muted">تم تغيير كلمة المرور الخاصة بحسابك بنجاح.</p>
    <p style="margin:0;font-size:14px;line-height:1.6" class="warning"><strong>إذا لم تكن أنت من قام بذلك، يُرجى التواصل معنا فوراً عبر team@syrflow.com</strong></p>
  </td></tr>

  <tr><td style="padding:0 32px">
    <hr class="divider" style="border:none;border-top:1px solid #e0e0e5;margin:0">
  </td></tr>

  <tr><td dir="ltr" style="padding:24px 32px 28px;text-align:left">
    <p style="margin:0 0 6px;font-size:18px;font-weight:700" class="text-main">Password Changed</p>
    <p style="margin:0 0 12px;font-size:14px;line-height:1.6" class="muted">Your account password was changed successfully.</p>
    <p style="margin:0;font-size:14px;line-height:1.6" class="warning"><strong>If this wasn't you, contact us immediately at team@syrflow.com</strong></p>
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
