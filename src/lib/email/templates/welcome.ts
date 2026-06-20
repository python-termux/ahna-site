import { emailShell } from "./_layout";

export function welcomeEmailHtml({ businessName }: { businessName: string }): string {
  const safeName = (businessName || "Your Business").slice(0, 100);

  const ar = `
      <div class="logo">سوريا فلو</div>
      <h2 class="title">مرحباً بك في سوريا فلو</h2>
      <p class="subtitle">حسابك جاهز للاستخدام</p>
      <p class="body-text">تم إنشاء صفحة نشاطك التجاري <span class="strong">${safeName}</span> بنجاح وهي جاهزة الآن.</p>
      <p class="body-text">انتقل إلى لوحة التحكم لتخصيص صفحتك وإضافة خدماتك والصور والتفاصيل الخاصة بك.</p>
      <div class="callout callout-amber">
        <p class="callout-title">موقعك غير منشور للعامة بعد</p>
        <p class="callout-text">موقعك متاح لك فقط أثناء تسجيل دخولك. لتفعيله للعامة، يُرجى دفع الرسوم 20 دولاراً لمدة سنة واحدة.</p>
        <p class="callout-text"><span class="strong" style="color:inherit;">سيتم حذف الحسابات غير المدفوعة خلال 7 أيام دون إشعار مسبق.</span></p>
      </div>
      <p class="body-text"><a href="https://app.syrflow.com/dashboard" class="btn">الدفع والتفعيل</a></p>`;

  const en = `
      <div class="logo">Syria Flow</div>
      <h2 class="title">Welcome to Syria Flow</h2>
      <p class="subtitle">Your account is ready to use</p>
      <p class="body-text">Your business page for <span class="strong">${safeName}</span> has been created successfully and is ready to go.</p>
      <p class="body-text">Go to your dashboard to customize your page and add your services, photos, and business details.</p>
      <div class="callout callout-amber">
        <p class="callout-title">Your site is not public yet</p>
        <p class="callout-text">Your site is only visible to you while you're logged in. To activate it publicly, please pay the fee of $20 for 1 year.</p>
        <p class="callout-text"><span class="strong" style="color:inherit;">Unpaid accounts will be deleted within 7 days without prior notice.</span></p>
      </div>
      <p class="body-text"><a href="https://app.syrflow.com/dashboard" class="btn">Pay &amp; activate</a></p>`;

  return emailShell(ar, en);
}
