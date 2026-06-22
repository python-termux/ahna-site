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

export default function TermsPage() {
  const { lang, t } = useLanguage();
  const isAr = lang === "ar";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteHeader />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-16 w-full">
        <h1 className="text-3xl font-bold mb-2">{t.terms.title}</h1>
        <p className="text-sm text-gray-500 mb-12">{t.terms.updated}</p>

        <div className="space-y-10 text-sm leading-relaxed">

          {isAr ? (
            <>
              <Section title="١. الموافقة على الشروط">
                <p>تحكم شروط الخدمة هذه ("الشروط") وصولك إلى منصة <strong className="text-foreground">syrflow.com</strong> واستخدامك لها. بإنشاء حساب أو استخدام المنصة، فإنك توافق على الالتزام بهذه الشروط. إذا كنت لا توافق، فلا تستخدم المنصة.</p>
              </Section>
              <Section title="٢. وصف الخدمة">
                <p>syrflow.com هي منصة تتيح للشركات والأفراد في سوريا والمنطقة العربية إنشاء موقع ويب احترافي من صفحة واحدة عن طريق استيراد البيانات من ملفهم التجاري على Google. تُقدَّم الخدمة على أساس الاشتراك بدءاً من دولارين شهرياً.</p>
              </Section>
              <Section title="٣. الاشتراكات والدفع">
                <p>تُقدَّم الخدمة على أساس اشتراك متكرر (شهري أو سنوي).</p>
                <p>نقبل الدفع عبر <strong className="text-foreground">Sham Cash</strong> والتحويل البنكي السوري. للاشتراك وإتمام الدفع، تواصل معنا عبر واتساب على <a href="https://wa.me/963994831314" target="_blank" rel="noopener noreferrer" className="text-[#0066cc] dark:text-[#2997ff] hover:underline"><bdi dir="ltr">+963 994 831 314</bdi></a> أو عبر البريد <a href="mailto:team@syrflow.com" className="text-[#0066cc] dark:text-[#2997ff] hover:underline">team@syrflow.com</a> وسيرد فريقنا خلال 24 ساعة لإرشادك بخطوات الدفع وتفعيل حسابك.</p>
                <p>جميع الأسعار مُدرجة بالدولار الأمريكي ما لم يُذكر خلاف ذلك. رسوم الاشتراك تُحصَّل في بداية كل فترة فوترة.</p>
              </Section>
              <Section title="٤. الإلغاء">
                <p>يمكنك إلغاء اشتراكك في أي وقت بمراسلتنا على <a href="mailto:team@syrflow.com" className="text-[#0066cc] dark:text-[#2997ff] hover:underline">team@syrflow.com</a>. يسري الإلغاء في نهاية فترة الفوترة الحالية، وتحتفظ بحق الوصول إلى الخدمة حتى ذلك الحين.</p>
              </Section>
              <Section title="٥. استرداد المبالغ">
                <p>إذا حصل موقعك على أقل من 100 زيارة خلال أول 7 أيام من الاشتراك، يحق لك طلب استرداد كامل خلال تلك الفترة.</p>
              </Section>
              <Section title="٦. حسابات المستخدمين">
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>يجب تقديم معلومات دقيقة وكاملة عند إنشاء الحساب.</li>
                  <li>أنت مسؤول عن الحفاظ على أمان بيانات تسجيل الدخول الخاصة بك.</li>
                  <li>يجب أن يكون عمرك 18 عاماً على الأقل.</li>
                  <li>لا يُسمح بمشاركة الحسابات أو إنشاء حسابات متعددة لنفس الشركة.</li>
                </ul>
              </Section>
              <Section title="٧. الاستخدام المقبول">
                <p>توافق على عدم استخدام الخدمة من أجل:</p>
                <ul className="list-disc pl-5 space-y-1.5 mt-2">
                  <li>نشر معلومات تجارية كاذبة أو مضللة أو احتيالية.</li>
                  <li>انتهاك حقوق الملكية الفكرية لأطراف ثالثة.</li>
                  <li>توزيع البريد العشوائي أو البرامج الضارة أو المحتوى الضار.</li>
                  <li>محاولة الوصول غير المصرح به إلى أي أنظمة أو شبكات.</li>
                  <li>انتهاك أي قوانين أو لوائح سارية في سوريا أو في بلد المستخدم.</li>
                </ul>
              </Section>
              <Section title="٨. إزالة المحتوى">
                <p>نحتفظ بالحق في إزالة أي محتوى أو تعليق أو تعطيل أي حساب يتضمن محتوى مخالفاً للقانون السوري، أو ضاراً، أو مسيئاً، أو ينتهك حقوق الآخرين، وذلك <strong className="text-foreground">دون إشعار مسبق</strong> وبتقديرنا المطلق.</p>
              </Section>
              <Section title="٩. الملكية الفكرية">
                <p>تحتفظ بملكية جميع المحتوى الذي تقدمه. بتقديم المحتوى، تمنح syrflow.com ترخيصاً غير حصري وخالياً من حقوق الملكية لاستضافة المحتوى وعرضه وتسليمه بهدف تشغيل الخدمة فقط. تحتفظ syrflow.com بجميع الحقوق المتعلقة بمنصتها وتصميمها وعلامتها التجارية.</p>
              </Section>
              <Section title="١٠. إخلاء المسؤولية">
                <p>تُقدَّم الخدمة "كما هي" و"حسب التوفر" دون أي ضمان من أي نوع. لا نضمن التشغيل المتواصل أو الخالي من الأخطاء. البيانات التجارية المستوردة من Google Maps هي للتسهيل فقط؛ أنت مسؤول عن التحقق من دقتها.</p>
              </Section>
              <Section title="١١. تحديد المسؤولية">
                <p>إلى أقصى حد يسمح به القانون المعمول به، لن تكون syrflow.com مسؤولة عن أي أضرار غير مباشرة أو عرضية أو خاصة أو تبعية ناجمة عن استخدامك للخدمة.</p>
              </Section>
              <Section title="١٢. الإنهاء">
                <p>نحتفظ بالحق في تعليق حسابك أو إنهائه في أي وقت في حال انتهاك هذه الشروط أو النشاط الاحتيالي أو عدم الدفع. عند الإنهاء، يتوقف حقك في استخدام الخدمة فوراً.</p>
              </Section>
              <Section title="١٣. التغييرات على الشروط">
                <p>قد نحدّث هذه الشروط بصورة دورية. سنُعلمك بالتغييرات الجوهرية عبر البريد الإلكتروني أو بنشر إشعار على المنصة. الاستمرار في الاستخدام بعد التغييرات يُعدّ قبولاً لها.</p>
              </Section>
              <Section title="١٤. القانون الحاكم">
                <p>تخضع هذه الشروط لقوانين الجمهورية العربية السورية. تخضع أي نزاعات للاختصاص القضائي للمحاكم السورية المختصة.</p>
              </Section>
              <Section title="١٥. التواصل">
                <p>للاستفسار عن هذه الشروط، تواصل معنا على <a href="mailto:team@syrflow.com" className="text-[#0066cc] dark:text-[#2997ff] hover:underline">team@syrflow.com</a> أو عبر واتساب على <a href="https://wa.me/963994831314" target="_blank" rel="noopener noreferrer" className="text-[#0066cc] dark:text-[#2997ff] hover:underline"><bdi dir="ltr">+963 994 831 314</bdi></a>.</p>
              </Section>
            </>
          ) : (
            <>
              <Section title="1. Agreement to Terms">
                <p>These Terms of Service ("Terms") govern your access to and use of the platform at <strong className="text-foreground">syrflow.com</strong> ("Platform", "Service", "we", "us"). By creating an account or using the Platform you agree to be bound by these Terms. If you do not agree, do not use the Platform.</p>
              </Section>
              <Section title="2. Description of Service">
                <p>syrflow.com is a platform that allows businesses and individuals in Syria and the Arab world to create a professional one-page website by importing data from their Google Business Profile. The Service is offered on a subscription basis starting from $2/month.</p>
              </Section>
              <Section title="3. Subscriptions and Payment">
                <p>The Service is offered on a recurring subscription basis (monthly or annually).</p>
                <p>We accept payment via <strong className="text-foreground">Sham Cash</strong> and Syrian bank transfer. To subscribe and complete payment, contact us on WhatsApp at <a href="https://wa.me/963994831314" target="_blank" rel="noopener noreferrer" className="text-[#0066cc] dark:text-[#2997ff] hover:underline"><bdi dir="ltr">+963 994 831 314</bdi></a> or by email at <a href="mailto:team@syrflow.com" className="text-[#0066cc] dark:text-[#2997ff] hover:underline">team@syrflow.com</a> and our team will respond within 24 hours with payment instructions and account activation.</p>
                <p>All prices are listed in USD unless otherwise stated. Subscription fees are charged at the start of each billing period.</p>
              </Section>
              <Section title="4. Cancellation">
                <p>You may cancel your subscription at any time by emailing <a href="mailto:team@syrflow.com" className="text-[#0066cc] dark:text-[#2997ff] hover:underline">team@syrflow.com</a>. Cancellation takes effect at the end of the current billing period. You retain access to the Service until then.</p>
              </Section>
              <Section title="5. Refunds">
                <p>If your website receives fewer than 100 visitors in the first 7 days of your subscription, you are eligible for a full refund within that window.</p>
              </Section>
              <Section title="6. User Accounts">
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>You must provide accurate and complete information when creating an account.</li>
                  <li>You are responsible for maintaining the security of your login credentials.</li>
                  <li>You must be at least 18 years old.</li>
                  <li>You may not share accounts or create multiple accounts for the same business.</li>
                </ul>
              </Section>
              <Section title="7. Acceptable Use">
                <p>You agree not to use the Service to:</p>
                <ul className="list-disc pl-5 space-y-1.5 mt-2">
                  <li>Publish false, misleading, or fraudulent business information.</li>
                  <li>Infringe the intellectual property rights of third parties.</li>
                  <li>Distribute spam, malware, or harmful content.</li>
                  <li>Attempt unauthorised access to any systems or networks.</li>
                  <li>Violate any applicable laws or regulations in Syria or in the user&apos;s country.</li>
                </ul>
              </Section>
              <Section title="8. Content Removal">
                <p>We reserve the right to remove any content or suspend any account containing content that violates Syrian law, is illegal, harmful, offensive, or infringes the rights of others — <strong className="text-foreground">without prior notice</strong> and at our sole discretion.</p>
              </Section>
              <Section title="9. Intellectual Property">
                <p>You retain ownership of all content you submit. By submitting content, you grant syrflow.com a non-exclusive, royalty-free licence to host, display, and deliver that content solely to operate the Service. syrflow.com retains all rights to its platform, design, and branding.</p>
              </Section>
              <Section title="10. Disclaimers">
                <p>The Service is provided "as is" and "as available" without warranty of any kind. We do not guarantee uninterrupted or error-free operation. Business data imported from Google Maps is for convenience — you are responsible for verifying its accuracy.</p>
              </Section>
              <Section title="11. Limitation of Liability">
                <p>To the maximum extent permitted by applicable law, syrflow.com shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service.</p>
              </Section>
              <Section title="12. Termination">
                <p>We reserve the right to suspend or terminate your account at any time for violation of these Terms, fraudulent activity, or non-payment. Upon termination, your right to use the Service ceases immediately.</p>
              </Section>
              <Section title="13. Changes to Terms">
                <p>We may update these Terms periodically. We will notify you of material changes by email or by posting a notice on the Service. Continued use after changes constitutes acceptance.</p>
              </Section>
              <Section title="14. Governing Law">
                <p>These Terms are governed by the laws of the Syrian Arab Republic. Any disputes shall be subject to the jurisdiction of the competent Syrian courts.</p>
              </Section>
              <Section title="15. Contact">
                <p>For questions about these Terms, contact us at <a href="mailto:team@syrflow.com" className="text-[#0066cc] dark:text-[#2997ff] hover:underline">team@syrflow.com</a> or on WhatsApp at <a href="https://wa.me/963994831314" target="_blank" rel="noopener noreferrer" className="text-[#0066cc] dark:text-[#2997ff] hover:underline"><bdi dir="ltr">+963 994 831 314</bdi></a>.</p>
              </Section>
            </>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
