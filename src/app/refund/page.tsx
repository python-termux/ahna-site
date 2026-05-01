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

export default function RefundPage() {
  const { lang, t } = useLanguage();
  const isAr = lang === "ar";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteHeader />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-16 w-full">
        <h1 className="text-3xl font-bold mb-2">{t.refund.title}</h1>
        <p className="text-sm text-gray-500 mb-12">{t.refund.updated}</p>

        <div className="space-y-10 text-sm leading-relaxed">

          {isAr ? (
            <>
              <Section title="نظرة عامة">
                <p>تنطبق سياسة الاسترداد هذه على اشتراكات منصة <strong className="text-foreground">syrflow.com</strong>. نؤمن بتقديم خدمة تستحق كل ريال تدفعه، لذلك وضعنا سياسة استرداد واضحة وعادلة.</p>
              </Section>
              <Section title="متى يحق لك الاسترداد؟">
                <p>يحق لك طلب استرداد كامل إذا تحققت الشروط التالية:</p>
                <ul className="list-disc pl-5 space-y-1.5 mt-2">
                  <li>حصل موقعك على <strong className="text-foreground">أقل من 100 زيارة</strong> خلال أول 7 أيام من تفعيل اشتراكك.</li>
                  <li>قدّمت طلب الاسترداد <strong className="text-foreground">خلال 7 أيام</strong> من تاريخ بدء الاشتراك.</li>
                </ul>
                <p className="mt-2">هذا يعني أننا نضمن لك حداً أدنى من الظهور — فإذا لم يصلك عملاء، نردّ لك المال.</p>
              </Section>
              <Section title="حالات لا يُمنح فيها الاسترداد">
                <p>لا نصدر استردادات في الحالات التالية:</p>
                <ul className="list-disc pl-5 space-y-1.5 mt-2">
                  <li>انتهت فترة الـ 7 أيام منذ بدء الاشتراك.</li>
                  <li>حصل الموقع على 100 زيارة أو أكثر خلال الـ 7 أيام الأولى.</li>
                  <li>نسيان إلغاء الاشتراك قبل تاريخ التجديد.</li>
                  <li>تعليق الحساب أو إنهاؤه بسبب انتهاك <Link href="/terms" className="text-[#0066cc] dark:text-[#2997ff] hover:underline">شروط الخدمة</Link>.</li>
                </ul>
              </Section>
              <Section title="الاشتراكات السنوية">
                <p>تسري سياسة الاسترداد ذاتها (أقل من 100 زيارة خلال 7 أيام) على الاشتراكات السنوية أيضاً. بعد انتهاء فترة الـ 7 أيام، تصبح الاشتراكات السنوية غير قابلة للاسترداد إلا في حالة خلل تقني من جانبنا منع تقديم الخدمة كلياً.</p>
              </Section>
              <Section title="كيفية طلب الاسترداد">
                <p>لطلب الاسترداد، راسلنا على <a href="mailto:team@syrflow.com" className="text-[#0066cc] dark:text-[#2997ff] hover:underline">team@syrflow.com</a> مع المعلومات التالية:</p>
                <ul className="list-disc pl-5 space-y-1.5 mt-2">
                  <li>عنوان البريد الإلكتروني المرتبط بحسابك.</li>
                  <li>تاريخ بدء الاشتراك.</li>
                  <li>سبب طلب الاسترداد.</li>
                </ul>
                <p>سنردّ خلال <strong className="text-foreground">3 أيام عمل</strong>. تتم معالجة الاستردادات المعتمدة خلال 5-10 أيام عمل.</p>
              </Section>
              <Section title="الأعطال التقنية">
                <p>إذا تعذّر عليك استخدام الخدمة بسبب خلل تقني من جانبنا أو تم تحصيل رسوم مضاعفة، نعالج طلبات الاسترداد فوراً بصرف النظر عن أي قيود زمنية.</p>
              </Section>
              <Section title="التواصل">
                <p>للاستفسار عن الاستردادات، تواصل معنا على <a href="mailto:team@syrflow.com" className="text-[#0066cc] dark:text-[#2997ff] hover:underline">team@syrflow.com</a>. نهدف إلى الرد خلال 3 أيام عمل.</p>
              </Section>
            </>
          ) : (
            <>
              <Section title="Overview">
                <p>This Refund Policy applies to subscriptions for the <strong className="text-foreground">syrflow.com</strong> platform. We believe in providing a service worth every dollar you pay, so we have a clear and fair refund policy.</p>
              </Section>
              <Section title="When Are You Eligible for a Refund?">
                <p>You are eligible for a full refund if all of the following conditions are met:</p>
                <ul className="list-disc pl-5 space-y-1.5 mt-2">
                  <li>Your website received <strong className="text-foreground">fewer than 100 visitors</strong> in the first 7 days of your subscription.</li>
                  <li>You submit your refund request <strong className="text-foreground">within 7 days</strong> of your subscription start date.</li>
                </ul>
                <p className="mt-2">This means we guarantee a minimum level of visibility — if customers aren&apos;t reaching you, we refund your money.</p>
              </Section>
              <Section title="Non-Refundable Situations">
                <p>We do not issue refunds in the following cases:</p>
                <ul className="list-disc pl-5 space-y-1.5 mt-2">
                  <li>The 7-day window from your subscription start has passed.</li>
                  <li>Your website received 100 or more visitors during the first 7 days.</li>
                  <li>You forgot to cancel before your renewal date.</li>
                  <li>Your account was suspended or terminated due to a violation of our <Link href="/terms" className="text-[#0066cc] dark:text-[#2997ff] hover:underline">Terms of Service</Link>.</li>
                </ul>
              </Section>
              <Section title="Annual Subscriptions">
                <p>The same refund policy applies to annual subscriptions (fewer than 100 visitors within 7 days). After the 7-day window, annual subscriptions are non-refundable unless a technical fault on our side prevented service delivery entirely.</p>
              </Section>
              <Section title="How to Request a Refund">
                <p>To request a refund, email <a href="mailto:team@syrflow.com" className="text-[#0066cc] dark:text-[#2997ff] hover:underline">team@syrflow.com</a> with:</p>
                <ul className="list-disc pl-5 space-y-1.5 mt-2">
                  <li>Your account email address.</li>
                  <li>Your subscription start date.</li>
                  <li>The reason for your refund request.</li>
                </ul>
                <p>We will respond within <strong className="text-foreground">3 business days</strong>. Approved refunds are processed within 5–10 business days.</p>
              </Section>
              <Section title="Technical Faults">
                <p>If you were unable to use the Service due to a technical fault on our side, or were charged twice for the same period, we process refund requests immediately regardless of any time restrictions.</p>
              </Section>
              <Section title="Contact">
                <p>For refund enquiries, contact us at <a href="mailto:team@syrflow.com" className="text-[#0066cc] dark:text-[#2997ff] hover:underline">team@syrflow.com</a>. We aim to respond within 3 business days.</p>
              </Section>
            </>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
