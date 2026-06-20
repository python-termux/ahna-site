import { emailShell } from "./_layout";

export function siteDeletedEmailHtml({
  businessName,
  registeredDate,
}: {
  businessName: string;
  registeredDate: string; // already-formatted display date
}): string {
  const safeName = (businessName || "Your Business").slice(0, 100);
  const safeDate = registeredDate.slice(0, 40);

  const ar = `
      <div class="logo">سوريا فلو</div>
      <h2 class="title">تم حذف موقعك</h2>
      <p class="subtitle">انتهت الفترة التجريبية</p>
      <p class="body-text">موقعك <span class="strong">${safeName}</span>، المُسجّل بتاريخ <span class="strong">${safeDate}</span>، قد انتهت فترته التجريبية ولم يتم تفعيله، وبناءً عليه تمت إزالته من منصة سوريا فلو.</p>
      <p class="body-text">أصبح اسم الموقع متاحاً الآن للتسجيل من جديد عبر سوريا فلو. يمكنك إنشاء موقعك مرة أخرى في أي وقت.</p>
      <p class="body-text"><a href="https://app.syrflow.com/register" class="btn">إنشاء موقع جديد</a></p>
      <p class="muted">نشكرك على اهتمامك بسوريا فلو، ويسعدنا خدمتك مجدداً.</p>`;

  const en = `
      <div class="logo">Syria Flow</div>
      <h2 class="title">Your site has been removed</h2>
      <p class="subtitle">Trial period ended</p>
      <p class="body-text">Your site <span class="strong">${safeName}</span>, registered on <span class="strong">${safeDate}</span>, has finished its trial period and was not activated. As a result, it has now been removed from Syria Flow.</p>
      <p class="body-text">The site name is now available to register again on Syria Flow. You're welcome to create your site any time.</p>
      <p class="body-text"><a href="https://app.syrflow.com/register" class="btn">Create a new site</a></p>
      <p class="muted">Thank you for your interest in Syria Flow — we'd be glad to have you back.</p>`;

  return emailShell(ar, en);
}
