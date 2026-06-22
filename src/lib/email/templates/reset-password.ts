import { emailShell } from "./_layout";

export function resetPasswordEmailHtml({ resetUrl }: { resetUrl: string }): string {
  const safeUrl = resetUrl.slice(0, 600);

  const ar = `
      <div class="logo">سوريا فلو</div>
      <h2 class="title">إعادة تعيين كلمة المرور</h2>
      <p class="subtitle">طلب تغيير كلمة المرور</p>
      <p class="body-text">لقد تلقّينا طلباً لإعادة تعيين كلمة مرور حسابك. اضغط على الزر أدناه لتعيين كلمة مرور جديدة.</p>
      <p class="body-text"><a href="${safeUrl}" class="btn">إعادة تعيين كلمة المرور</a></p>
      <p class="muted">هذا الرابط صالح لمدة ساعة واحدة. إذا لم تطلب ذلك، يمكنك تجاهل هذا البريد بأمان.</p>`;

  const en = `
      <div class="logo">Syria Flow</div>
      <h2 class="title">Reset your password</h2>
      <p class="subtitle">Password reset request</p>
      <p class="body-text">We received a request to reset your account password. Click the button below to set a new password.</p>
      <p class="body-text"><a href="${safeUrl}" class="btn">Reset password</a></p>
      <p class="muted">This link is valid for one hour. If you didn't request this, you can safely ignore this email.</p>`;

  return emailShell(ar, en);
}
