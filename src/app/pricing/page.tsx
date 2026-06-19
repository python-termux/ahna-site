"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Zap, ChevronDown, Flame } from "lucide-react";
import InView from "@/components/InView";

// framer-motion kept only for FAQ accordion open/close animation
import Footer from "@/components/Footer";
import SiteHeader from "@/components/SiteHeader";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/language";

const TOTAL_SLOTS = 10;


const baseEn = [
  { name: "Ai Content Generation",  included: true,  value: "Unlimited" },
  { name: "Website Edits",          included: true,  value: "Unlimited" },
  { name: "Multiple Theme Changes",  included: true,  value: "Yes" },
  { name: "Multi-language Support",  included: true,  value: "Yes" },
  { name: "Unlimited Image Search",  included: true,  value: "Yes" },
  { name: "Free Subdomain",          included: true,  value: "yourbiz.syrflow.com" },
  { name: "Ai Auto Fill",            included: true,  value: "Yes" },
  { name: "Syrflow Badge",           included: true,  value: "Footer" },
  { name: "Online Support",          included: true,  value: "Email" },
  { name: "Website Views Counter",   included: false, value: "No" },
];

const googleFeaturesEn  = [{ name: "Google Reviews Export",   included: true, value: "Yes" }, ...baseEn];
const facebookFeaturesEn = [{ name: "Facebook Posts Export",   included: true, value: "Yes" }, ...baseEn];
const telegramFeaturesEn = [{ name: "Telegram Channel Export", included: true, value: "Yes" }, ...baseEn];

const plansEn = [
  {
    name: "With Google Link", price: 2, period: "monthly", yearlyPrice: 20,
    description: "Perfect for businesses that have a Google Business profile.",
    icon: "/pricing/star-94.png", buttonText: "Get started", popular: false, comingSoon: false,
    features: googleFeaturesEn,
  },
  {
    name: "With Facebook", price: 2, period: "monthly", yearlyPrice: 20,
    description: "Import your business directly from your Facebook Page. Coming soon.",
    icon: "/pricing/fire-94.png", buttonText: "Coming Soon", popular: false, comingSoon: true,
    features: facebookFeaturesEn,
  },
  {
    name: "With Telegram", price: 2, period: "monthly", yearlyPrice: 20,
    description: "Import your business from your Telegram channel or group. Coming soon.",
    icon: "/pricing/crown-94.png", buttonText: "Coming Soon", popular: false, comingSoon: true,
    features: telegramFeaturesEn,
  },
];

const baseAr = [
  { name: "إنشاء محتوى بالذكاء الاصطناعي",       included: true,  value: "غير محدود" },
  { name: "تعديلات الموقع",                       included: true,  value: "غير محدودة" },
  { name: "تغيير الثيمات المتعددة",                included: true,  value: "نعم" },
  { name: "دعم متعدد اللغات",                      included: true,  value: "نعم" },
  { name: "بحث صور غير محدود",                    included: true,  value: "نعم" },
  { name: "نطاق فرعي مجاني",                       included: true,  value: "yourbiz.syrflow.com" },
  { name: "التعبئة التلقائية بالذكاء الاصطناعي",  included: true,  value: "نعم" },
  { name: "شارة Syrflow",                         included: true,  value: "تذييل الصفحة" },
  { name: "الدعم الإلكتروني",                      included: true,  value: "البريد الإلكتروني" },
  { name: "عداد مشاهدات الموقع",                  included: false, value: "لا" },
];

const googleFeaturesAr  = [{ name: "تصدير تقييمات Google",    included: true, value: "نعم" }, ...baseAr];
const facebookFeaturesAr = [{ name: "تصدير منشورات فيسبوك",   included: true, value: "نعم" }, ...baseAr];
const telegramFeaturesAr = [{ name: "تصدير قناة تيليجرام",    included: true, value: "نعم" }, ...baseAr];

const plansAr = [
  {
    name: "مع رابط جوجل", price: 2, period: "شهرياً", yearlyPrice: 20,
    description: "مثالي للأعمال التي لديها ملف تجاري على Google.",
    icon: "/pricing/star-94.png", buttonText: "ابدأ الآن", popular: false, comingSoon: false,
    features: googleFeaturesAr,
  },
  {
    name: "مع فيسبوك", price: 2, period: "شهرياً", yearlyPrice: 20,
    description: "استورد نشاطك التجاري مباشرة من صفحة Facebook الخاصة بك. قريباً.",
    icon: "/pricing/fire-94.png", buttonText: "قريباً", popular: false, comingSoon: true,
    features: facebookFeaturesAr,
  },
  {
    name: "مع تيليجرام", price: 2, period: "شهرياً", yearlyPrice: 20,
    description: "استورد نشاطك التجاري من قناة أو مجموعة Telegram. قريباً.",
    icon: "/pricing/crown-94.png", buttonText: "قريباً", popular: false, comingSoon: true,
    features: telegramFeaturesAr,
  },
];

