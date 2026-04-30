"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Zap, ChevronDown, Flame } from "lucide-react";
import Footer from "@/components/Footer";
import SiteHeader from "@/components/SiteHeader";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/language";

const TOTAL_SLOTS = 10;

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = (delay: number) => ({
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: delay } },
});

const VIEWPORT = { once: true, amount: 0.2 };

const plansEn = [
  {
    name: "Basic", price: 8.25, period: "monthly", yearlyPrice: 99,
    description: "Perfect for new small businesses (cafes, salons, Tourism Agencies, etc.)",
    icon: "/pricing/star-94.png", buttonText: "Limited - 10 Slots left", popular: false,
    features: [
      { name: "Ai Content Generation", included: true, value: "one time use" },
      { name: "Google Reviews Export", included: true, value: "Yes" },
      { name: "Website Edits", included: true, value: "Unlimited" },
      { name: "Multiple Theme Changes", included: true, value: "yes" },
      { name: "Multi-language Support", included: true, value: "Only English" },
      { name: "Syrflow Badge", included: true, value: "Footer" },
      { name: "Syrflow Popup", included: true, value: "5 min Inactivity" },
      { name: "Online Support - Assistant", included: true, value: "Email" },
      { name: "Auto update Google reviews", included: false, value: "No" },
      { name: "Auto update Google Photos", included: false, value: "No" },
      { name: "Custom domain", included: false, value: "No" },
      { name: "Ai Auto Fill", included: false, value: "No" },
      { name: "Website Views Counter", included: false, value: "no" },
    ],
  },
  {
    name: "Pro", price: 15, period: "monthly", yearlyPrice: 180,
    description: "Best for established businesses (consulting firms, restaurants, clinics, etc.)",
    icon: "/pricing/fire-94.png", buttonText: "Get started", popular: true,
    features: [
      { name: "Ai Content Generation", included: true, value: "Limited" },
      { name: "Google Reviews Export", included: true, value: "Yes" },
      { name: "Website Edits", included: true, value: "Unlimited" },
      { name: "Multiple Theme Changes", included: true, value: "yes" },
      { name: "Multi-language Support", included: true, value: "Arabic English" },
      { name: "Syrflow Badge", included: true, value: "Footer" },
      { name: "Syrflow Popup", included: true, value: "10 min Inactivity" },
      { name: "Online Support - Assistant", included: true, value: "yes" },
      { name: "Auto update Google reviews", included: true, value: "Max 20" },
      { name: "Auto update Google Photos", included: true, value: "Max 20" },
      { name: "Custom domain", included: true, value: "Yes" },
      { name: "Ai Auto Fill", included: true, value: "Limited usage" },
      { name: "Website Views Counter", included: false, value: "no" },
    ],
  },
  {
    name: "Enterprise", price: 18, period: "monthly", yearlyPrice: 216,
    description: "Best for Arabic established businesses (consulting firms, restaurants, clinics, etc.)",
    icon: "/pricing/crown-94.png", buttonText: "Get started", popular: false,
    features: [
      { name: "Ai Content Generation", included: true, value: "Unlimited" },
      { name: "Google Reviews Export", included: true, value: "Yes" },
      { name: "Website Edits", included: true, value: "Unlimited" },
      { name: "Multiple Theme Changes", included: true, value: "yes" },
      { name: "Multi-language Support", included: true, value: "Arabic English" },
      { name: "Syrflow Badge", included: true, value: "Badge Removed" },
      { name: "Syrflow Popup", included: true, value: "Never" },
      { name: "Online Support - Assistant", included: true, value: "yes" },
      { name: "Auto update Google reviews", included: true, value: "Unlimited" },
      { name: "Auto update Google Photos", included: true, value: "Unlimited" },
      { name: "Custom domain", included: true, value: "Yes" },
      { name: "Ai Auto Fill", included: true, value: "Unlimited" },
      { name: "Website Views Counter", included: true, value: "yes" },
    ],
  },
];

