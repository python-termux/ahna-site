import { emailShell } from "./_layout";

export function passwordChangedEmailHtml({
  userEmail,
}: {
  userEmail: string;
}): string {
  void userEmail;

  const ar = `
      <div class="logo">سوريا فلو</div>
      <h2 class="title">تم تغيير كلمة المرور</h2>
      <p class="subtitle">تنبيه أمان الحساب</p>
      <p class="body-text">تم تغيير كلمة المرور الخاصة بحسابك بنجاح.</p>
      <p class="body-text">إذا قمت بهذا التغيير بنفسك، فلا حاجة لاتخاذ أي إجراء إضافي.</p>
      <div class="callout callout-red">
        <p class="callout-title">⚠️ إذا لم تقم بهذا التغيير</p>
        <p class="callout-text">تواصل معنا فوراً على team@syrflow.com حتى نتمكن من حماية حسابك.</p>
      </div>`;

  const en = `
      <div class="logo">Syria Flow</div>
      <h2 class="title">Password Changed</h2>
      <p class="subtitle">Account security alert</p>
      <p class="body-text">Your account password was changed successfully.</p>
      <p class="body-text">If you made this change yourself, no further action is needed.</p>
      <div class="callout callout-red">
        <p class="callout-title">⚠️ If you didn't make this change</p>
        <p class="callout-text">Contact us immediately at team@syrflow.com so we can help secure your account.</p>
      </div>`;

  return emailShell(ar, en);
}
