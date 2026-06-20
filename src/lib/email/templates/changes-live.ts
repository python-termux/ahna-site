import { emailShell } from "./_layout";

export function changesLiveEmailHtml({
  businessName,
  siteUrl,
}: {
  businessName: string;
  siteUrl: string;
}): string {
  const safeName = (businessName || "Your Business").slice(0, 100);
  const safeUrl = siteUrl.slice(0, 200);

  const ar = `
      <div class="logo">سوريا فلو</div>
      <h2 class="title">تغييراتك مباشرة الآن 🎉</h2>
      <p class="subtitle">تم نشر التحديثات بنجاح</p>
      <p class="body-text">تم نشر جميع التحديثات والتغييرات الخاصة بـ <span class="strong">${safeName}</span> بنجاح وهي الآن مباشرة على الإنترنت.</p>
      <p class="body-text">رابط موقعك:</p>
      <div class="urlbox">${safeUrl}</div>
      <p class="body-text"><a href="${safeUrl}" class="btn">عرض الموقع</a></p>`;

  const en = `
      <div class="logo">Syria Flow</div>
      <h2 class="title">Your Changes Are Live 🎉</h2>
      <p class="subtitle">Updates published successfully</p>
      <p class="body-text">All updates and changes for <span class="strong">${safeName}</span> have been published successfully and are now live online.</p>
      <p class="body-text">Your site link:</p>
      <div class="urlbox">${safeUrl}</div>
      <p class="body-text"><a href="${safeUrl}" class="btn">View Your Site</a></p>`;

  return emailShell(ar, en);
}
