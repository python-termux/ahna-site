import { emailShell } from "./_layout";

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

  const ar = `
      <div class="logo">سوريا فلو</div>
      <h2 class="title">موقعك أصبح مباشراً الآن 🎉</h2>
      <p class="subtitle">تم تفعيل موقعك بنجاح</p>
      <p class="body-text">تهانينا! تم تفعيل موقع <span class="strong">${safeName}</span> وهو الآن متاح للعامة على الإنترنت.</p>
      <div class="callout callout-green">
        <p class="callout-text"><span class="strong" style="color:inherit;">تاريخ البدء:</span> ${safeStart}</p>
        <p class="callout-text" style="margin-bottom:0;"><span class="strong" style="color:inherit;">تاريخ الانتهاء:</span> ${safeExpiry ?? "بدون تاريخ انتهاء"}</p>
      </div>
      <p class="body-text">رابط موقعك:</p>
      <div class="urlbox">${safeUrl}</div>
      <p class="body-text"><a href="${safeUrl}" class="btn">عرض الموقع</a></p>`;

  const en = `
      <div class="logo">Syria Flow</div>
      <h2 class="title">Your Site Is Now Live 🎉</h2>
      <p class="subtitle">Your site has been activated</p>
      <p class="body-text">Congratulations! Your site <span class="strong">${safeName}</span> has been activated and is now public online.</p>
      <div class="callout callout-green">
        <p class="callout-text"><span class="strong" style="color:inherit;">Start date:</span> ${safeStart}</p>
        <p class="callout-text" style="margin-bottom:0;"><span class="strong" style="color:inherit;">Expiry date:</span> ${safeExpiry ?? "No expiry date"}</p>
      </div>
      <p class="body-text">Your site link:</p>
      <div class="urlbox">${safeUrl}</div>
      <p class="body-text"><a href="${safeUrl}" class="btn">View Your Site</a></p>`;

  return emailShell(ar, en);
}
