import { emailShell } from "./_layout";

const SUPPORT_PHONE = "+963 994 831 314";
const WA = "963994831314";

export function siteExpiringEmailHtml({
  businessName,
  siteUrl,
  expiryDate,
  daysLeft,
}: {
  businessName: string;
  siteUrl: string;
  expiryDate: string; // already-formatted display date
  daysLeft: number;
}): string {
  const safeName = (businessName || "Your Business").slice(0, 100);
  const safeUrl = siteUrl.slice(0, 200);
  const safeDate = expiryDate.slice(0, 40);

  const waAr = `https://wa.me/${WA}?text=${encodeURIComponent(
    `مرحباً،\n\nأرغب بتجديد اشتراك موقعي (${safeName}) قبل انتهائه بتاريخ ${safeDate}.\n\nيرجى تزويدي برقم شام كاش لإتمام الدفع.\n\nشكراً لكم.`
  )}`;
  const waEn = `https://wa.me/${WA}?text=${encodeURIComponent(
    `Hello,\n\nI'd like to renew my site (${safeName}) before it expires on ${safeDate}.\n\nPlease send me the Sham Cash number to complete the payment.\n\nThank you.`
  )}`;

  const ar = `
      <div class="logo">سوريا فلو</div>
      <h2 class="title">اشتراك موقعك على وشك الانتهاء</h2>
      <p class="subtitle">تذكير بالتجديد — متبقٍ ${daysLeft} ${daysLeft === 1 ? "يوم" : "أيام"}</p>
      <p class="body-text">ينتهي اشتراك موقع <span class="strong">${safeName}</span> بتاريخ <span class="strong">${safeDate}</span>. للحفاظ على موقعك مباشراً ومتاحاً للعامة، يُرجى تجديد الاشتراك قبل هذا التاريخ.</p>
      <div class="callout callout-amber">
        <p class="callout-text">إذا لم يتم التجديد، سيتوقف ظهور موقعك للعامة بعد تاريخ الانتهاء.</p>
      </div>
      <p class="body-text"><a href="${waAr}" target="_blank" class="btn">التجديد عبر واتساب</a></p>
      <p class="muted">رقم الدعم: <bdi dir="ltr">${SUPPORT_PHONE}</bdi> · موقعك: <bdi dir="ltr">${safeUrl}</bdi></p>`;

  const en = `
      <div class="logo">Syria Flow</div>
      <h2 class="title">Your site subscription is expiring soon</h2>
      <p class="subtitle">Renewal reminder — ${daysLeft} day${daysLeft === 1 ? "" : "s"} left</p>
      <p class="body-text">Your site <span class="strong">${safeName}</span> expires on <span class="strong">${safeDate}</span>. To keep it live and public, please renew before that date.</p>
      <div class="callout callout-amber">
        <p class="callout-text">If it isn't renewed, your site will stop being publicly visible after the expiry date.</p>
      </div>
      <p class="body-text"><a href="${waEn}" target="_blank" class="btn">Renew via WhatsApp</a></p>
      <p class="muted">Support: <bdi dir="ltr">${SUPPORT_PHONE}</bdi> · Your site: <bdi dir="ltr">${safeUrl}</bdi></p>`;

  return emailShell(ar, en);
}
