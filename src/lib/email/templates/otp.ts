export function otpEmailHtml({
  code,
  purpose,
}: {
  code: string;
  purpose: "login" | "password_change";
}): string {
  const arTitle = purpose === "login" ? "رمز تسجيل الدخول" : "رمز تغيير كلمة المرور";
  const enTitle = purpose === "login" ? "Login Verification Code" : "Password Change Code";
  const arBody =
    purpose === "login"
      ? "استخدم هذا الرمز لإكمال تسجيل الدخول إلى حسابك في syrflow.com."
      : "استخدم هذا الرمز لتأكيد تغيير كلمة المرور الخاصة بك.";
  const enBody =
    purpose === "login"
      ? "Use this code to complete your login to syrflow.com."
      : "Use this code to confirm your password change.";

  return `<!DOCTYPE html>
<html lang="ar">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body { margin:0; padding:0; background:#f5f5f7; font-family:'Segoe UI',Tahoma,Arial,sans-serif; }
  .card { background:#ffffff; }
  .code-block { color:#0066cc; background:#f0f6ff; }
  .text-main { color:#1c1c1e; }
  .muted { color:#6e6e73; }
  .divider { border-color:#e0e0e5; }
  @media (prefers-color-scheme: dark) {
    body { background:#1c1c1e !important; }
    .card { background:#2c2c2e !important; }
    .text-main { color:#f5f5f7 !important; }
    .code-block { color:#2997ff !important; background:#1a3a5c !important; }
    .muted { color:#98989d !important; }
    .divider { border-color:#38383a !important; }
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
    <p style="margin:0 0 6px;font-size:18px;font-weight:700" class="text-main">${arTitle}</p>
    <p style="margin:0 0 24px;font-size:14px;line-height:1.6" class="muted">${arBody}</p>
    <div class="code-block" style="border-radius:6px;padding:20px;text-align:center;margin-bottom:20px">
      <span style="font-size:2.2rem;font-weight:700;letter-spacing:0.35em;font-family:'Courier New',Courier,monospace">
        ${code}
      </span>
    </div>
    <p style="margin:0;font-size:12px" class="muted">ينتهي هذا الرمز خلال 5 دقائق. إن لم تكن قد طلبته، تجاهل هذا البريد.</p>
  </td></tr>

  <tr><td style="padding:0 32px">
    <hr class="divider" style="border:none;border-top:1px solid #e0e0e5;margin:0">
  </td></tr>

  <tr><td dir="ltr" style="padding:24px 32px 28px;text-align:left">
    <p style="margin:0 0 6px;font-size:18px;font-weight:700" class="text-main">${enTitle}</p>
    <p style="margin:0 0 24px;font-size:14px;line-height:1.6" class="muted">${enBody}</p>
    <div class="code-block" style="border-radius:6px;padding:20px;text-align:center;margin-bottom:20px">
      <span style="font-size:2.2rem;font-weight:700;letter-spacing:0.35em;font-family:'Courier New',Courier,monospace">
        ${code}
      </span>
    </div>
    <p style="margin:0;font-size:12px" class="muted">This code expires in 5 minutes. If you did not request this, ignore this email.</p>
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