const faqsEn = [
  { question: "What is SyrFlow?", answer: "SyrFlow is a platform that turns your Google Maps business link into a professional one-page website in minutes. No coding or design skills required — just paste your link and you're live." },
  { question: "How does it work?", answer: "Paste your Google Maps link, choose your free subdomain (yourbiz.syrflow.com), and your website is live. We automatically import your business name, photos, reviews, opening hours, and contact info." },
  { question: "How much does it cost?", answer: "Plans start from $2/month — cheaper than a pizza and cheaper than any website developer. See the pricing table above for full plan details." },
  { question: "What payment methods do you accept?", answer: "We accept Sham Cash and Syrian bank transfer. Contact us at team@syrflow.com to complete your payment and our team will activate your account within 24 hours." },
  { question: "Does SyrFlow support Arabic?", answer: "Yes! Full Arabic support with RTL layout is built in on all plans. You can switch between Arabic and English at any time, and your visitors can do the same." },
  { question: "Will my website appear on Google?", answer: "Yes. Every website created with SyrFlow is automatically optimized for search engines (SEO) so customers can find your business on Google without any extra work from you." },
  { question: "Do I need to buy a domain?", answer: "No. You get a free subdomain (yourbiz.syrflow.com) immediately at no cost. Custom domain support (like yourbusiness.com) is available on Pro and Enterprise plans." },
  { question: "Can I edit my website after it's created?", answer: "Yes. You can update text, images, services, hours, and contact details anytime from your easy-to-use dashboard. No technical skills needed. All plans include unlimited edits." },
  { question: "What if I'm not satisfied?", answer: "If your website receives fewer than 100 visitors in the first 7 days of your subscription, you are eligible for a full refund within that 7-day window." },
  { question: "How do I get started?", answer: "Register at syrflow.com, paste your Google Maps link, choose your subdomain, and you're live in under 3 minutes. No credit card required to sign up." },
];

const faqsAr = [
  { question: "ما هو سوريا فلو؟", answer: "سوريا فلو هي منصة تحوّل رابط نشاطك التجاري على Google Maps إلى موقع احترافي من صفحة واحدة في دقائق. لا حاجة لبرمجة أو تصميم — الصق رابطك وموقعك حي." },
  { question: "كيف تعمل المنصة؟", answer: "الصق رابط Google Maps، اختر نطاقك الفرعي المجاني (yourbiz.syrflow.com)، وسيكون موقعك حياً. نستورد تلقائياً اسم نشاطك والصور والتقييمات وساعات العمل ومعلومات الاتصال." },
  { question: "كم تكلف الخدمة؟", answer: "تبدأ الخطط من دولارين شهرياً — أرخص من بيتزا وأرخص من أي مطور مواقع. اطلع على جدول الأسعار أعلاه للتفاصيل الكاملة." },
  { question: "ما طرق الدفع المتاحة؟", answer: "نقبل Sham Cash والتحويل البنكي السوري. تواصل معنا على team@syrflow.com لإتمام الدفع وسيفعّل فريقنا حسابك خلال 24 ساعة." },
  { question: "هل تدعم المنصة اللغة العربية؟", answer: "نعم! الدعم العربي الكامل مع تخطيط RTL مدمج في جميع الخطط. يمكنك ولزوارك التبديل بين العربية والإنجليزية في أي وقت." },
  { question: "هل سيظهر موقعي على Google؟", answer: "نعم. كل موقع يُنشأ مع سوريا فلو يُحسَّن تلقائياً لمحركات البحث (SEO) حتى يجدك العملاء على Google دون أي جهد إضافي منك." },
  { question: "هل أحتاج إلى شراء نطاق؟", answer: "لا. تحصل على نطاق فرعي مجاني (yourbiz.syrflow.com) فوراً بدون تكلفة. دعم النطاقات المخصصة (مثل yourbusiness.com) متاح في خطط Pro وEnterprise." },
  { question: "هل يمكنني تعديل موقعي بعد إنشائه؟", answer: "نعم. يمكنك تحديث النصوص والصور والخدمات وساعات العمل ومعلومات الاتصال في أي وقت من لوحة التحكم. لا تتطلب مهارات تقنية. جميع الخطط تشمل تعديلات غير محدودة." },
  { question: "ماذا لو لم أكن راضياً؟", answer: "إذا حصل موقعك على أقل من 100 زيارة في أول 7 أيام من اشتراكك، يحق لك طلب استرداد كامل خلال تلك الفترة." },
  { question: "كيف أبدأ؟", answer: "سجّل في syrflow.com، الصق رابط Google Maps، اختر نطاقك الفرعي، وستكون حياً في أقل من 3 دقائق. لا يتطلب الاشتراك بطاقة ائتمانية." },
];

