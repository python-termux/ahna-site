"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ChevronDown } from "lucide-react";
import Footer from "@/components/Footer";
import SiteHeader from "@/components/SiteHeader";
import { useLanguage } from "@/lib/language";

const faqsEn = [
  { question: "How long does it take to create a website?", answer: "It takes less than 5 minutes. Just paste your Google Maps link and your website is ready instantly." },
  { question: "Can I edit my website after it's created?", answer: "Yes! Basic plan includes 1 time edit. Pro plan includes unlimited edits anytime from your dashboard." },
  { question: "Do I need coding skills?", answer: "No coding required at all. Everything is done through our simple dashboard." },
  { question: "Can I use my own domain?", answer: "Yes, Pro plan includes custom domain support. You can connect your own domain easily." },
  { question: "How does the AI content generation work?", answer: "Our AI analyzes your business and generates professional headings, taglines, and descriptions instantly with one click." },
  { question: "What payment methods do you accept?", answer: "We accept credit cards, debit cards, and PayPal. All payments are secure." },
];

const faqsAr = [
  { question: "كم يستغرق إنشاء موقع إلكتروني؟", answer: "يستغرق أقل من 5 دقائق. الصق رابط Google Maps وسيكون موقعك جاهزاً فوراً." },
  { question: "هل يمكنني تعديل موقعي بعد إنشائه؟", answer: "نعم! الخطة الأساسية تتيح تعديلاً واحداً. Pro تتيح تعديلات غير محدودة في أي وقت." },
  { question: "هل أحتاج مهارات برمجية؟", answer: "لا برمجة مطلوبة على الإطلاق. كل شيء يتم من خلال لوحة التحكم البسيطة." },
  { question: "هل يمكنني استخدام نطاقي الخاص؟", answer: "نعم، خطة Pro تتضمن دعم النطاقات المخصصة. يمكنك ربط نطاقك بسهولة." },
  { question: "كيف يعمل إنشاء المحتوى بالذكاء الاصطناعي؟", answer: "يحلل الذكاء الاصطناعي نشاطك ويُنشئ عناوين وشعارات وأوصافاً احترافية بنقرة واحدة." },
  { question: "ما طرق الدفع المقبولة؟", answer: "نقبل بطاقات الائتمان والخصم وPayPal. جميع المدفوعات آمنة." },
];

export default function ContactPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { lang, t } = useLanguage();
  const faqs = lang === "ar" ? faqsAr : faqsEn;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">

      <SiteHeader />

      <div className="flex-1 flex items-center justify-center w-full max-w-6xl mx-auto px-4 sm:px-6">
        <div className="w-full py-8">
          <div className="grid lg:grid-cols-2 gap-8 items-start">

            {/* Left — Contact Cards */}
            <div className="space-y-4 sticky top-8">
              <h2 className="text-lg font-semibold mb-4">{t.contact.title}</h2>

              <div className="bg-card rounded-[6px] p-5 border border-border">
                <div className="flex items-center gap-3 mb-2">
                  <Mail size={20} className="text-[#0066cc] dark:text-[#2997ff]" />
                  <h3 className="font-semibold">{t.contact.emailTitle}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{t.contact.emailSub}</p>
                <a href="mailto:team@syrflow.com" className="text-sm text-[#0066cc] dark:text-[#2997ff] hover:text-[#2997ff] transition-colors">
                  team@syrflow.com
                </a>
              </div>
            </div>

            {/* Right — FAQs */}
            <div>
              <h2 className="text-lg font-semibold mb-4">{t.contact.faqTitle}</h2>
              <div className="space-y-3">
                {faqs.map((faq, index) => (
                  <div key={index} className="bg-card rounded-lg border border-border overflow-hidden">
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
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
