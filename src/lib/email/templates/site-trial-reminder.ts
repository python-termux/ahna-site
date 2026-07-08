import { emailShell } from "./_layout";

const SUPPORT_PHONE = "+963 994 831 314";
const WA = "963994831314";

export function siteTrialReminderEmailHtml({
  businessName,
  registeredDate,
}: {
  businessName: string;
  registeredDate: string; // already-formatted display date
}): string {
  const safeName = (businessName || "Your Business").slice(0, 100);
  const safeDate = registeredDate.slice(0, 40);

  const waAr = `https://wa.me/${WA}?text=${encodeURIComponent(
    `مرحباً،\n\nأرغب بتفعيل موقعي (${safeName}) قبل انتهاء الفترة التجريبية.\n\nيرجى تزويدي برقم شام كاش لإتمام دفع رسوم الاشتراك السنوي (50 دولاراً في السنة — 5 دولارات شهرياً مع خصم 10 دولارات) وتفعيل حسابي.\n\nشكراً لكم.`
  )}`;
  const waEn = `https://wa.me/${WA}?text=${encodeURIComponent(
    `Hello,\n\nI'd like to activate my site (${safeName}) before the trial ends.\n\nPlease send me the Sham Cash number to pay the annual subscription ($50/year — $5/month billed annually with a $10 discount) and activate my account.\n\nThank you.`
  )}`;

  const ar = `
      <div class="logo">سوريا فلو</div>
      <h2 class="title">تنتهي فترتك التجريبية غداً</h2>
      <p class="subtitle">آخر تذكير قبل الحذف</p>
      <p class="body-text">موقعك <span class="strong">${safeName}</span> المُسجّل بتاريخ <span class="strong">${safeDate}</span> لا يزال غير منشور للعامة. لتفعيله والاحتفاظ به، يُرجى دفع رسوم الاشتراك: 5 دولارات شهرياً تُدفع سنوياً مع خصم 10 دولارات (50 دولاراً في السنة).</p>
      <div class="callout callout-red">
        <p class="callout-text">إذا لم يتم الدفع، سيتم حذف موقعك خلال يوم واحد ويصبح اسم الموقع متاحاً للآخرين.</p>
      </div>
      <p class="body-text"><a href="${waAr}" target="_blank" class="btn">الدفع والتفعيل عبر واتساب</a></p>
      <p class="muted">رقم الدعم: <bdi dir="ltr">${SUPPORT_PHONE}</bdi></p>`;

  const en = `
      <div class="logo">Syria Flow</div>
      <h2 class="title">Your free trial ends tomorrow</h2>
      <p class="subtitle">Last reminder before removal</p>
      <p class="body-text">Your site <span class="strong">${safeName}</span>, registered on <span class="strong">${safeDate}</span>, is still not public. To activate and keep it, please pay the subscription: $5/month billed annually with a $10 discount ($50/year).</p>
      <div class="callout callout-red">
        <p class="callout-text">If payment isn't made, your site will be removed within a day and its name will become available to others.</p>
      </div>
      <p class="body-text"><a href="${waEn}" target="_blank" class="btn">Pay &amp; activate via WhatsApp</a></p>
      <p class="muted">Support: <bdi dir="ltr">${SUPPORT_PHONE}</bdi></p>`;

  return emailShell(ar, en);
}
