"use client";

import Link from "next/link";
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
                <p>تلتزم <strong className="text-foreground">Osaad</strong> (المعروفة أيضاً باسم <strong className="text-foreground">Osaad.tech</strong>)، مشغّلة <strong className="text-foreground">syrflow.com</strong> ("نحن"، "لنا")، بحماية معلوماتك الشخصية. توضّح سياسة الخصوصية هذه البيانات التي نجمعها وكيفية استخدامها وحقوقك بشأنها. باستخدام خدمتنا، توافق على جمع المعلومات واستخدامها وفقاً لهذه السياسة.</p>
              </Section>
              <Section title="٢. البيانات التي نجمعها">
                <p>نجمع الفئات التالية من البيانات الشخصية:</p>
                <ul className="list-disc pl-5 space-y-1.5 mt-2">
                  <li><strong className="text-foreground">بيانات الحساب:</strong> عنوان البريد الإلكتروني وكلمة المرور (مشفّرة) عند التسجيل.</li>
                  <li><strong className="text-foreground">بيانات الأعمال:</strong> اسم الشركة والعنوان ورقم الهاتف وساعات العمل والصور والمعلومات الأخرى التي تستوردها من ملفك التجاري على Google أو تدخلها يدوياً.</li>
                  <li><strong className="text-foreground">بيانات الاستخدام:</strong> ملفات السجل وعناوين IP ونوع المتصفح والصفحات التي تزورها والطوابع الزمنية لأغراض الأمان والتحليلات.</li>
                  <li><strong className="text-foreground">بيانات الدفع:</strong> تتم معالجة الدفع بالكامل بواسطة Paddle. لا نخزّن أرقام بطاقات الائتمان أو تفاصيل الدفع الكاملة على خوادمنا.</li>
                </ul>
              </Section>
              <Section title="٣. معالجة الدفع بواسطة Paddle">
                <p>تتم معالجة جميع مدفوعات الاشتراك بواسطة <strong className="text-foreground">Paddle.com Market Limited</strong>، التي تعمل بوصفها تاجر السجل. عند إجراء عملية شراء، تقوم Paddle بجمع ومعالجة تفاصيل الدفع وعنوان الفوترة ومعلومات المعاملة وفقاً لـ <a href="https://www.paddle.com/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-[#0066cc] dark:text-[#2997ff] hover:underline">سياسة خصوصية Paddle</a>. نشارك عنوان بريدك الإلكتروني مع Paddle لأغراض معالجة الدفع ومنع الاحتيال.</p>
              </Section>
              <Section title="٤. كيفية استخدام بياناتك">
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>لإنشاء حسابك وصفحة أعمالك والحفاظ عليهما.</li>
                  <li>لمعالجة الاشتراكات والفواتير (عبر Paddle).</li>
                  <li>لإرسال رسائل إلكترونية تشغيلية (تأكيد الحساب، الفواتير، تحديثات الخدمة).</li>
                  <li>لمراقبة وتحسين أمان وأداء الخدمة.</li>
                  <li>للامتثال للالتزامات القانونية.</li>
                </ul>
              </Section>
              <Section title="٥. مشاركة البيانات مع أطراف ثالثة">
                <p>لا نبيع بياناتك الشخصية. نشارك البيانات فقط مع:</p>
                <ul className="list-disc pl-5 space-y-1.5 mt-2">
                  <li><strong className="text-foreground">Paddle</strong> — لمعالجة الدفع والامتثال الضريبي.</li>
                  <li><strong className="text-foreground">Supabase</strong> — مزود قاعدة البيانات والمصادقة، مستضاف على بنية تحتية سحابية آمنة.</li>
                  <li><strong className="text-foreground">الجهات القانونية</strong> — عند الاقتضاء القانوني أو لحماية حقوقنا.</li>
                </ul>
              </Section>
              <Section title="٦. ملفات تعريف الارتباط (Cookies)">
                <p>نستخدم ملفات تعريف ارتباط ضرورية تقنياً للحفاظ على جلستك وحالة المصادقة. لا نستخدم ملفات تعريف ارتباط إعلانية أو تتبعية. يمكنك التحكم في ملفات تعريف الارتباط من خلال إعدادات المتصفح.</p>
              </Section>
              <Section title="٧. الاحتفاظ بالبيانات">
                <p>نحتفظ ببيانات حسابك وأعمالك طالما كان حسابك نشطاً أو حسب الحاجة لتقديم الخدمة. إذا حذفت حسابك، سنحذف بياناتك الشخصية خلال 30 يوماً، إلا إذا كان القانون يُلزمنا بالاحتفاظ بها لفترة أطول.</p>
              </Section>
              <Section title="٨. الأمان">
                <p>نطبّق معايير الأمان الصناعية بما في ذلك الاتصالات المشفّرة (HTTPS) وكلمات المرور المشفّرة وضوابط الوصول. ومع ذلك، لا توجد طريقة نقل عبر الإنترنت آمنة بنسبة 100%.</p>
              </Section>
              <Section title="٩. حقوقك">
                <p>بحسب موقعك، قد تتمتع بالحقوق التالية فيما يتعلق ببياناتك الشخصية:</p>
                <ul className="list-disc pl-5 space-y-1.5 mt-2">
                  <li><strong className="text-foreground">الوصول</strong> — طلب نسخة من بياناتك الشخصية.</li>
                  <li><strong className="text-foreground">التصحيح</strong> — طلب تصحيح البيانات غير الدقيقة.</li>
                  <li><strong className="text-foreground">الحذف</strong> — طلب حذف بياناتك ("الحق في النسيان").</li>
                  <li><strong className="text-foreground">قابلية النقل</strong> — طلب بياناتك بتنسيق قابل للقراءة آلياً.</li>
                  <li><strong className="text-foreground">الاعتراض</strong> — الاعتراض على المعالجة المستندة إلى المصالح المشروعة.</li>
                </ul>
                <p className="mt-2">لممارسة أي من هذه الحقوق، راسلنا على <a href="mailto:privacy@syrflow.com" className="text-[#0066cc] dark:text-[#2997ff] hover:underline">privacy@syrflow.com</a>. سنردّ خلال 30 يوماً.</p>
              </Section>
              <Section title="١٠. النقل الدولي للبيانات">
                <p>قد تتم معالجة بياناتك وتخزينها في دول خارج دولتك. عند الاقتضاء، نطبّق ضمانات مناسبة مثل البنود التعاقدية القياسية لضمان حماية بياناتك.</p>
              </Section>
              <Section title="١١. الأطفال">
                <p>الخدمة غير موجّهة للأطفال دون 18 عاماً. لا نجمع بيانات شخصية من القاصرين عمداً. إذا اعتقدت أن قاصراً قدّم لنا بياناته الشخصية، تواصل معنا وسنحذفها فوراً.</p>
              </Section>
              <Section title="١٢. التغييرات على هذه السياسة">
                <p>قد نحدّث سياسة الخصوصية هذه بصورة دورية. سنُعلمك بالتغييرات الجوهرية عبر البريد الإلكتروني أو بنشر إشعار على الخدمة. الاستمرار في الاستخدام بعد التغييرات يُعدّ قبولاً لها.</p>
              </Section>
              <Section title="١٣. التواصل">
                <p>للاستفسارات أو الطلبات المتعلقة بالخصوصية، تواصل مع مراقب البيانات لدينا على <a href="mailto:privacy@syrflow.com" className="text-[#0066cc] dark:text-[#2997ff] hover:underline">privacy@syrflow.com</a>. تُدار المنصة بواسطة <strong className="text-foreground">Osaad</strong> (المعروفة أيضاً باسم <strong className="text-foreground">Osaad.tech</strong>)، الإمارات العربية المتحدة.</p>
              </Section>
            </>
          ) : (
            <>
              <Section title="1. Introduction">
                <p><strong className="text-foreground">Osaad</strong> (also trading as <strong className="text-foreground">Osaad.tech</strong>), the operator of <strong className="text-foreground">syrflow.com</strong> ("we", "us", "our"), is committed to protecting your personal information. This Privacy Policy explains what data we collect, how we use it, and your rights regarding it. By using our Service, you agree to the collection and use of information in accordance with this policy.</p>
              </Section>
              <Section title="2. Data We Collect">
                <p>We collect the following categories of personal data:</p>
                <ul className="list-disc pl-5 space-y-1.5 mt-2">
                  <li><strong className="text-foreground">Account data:</strong> Email address and password (hashed) when you register.</li>
                  <li><strong className="text-foreground">Business data:</strong> Business name, address, phone number, opening hours, photos, and other information you import from Google Business Profile or enter manually.</li>
                  <li><strong className="text-foreground">Usage data:</strong> Log files, IP addresses, browser type, pages visited, and timestamps for security and analytics purposes.</li>
                  <li><strong className="text-foreground">Payment data:</strong> Payment processing is handled entirely by Paddle. We do not store credit card numbers or full payment details on our servers.</li>
                </ul>
              </Section>
              <Section title="3. Payment Processing by Paddle">
                <p>All subscription payments are processed by <strong className="text-foreground">Paddle.com Market Limited</strong>, which acts as the Merchant of Record. When you make a purchase, Paddle collects and processes your payment details, billing address, and transaction information in accordance with <a href="https://www.paddle.com/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-[#0066cc] dark:text-[#2997ff] hover:underline">Paddle's Privacy Policy</a>. We share your email address with Paddle for the purpose of payment processing and fraud prevention.</p>
              </Section>
              <Section title="4. How We Use Your Data">
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>To create and maintain your account and business page.</li>
                  <li>To process subscriptions and billing (via Paddle).</li>
                  <li>To send transactional emails (account confirmation, invoices, service updates).</li>
                  <li>To monitor and improve the security and performance of the Service.</li>
                  <li>To comply with legal obligations.</li>
                </ul>
              </Section>
              <Section title="5. Data Sharing and Third Parties">
                <p>We do not sell your personal data. We share data only with:</p>
                <ul className="list-disc pl-5 space-y-1.5 mt-2">
                  <li><strong className="text-foreground">Paddle</strong> — for payment processing and tax compliance.</li>
                  <li><strong className="text-foreground">Supabase</strong> — our database and authentication provider, hosted on secure cloud infrastructure.</li>
                  <li><strong className="text-foreground">Legal authorities</strong> — when required by law or to protect our rights.</li>
                </ul>
              </Section>
              <Section title="6. Cookies">
                <p>We use strictly necessary cookies to maintain your session and authentication state. We do not use advertising or tracking cookies. You can control cookies through your browser settings.</p>
              </Section>
              <Section title="7. Data Retention">
                <p>We retain your account and business data for as long as your account is active or as needed to provide the Service. If you delete your account, we will delete your personal data within 30 days, except where we are required by law to retain it longer.</p>
              </Section>
              <Section title="8. Security">
                <p>We implement industry-standard security measures including encrypted connections (HTTPS), hashed passwords, and access controls. However, no method of transmission over the internet is 100% secure.</p>
              </Section>
              <Section title="9. Your Rights">
                <p>Depending on your location, you may have the following rights regarding your personal data:</p>
                <ul className="list-disc pl-5 space-y-1.5 mt-2">
                  <li><strong className="text-foreground">Access</strong> — request a copy of your personal data.</li>
                  <li><strong className="text-foreground">Correction</strong> — request correction of inaccurate data.</li>
                  <li><strong className="text-foreground">Deletion</strong> — request deletion of your data ("right to be forgotten").</li>
                  <li><strong className="text-foreground">Portability</strong> — request your data in a machine-readable format.</li>
                  <li><strong className="text-foreground">Objection</strong> — object to processing based on legitimate interests.</li>
                </ul>
                <p className="mt-2">To exercise any of these rights, email us at <a href="mailto:privacy@syrflow.com" className="text-[#0066cc] dark:text-[#2997ff] hover:underline">privacy@syrflow.com</a>. We will respond within 30 days.</p>
              </Section>
              <Section title="10. International Data Transfers">
                <p>Your data may be processed and stored in countries outside your own. Where required, we implement appropriate safeguards such as Standard Contractual Clauses to ensure your data is protected.</p>
              </Section>
              <Section title="11. Children">
                <p>The Service is not directed at children under 18. We do not knowingly collect personal data from minors. If you believe a minor has provided us with personal data, please contact us and we will delete it promptly.</p>
              </Section>
              <Section title="12. Changes to This Policy">
                <p>We may update this Privacy Policy periodically. We will notify you of material changes by email or by posting a notice on the Service. Continued use after changes constitutes acceptance.</p>
              </Section>
              <Section title="13. Contact">
                <p>For privacy-related questions or requests, contact our Data Controller at <a href="mailto:privacy@syrflow.com" className="text-[#0066cc] dark:text-[#2997ff] hover:underline">privacy@syrflow.com</a>. The Platform is operated by <strong className="text-foreground">Osaad</strong> (also trading as <strong className="text-foreground">Osaad.tech</strong>), United Arab Emirates.</p>
              </Section>
            </>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