export default function PricingPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [slotsLeft, setSlotsLeft] = useState<number | null>(null);
  const { lang, t } = useLanguage();

  const plans = lang === "ar" ? plansAr : plansEn;
  const faqs  = lang === "ar" ? faqsAr  : faqsEn;

  useEffect(() => {
    const supabase = createClient();
    async function fetchCount() {
      const { data, error } = await supabase.rpc("get_registered_user_count");
      if (!error && typeof data === "number") setSlotsLeft(Math.max(0, TOTAL_SLOTS - data));
    }
    fetchCount();
    const channel = supabase
      .channel("pricing-user-count")
      .on("postgres_changes", { event: "*", schema: "public", table: "businesses" }, fetchCount)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">

      <SiteHeader />

      {/* Header */}
      <section className="flex flex-col items-center text-center px-4 sm:px-6 pt-16 pb-12 max-w-3xl mx-auto">
        <div
          className="anim-up inline-flex items-center gap-2 border text-xs font-medium px-3 py-1.5 rounded-[6px] mb-6"
          style={{ backgroundColor: "rgba(0,102,204,0.08)", borderColor: "rgba(0,102,204,0.2)", color: "#0066cc" }}
        >
          <Zap size={12} />
          {t.pricing.badge}
        </div>

        <h1 className="anim-up anim-d1 text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-4">
          {t.pricing.h1a}
          <br />
          <span style={{ color: "#0066cc" }}>{t.pricing.h1b}</span>
        </h1>

        <p className="anim-up anim-d2 text-sm text-muted-foreground mb-8 max-w-xl">
          {t.pricing.sub}
        </p>
      </section>

      {/* Cards */}
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, pi) => (
            <InView
              key={plan.name}
              delay={pi * 0.1}
              animation="up"
              className="relative rounded-[6px] transition-all duration-300 bg-card border"
              style={plan.comingSoon ? { borderColor: "rgba(16,185,129,0.28)" } : undefined}
            >
              {plan.comingSoon && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="text-xs font-semibold px-3 py-1 rounded-[4px]"
                    style={{ backgroundColor: "#064e3b", color: "#34d399", border: "1px solid #10b981" }}>
                    {lang === "ar" ? "قريباً" : "Coming Soon"}
                  </span>
                </div>
              )}

              <div className="p-6" style={plan.comingSoon ? { opacity: 0.65 } : undefined}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-[6px] bg-accent flex items-center justify-center overflow-hidden">
                    <Image src={plan.icon} alt={`${plan.name} icon`} width={20} height={20} className="object-contain" />
                  </div>
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                </div>

                <div className="mb-3">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    ${plan.yearlyPrice} {t.pricing.billedAnnually}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">{plan.description}</p>
                </div>

                {plan.comingSoon ? (
                  <div className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[8px] font-medium mb-6 cursor-not-allowed select-none"
                    style={{ border: "1px solid rgba(16,185,129,0.4)", color: "#10b981" }}>
                    {plan.buttonText}
                  </div>
                ) : slotsLeft === 0 ? (
                  <button disabled className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[8px] font-medium mb-6 border border-border bg-secondary text-muted-foreground opacity-50 cursor-not-allowed">
                    {t.pricing.fullyBooked}
                  </button>
                ) : (
                  <Link
                    href="/register"
                    className="w-full flex items-center justify-center gap-2 py-2.5 font-medium transition-opacity hover:opacity-90 active:scale-95 mb-6 border border-[#0066cc] text-[#0066cc] rounded-[8px]"
                  >
                    {slotsLeft === null ? (
                      <span className="opacity-60">{t.pricing.loading}</span>
                    ) : (
                      <>
                        <Flame size={14} className="text-orange-400 shrink-0" />
                        {t.pricing.slotsLeft(slotsLeft)}
                      </>
                    )}
                  </Link>
                )}

                <div className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      {feature.included ? (
                        <Check size={16} className="text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      ) : (
                        <X size={16} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <span className="text-muted-foreground">{feature.name}:</span>
                        <span className={`ml-1 font-medium ${feature.included ? "text-foreground" : "text-muted-foreground"}`}>
                          {feature.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </InView>
          ))}
        </div>
      </section>

      {/* FAQs */}
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 pb-24">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">{t.pricing.faqTitle}</h2>
          <p className="text-muted-foreground text-sm">{t.pricing.faqSub}</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-card rounded-[6px] border border-border overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <span className="text-sm font-medium">{faq.question}</span>
                <motion.div animate={{ rotate: openIndex === index ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown size={16} className="text-muted-foreground" />
                </motion.div>
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-3 text-sm text-muted-foreground border-t border-border">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