const plansAr = [
  {
    name: "أساسي", price: 8.25, period: "شهرياً", yearlyPrice: 99,
    description: "مثالي للشركات الصغيرة الجديدة (المقاهي، الصالونات، وكالات السياحة، إلخ)",
    icon: "/pricing/star-94.png", buttonText: "محدود - 10 مقاعد متبقية", popular: false,
    features: [
      { name: "إنشاء محتوى بالذكاء الاصطناعي", included: true,  value: "مرة واحدة" },
      { name: "تصدير تقييمات Google",            included: true,  value: "نعم" },
      { name: "تعديلات الموقع",                  included: true,  value: "غير محدودة" },
      { name: "تغيير الثيمات المتعددة",           included: true,  value: "نعم" },
      { name: "دعم متعدد اللغات",                 included: true,  value: "الإنجليزية فقط" },
      { name: "شارة Syrflow",                    included: true,  value: "تذييل الصفحة" },
      { name: "نافذة Syrflow المنبثقة",           included: true,  value: "5 دقائق خمول" },
      { name: "الدعم الإلكتروني",                 included: true,  value: "البريد الإلكتروني" },
      { name: "تحديث تلقائي لتقييمات Google",    included: false, value: "لا" },
      { name: "تحديث تلقائي لصور Google",        included: false, value: "لا" },
      { name: "نطاق مخصص",                       included: false, value: "لا" },
      { name: "التعبئة التلقائية بالذكاء الاصطناعي", included: false, value: "لا" },
      { name: "عداد مشاهدات الموقع",             included: false, value: "لا" },
    ],
  },
  {
    name: "Pro", price: 15, period: "شهرياً", yearlyPrice: 180,
    description: "الأفضل للشركات الراسخة (شركات الاستشارات، المطاعم، العيادات، إلخ)",
    icon: "/pricing/fire-94.png", buttonText: "ابدأ الآن", popular: true,
    features: [
      { name: "إنشاء محتوى بالذكاء الاصطناعي", included: true,  value: "محدود" },
      { name: "تصدير تقييمات Google",            included: true,  value: "نعم" },
      { name: "تعديلات الموقع",                  included: true,  value: "غير محدودة" },
      { name: "تغيير الثيمات المتعددة",           included: true,  value: "نعم" },
      { name: "دعم متعدد اللغات",                 included: true,  value: "عربي وإنجليزي" },
      { name: "شارة Syrflow",                    included: true,  value: "تذييل الصفحة" },
      { name: "نافذة Syrflow المنبثقة",           included: true,  value: "10 دقائق خمول" },
      { name: "الدعم الإلكتروني",                 included: true,  value: "نعم" },
      { name: "تحديث تلقائي لتقييمات Google",    included: true,  value: "حتى 20" },
      { name: "تحديث تلقائي لصور Google",        included: true,  value: "حتى 20" },
      { name: "نطاق مخصص",                       included: true,  value: "نعم" },
      { name: "التعبئة التلقائية بالذكاء الاصطناعي", included: true, value: "استخدام محدود" },
      { name: "عداد مشاهدات الموقع",             included: false, value: "لا" },
    ],
  },
  {
    name: "Enterprise", price: 18, period: "شهرياً", yearlyPrice: 216,
    description: "الأفضل للشركات العربية الراسخة (شركات الاستشارات، المطاعم، العيادات، إلخ)",
    icon: "/pricing/crown-94.png", buttonText: "ابدأ الآن", popular: false,
    features: [
      { name: "إنشاء محتوى بالذكاء الاصطناعي", included: true, value: "غير محدود" },
      { name: "تصدير تقييمات Google",            included: true, value: "نعم" },
      { name: "تعديلات الموقع",                  included: true, value: "غير محدودة" },
      { name: "تغيير الثيمات المتعددة",           included: true, value: "نعم" },
      { name: "دعم متعدد اللغات",                 included: true, value: "عربي وإنجليزي" },
      { name: "شارة Syrflow",                    included: true, value: "بدون شارة" },
      { name: "نافذة Syrflow المنبثقة",           included: true, value: "أبداً" },
      { name: "الدعم الإلكتروني",                 included: true, value: "نعم" },
      { name: "تحديث تلقائي لتقييمات Google",    included: true, value: "غير محدود" },
      { name: "تحديث تلقائي لصور Google",        included: true, value: "غير محدود" },
      { name: "نطاق مخصص",                       included: true, value: "نعم" },
      { name: "التعبئة التلقائية بالذكاء الاصطناعي", included: true, value: "غير محدود" },
      { name: "عداد مشاهدات الموقع",             included: true, value: "نعم" },
    ],
  },
];

