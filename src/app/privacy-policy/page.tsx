"use client";

import Footer from "@/components/Footer";
import SiteHeader from "@/components/SiteHeader";
import { useLanguage } from "@/lib/language";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-semibold text-foreground mb-3">{title}</h2>
      <div className="text-muted-foreground space-y-2">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  const { lang, t } = useLanguage();
  const isAr = lang === "ar";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteHeader />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-16 w-full">
        <h1 className="text-3xl font-bold mb-2">{t.privacy.title}</h1>
        <p className="text-sm text-gray-500 mb-12">{t.privacy.updated}</p>

        <div className="space-y-10 text-sm leading-relaxed">

          {isAr ? (
            <>
              <Section title="١. مقدمة">
                <p>نلتزم في <strong className="text-foreground">syrflow.com</strong> بحماية معلوماتك الشخصية. توضّح سياسة الخصوصية هذه البيانات التي نجمعها وكيفية استخدامها وحقوقك بشأنها. باستخدام خدمتنا، توافق على جمع المعلومات واستخدامها وفقاً لهذه السياسة.</p>
              </Section>
              <Section title="٢. البيانات التي نجمعها">
                <p>نجمع الفئات التالية من البيانات الشخصية:</p>
                <ul className="list-disc pl-5 space-y-1.5 mt-2">
                  <li><strong className="text-foreground">بيانات الحساب:</strong> عنوان البريد الإلكتروني وكلمة المرور (مشفّرة) عند التسجيل.</li>
                  <li><strong className="text-foreground">بيانات الأعمال:</strong> اسم الشركة والعنوان ورقم الهاتف وساعات العمل والصور والمعلومات الأخرى التي تستوردها من ملفك التجاري على Google أو تدخلها يدوياً.</li>
                  <li><strong className="text-foreground">بيانات الاستخدام:</strong> ملفات السجل وعناوين IP ونوع المتصفح والصفحات التي تزورها والطوابع الزمنية لأغراض الأمان والتحليلات.</li>
                  <li><strong className="text-foreground">بيانات الدفع:</strong> نتلقى تأكيدات الدفع فقط. لا نخزّن أرقام بطاقات مصرفية أو بيانات حساب مالية على خوادمنا.</li>
                </ul>
              </Section>
              <Section title="٣. كيفية استخدام بياناتك">
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>لإنشاء حسابك وصفحة أعمالك والحفاظ عليهما.</li>
                  <li>لمعالجة الاشتراكات والتحقق من المدفوعات.</li>
                  <li>لإرسال رسائل إلكترونية تشغيلية (تأكيد الحساب، استعادة كلمة المرور، تحديثات الخدمة).</li>
                  <li>لمراقبة وتحسين أمان وأداء الخدمة.</li>
                  <li>للامتثال للالتزامات القانونية.</li>
                </ul>
              </Section>
              <Section title="٤. مشاركة البيانات مع أطراف ثالثة">
                <p>لا نبيع بياناتك الشخصية ولا نشاركها مع أطراف ثالثة لأغراض تسويقية. نشارك البيانات فقط مع:</p>
                <ul className="list-disc pl-5 space-y-1.5 mt-2">
                  <li><strong className="text-foreground">مزودي البنية التحتية السحابية</strong> — لاستضافة بياناتك بأمان وتوفير الخدمة.</li>
                  <li><strong className="text-foreground">الجهات القانونية</strong> — عند الاقتضاء القانوني أو لحماية حقوقنا.</li>
                </ul>
              </Section>
              <Section title="٥. ملفات تعريف الارتباط (Cookies)">
                <p>نستخدم ملفات تعريف ارتباط ضرورية تقنياً للحفاظ على جلستك وحالة المصادقة وتفضيل اللغة. لا نستخدم ملفات تعريف ارتباط إعلانية أو تتبعية. يمكنك التحكم في ملفات تعريف الارتباط من خلال إعدادات المتصفح.</p>
              </Section>
              <Section title="٦. الاحتفاظ بالبيانات">
                <p>نحتفظ ببيانات حسابك وأعمالك طالما كان حسابك نشطاً أو حسب الحاجة لتقديم الخدمة. إذا حذفت حسابك، سنحذف بياناتك الشخصية خلال 30 يوماً، إلا إذا كان القانون يُلزمنا بالاحتفاظ بها لفترة أطول.</p>
              </Section>
              <Section title="٧. الأمان">
                <p>نطبّق معايير الأمان الصناعية بما في ذلك الاتصالات المشفّرة (HTTPS) وكلمات المرور المشفّرة وضوابط الوصول. ومع ذلك، لا توجد طريقة نقل عبر الإنترنت آمنة بنسبة 100%.</p>
              </Section>
              <Section title="٨. حقوقك">
                <p>يحق لك فيما يتعلق ببياناتك الشخصية:</p>
                <ul className="list-disc pl-5 space-y-1.5 mt-2">
                  <li><strong className="text-foreground">الوصول</strong> — طلب نسخة من بياناتك الشخصية.</li>
                  <li><strong className="text-foreground">التصحيح</strong> — طلب تصحيح البيانات غير الدقيقة.</li>
                  <li><strong className="text-foreground">الحذف</strong> — طلب حذف بياناتك.</li>
                  <li><strong className="text-foreground">الاعتراض</strong> — الاعتراض على المعالجة في حالات معينة.</li>
                </ul>
                <p className="mt-2">لممارسة أي من هذه الحقوق، راسلنا على <a href="mailto:team@syrflow.com" className="text-[#0066cc] dark:text-[#2997ff] hover:underline">team@syrflow.com</a>. سنردّ خلال 30 يوماً.</p>
              </Section>
              <Section title="٩. الأطفال">
                <p>الخدمة غير موجّهة للأشخاص دون 18 عاماً. لا نجمع بيانات شخصية من القاصرين عمداً. إذا اعتقدت أن قاصراً قدّم لنا بياناته الشخصية، تواصل معنا وسنحذفها فوراً.</p>
              </Section>
              <Section title="١٠. التغييرات على هذه السياسة">
                <p>قد نحدّث سياسة الخصوصية هذه بصورة دورية. سنُعلمك بالتغييرات الجوهرية عبر البريد الإلكتروني أو بنشر إشعار على الخدمة.</p>
              </Section>
              <Section title="١١. التواصل">
                <p>لأي استفسارات تتعلق بالخصوصية، راسلنا على <a href="mailto:team@syrflow.com" className="text-[#0066cc] dark:text-[#2997ff] hover:underline">team@syrflow.com</a>.</p>
              </Section>
            </>
          ) : (
            <>
              <Section title="1. Introduction">
                <p><strong className="text-foreground">syrflow.com</strong> is committed to protecting your personal information. This Privacy Policy explains what data we collect, how we use it, and your rights regarding it. By using our Service, you agree to the collection and use of information in accordance with this policy.</p>
              </Section>
              <Section title="2. Data We Collect">
                <p>We collect the following categories of personal data:</p>
                <ul className="list-disc pl-5 space-y-1.5 mt-2">
                  <li><strong className="text-foreground">Account data:</strong> Email address and password (hashed) when you register.</li>
                  <li><strong className="text-foreground">Business data:</strong> Business name, address, phone number, opening hours, photos, and other information you import from Google Business Profile or enter manually.</li>
                  <li><strong className="text-foreground">Usage data:</strong> Log files, IP addresses, browser type, pages visited, and timestamps for security and analytics purposes.</li>
                  <li><strong className="text-foreground">Payment data:</strong> We receive payment confirmations only. We do not store bank card numbers or financial account details on our servers.</li>
                </ul>
              </Section>
              <Section title="3. How We Use Your Data">
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>To create and maintain your account and business page.</li>
                  <li>To process subscriptions and verify payments.</li>
                  <li>To send transactional emails (account confirmation, password reset, service updates).</li>
                  <li>To monitor and improve the security and performance of the Service.</li>
                  <li>To comply with legal obligations.</li>
                </ul>
              </Section>
              <Section title="4. Data Sharing and Third Parties">
                <p>We do not sell your personal data or share it with third parties for marketing purposes. We share data only with:</p>
                <ul className="list-disc pl-5 space-y-1.5 mt-2">
                  <li><strong className="text-foreground">Cloud infrastructure providers</strong> — to securely host your data and deliver the Service.</li>
                  <li><strong className="text-foreground">Legal authorities</strong> — when required by law or to protect our rights.</li>
                </ul>
              </Section>
              <Section title="5. Cookies">
                <p>We use strictly necessary cookies to maintain your session, authentication state, and language preference. We do not use advertising or tracking cookies. You can control cookies through your browser settings.</p>
              </Section>
              <Section title="6. Data Retention">
                <p>We retain your account and business data for as long as your account is active or as needed to provide the Service. If you delete your account, we will delete your personal data within 30 days, except where we are required by law to retain it longer.</p>
              </Section>
              <Section title="7. Security">
                <p>We implement industry-standard security measures including encrypted connections (HTTPS), hashed passwords, and access controls. However, no method of transmission over the internet is 100% secure.</p>
              </Section>
              <Section title="8. Your Rights">
                <p>You have the following rights regarding your personal data:</p>
                <ul className="list-disc pl-5 space-y-1.5 mt-2">
                  <li><strong className="text-foreground">Access</strong> — request a copy of your personal data.</li>
                  <li><strong className="text-foreground">Correction</strong> — request correction of inaccurate data.</li>
                  <li><strong className="text-foreground">Deletion</strong> — request deletion of your data.</li>
                  <li><strong className="text-foreground">Objection</strong> — object to processing in certain circumstances.</li>
                </ul>
                <p className="mt-2">To exercise any of these rights, email us at <a href="mailto:team@syrflow.com" className="text-[#0066cc] dark:text-[#2997ff] hover:underline">team@syrflow.com</a>. We will respond within 30 days.</p>
              </Section>
              <Section title="9. Children">
                <p>The Service is not directed at persons under 18. We do not knowingly collect personal data from minors. If you believe a minor has provided us with personal data, please contact us and we will delete it promptly.</p>
              </Section>
              <Section title="10. Changes to This Policy">
                <p>We may update this Privacy Policy periodically. We will notify you of material changes by email or by posting a notice on the Service.</p>
              </Section>
              <Section title="11. Contact">
                <p>For privacy-related questions, contact us at <a href="mailto:team@syrflow.com" className="text-[#0066cc] dark:text-[#2997ff] hover:underline">team@syrflow.com</a>.</p>
              </Section>
            </>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