const faqsEn = [
  { question: "What is AI Content Generation and how does it work?", answer: "AI Content Generation automatically creates professional website content including headings, descriptions, and taglines based on your business type. Basic plan includes one-time use, while Pro and Enterprise plans offer unlimited generations. Simply enter your business details and our AI does the rest in seconds." },
  { question: "How many Google reviews can I export with each plan?", answer: "Basic plan allows you to export up to 10 reviews, Pro plan allows up to 20 reviews, and Enterprise plan offers unlimited review exports. This helps you showcase social proof on your website and build trust with potential customers." },
  { question: "Can I edit my website after it's created?", answer: "Yes! All plans include unlimited website edits. You can update text, images, colors, and layout anytime from your easy-to-use dashboard. No technical skills required." },
  { question: "What does Multi-language Support mean for my website?", answer: "Basic plan supports English only. Pro and Enterprise plans support both Arabic and English languages, allowing you to reach a wider audience in the UAE and across the Middle East." },
  { question: "What kind of customer support do I get?", answer: "Basic plan includes email support. Pro and Enterprise plans include priority online assistant support with faster response times and dedicated help for any issues you encounter." },
  { question: "How does Auto update Google reviews and photos work?", answer: "Pro plan auto-updates up to 20 reviews and photos. Enterprise plan offers unlimited auto-updates. Your website will automatically sync with your Google Maps listing, keeping your reviews and photos current without any manual work." },
  { question: "Can I connect my own custom domain?", answer: "Basic plan does not include custom domain support. Pro and Enterprise plans allow you to connect your own domain (like yourbusiness.com) to your website for a professional look." },
  { question: "What is AI Auto Fill and how does it save me time?", answer: "AI Auto Fill automatically populates your website with business information, contact details, and service descriptions. Available on Pro and Enterprise plans (unlimited use), it saves hours of manual data entry." },
  { question: "Is there a contract or cancellation fee?", answer: "No contracts or cancellation fees! You can cancel anytime. All plans are billed monthly or annually (save 20% with annual billing). You keep your website data even after cancellation." },
  { question: "How do I get started with syrflow.com?", answer: "Simply choose your plan, click 'Get Started', and follow the setup wizard. You'll need your Google Maps business link. Your website will be ready in less than 5 minutes. No coding or design skills needed!" },
];

const faqsAr = [
  { question: "ما هو إنشاء محتوى الذكاء الاصطناعي وكيف يعمل؟", answer: "ينشئ الذكاء الاصطناعي تلقائياً محتوى موقع احترافياً يشمل العناوين والأوصاف والشعارات بناءً على نوع نشاطك. الخطة الأساسية تشمل استخداماً لمرة واحدة، بينما تقدم Pro وEnterprise توليداً غير محدود. أدخل تفاصيل عملك وسيتكفل الذكاء الاصطناعي بالباقي في ثوانٍ." },
  { question: "كم عدد تقييمات Google التي يمكنني تصديرها مع كل خطة؟", answer: "الخطة الأساسية تتيح تصدير حتى 10 تقييمات، Pro حتى 20، وEnterprise غير محدود. يساعدك ذلك على عرض الدليل الاجتماعي وبناء الثقة مع العملاء المحتملين." },
  { question: "هل يمكنني تعديل موقعي بعد إنشائه؟", answer: "نعم! جميع الخطط تشمل تعديلات غير محدودة. يمكنك تحديث النصوص والصور والألوان في أي وقت من لوحة التحكم. لا تتطلب مهارات تقنية." },
  { question: "ما المقصود بدعم متعدد اللغات؟", answer: "الخطة الأساسية تدعم الإنجليزية فقط. خطتا Pro وEnterprise تدعمان العربية والإنجليزية، مما يتيح لك الوصول إلى جمهور أوسع في الإمارات والشرق الأوسط." },
  { question: "ما نوع دعم العملاء المتاح؟", answer: "الخطة الأساسية تشمل دعماً عبر البريد الإلكتروني. خطتا Pro وEnterprise تشملان دعماً أولوياً مع أوقات استجابة أسرع." },
  { question: "كيف يعمل التحديث التلقائي لتقييمات Google والصور؟", answer: "خطة Pro تحدّث تلقائياً حتى 20 تقييماً وصورة. Enterprise توفر تحديثات غير محدودة. سيتزامن موقعك تلقائياً مع قائمة Google Maps دون أي عمل يدوي." },
  { question: "هل يمكنني ربط نطاقي المخصص؟", answer: "الخطة الأساسية لا تتضمن دعم النطاق المخصص. Pro وEnterprise يتيحان ربط نطاقك الخاص لمظهر احترافي." },
  { question: "ما هي التعبئة التلقائية بالذكاء الاصطناعي؟", answer: "تملأ تلقائياً موقعك ببيانات الأعمال وتفاصيل الاتصال وأوصاف الخدمات. متاحة في Pro وEnterprise وتوفر ساعات من إدخال البيانات يدوياً." },
  { question: "هل يوجد عقد أو رسوم إلغاء؟", answer: "لا عقود ولا رسوم إلغاء! يمكنك الإلغاء في أي وقت. جميع الخطط تُفوتر شهرياً أو سنوياً (وفّر 20% مع الفواتير السنوية). تحتفظ ببيانات موقعك حتى بعد الإلغاء." },
  { question: "كيف أبدأ مع syrflow.com؟", answer: "اختر خطتك، انقر على «ابدأ الآن»، واتبع معالج الإعداد. ستحتاج رابط Google Maps لنشاطك. سيكون موقعك جاهزاً في أقل من 5 دقائق!" },
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
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="inline-flex items-center gap-2 border text-xs font-medium px-3 py-1.5 rounded-[6px] mb-6"
          style={{ backgroundColor: "rgba(0,102,204,0.08)", borderColor: "rgba(0,102,204,0.2)", color: "#0066cc" }}
        >
          <Zap size={12} />
          {t.pricing.badge}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2 }}
          className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-4"
        >
          {t.pricing.h1a}
          <br />
          <span style={{ color: "#0066cc" }}>{t.pricing.h1b}</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="text-sm text-muted-foreground mb-8 max-w-xl"
        >
          {t.pricing.sub}
        </motion.p>
      </section>

      {/* Cards */}
      <motion.section
        variants={stagger(0.1)}
        initial="hidden"
        whileInView="show"
        viewport={VIEWPORT}
        className="w-full max-w-6xl mx-auto px-4 sm:px-6 pb-16"
      >
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={fadeUp}
              className="relative rounded-[6px] transition-all duration-300 bg-card border hover:border-border/70"
              style={{ borderColor: plan.popular ? "#0066cc" : undefined, borderWidth: plan.popular ? 2 : 1 }}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="text-white text-xs font-semibold px-3 py-1 rounded-[3px]" style={{ backgroundColor: "#0066cc" }}>
                    {t.pricing.mostPopular}
                  </span>
                </div>
              )}

              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-[6px] bg-accent flex items-center justify-center overflow-hidden">
                    <Image src={plan.icon} alt={`${plan.name} icon`} width={20} height={20} className="object-contain" />
                  </div>
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                </div>

                <div className="mb-3">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.price} AED</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    {plan.yearlyPrice} {t.pricing.billedAnnually}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">{plan.description}</p>
                </div>

                {plan.name === (lang === "ar" ? "أساسي" : "Basic") && slotsLeft === 0 ? (
                  <button disabled className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[6px] font-medium mb-6 border border-border bg-secondary text-muted-foreground opacity-50 cursor-not-allowed">
                    {t.pricing.fullyBooked}
                  </button>
                ) : (
                  <Link
                    href={plan.name === "Enterprise" ? "/contact" : "/register"}
                    className="w-full flex items-center justify-center gap-2 py-2.5 font-medium transition-opacity hover:opacity-90 active:scale-95 mb-6"
                    style={plan.popular
                      ? { backgroundColor: "#0066cc", color: "#fff", borderRadius: 9999 }
                      : { border: "1px solid #0066cc", color: "#0066cc", borderRadius: 9999 }
                    }
                  >
                    {plan.name === (lang === "ar" ? "أساسي" : "Basic") ? (
                      slotsLeft === null ? (
                        <span className="opacity-60">{t.pricing.loading}</span>
                      ) : (
                        <>
                          <Flame size={14} className="text-orange-400 shrink-0" />
                          {t.pricing.slotsLeft(slotsLeft)}
                        </>
                      )
                    ) : plan.buttonText}
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
            </motion.div>
          ))}
        </div>
      </motion.section>

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
