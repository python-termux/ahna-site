"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Zap, ChevronDown, Flame } from "lucide-react";
import Footer from "@/components/Footer";
import SiteHeader from "@/components/SiteHeader";
import { createClient } from "@/lib/supabase/client";

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

const plans = [
  {
    name: "Basic",
    price: 8.25,
    period: "monthly",
    yearlyPrice: 99,
    description: "Perfect for new small businesses (cafes, salons, etc.)",
    icon: "/pricing/star-94.png",
    buttonText: "Limited - 10 Slots left",
    popular: false,
    features: [
      { name: "Ai Content Generation", included: true, value: "one time use" },
      { name: "Max Reviews Exported", included: true, value: "10" },
      { name: "Website Edits", included: true, value: "Unlimited" },
      { name: "Multiple Theme Changes", included: true, value: "yes" },
      { name: "Multi-language Support", included: true, value: "Only English" },
      { name: "Ahna Badge", included: true, value: "Footer" },
      { name: "Ahna Popup", included: true, value: "5 min Inactivity" },
      { name: "Online Support - Assistant", included: true, value: "Email" },
      { name: "Auto update Google reviews", included: false, value: "No" },
      { name: "Auto update Google Photos", included: false, value: "No" },
      { name: "Custom domain", included: false, value: "No" },
      { name: "Ai Auto Fill", included: false, value: "No" },
      { name: "Website Views Counter", included: false, value: "no" },
    ],
  },
  {
    name: "Pro",
    price: 15,
    period: "monthly",
    yearlyPrice: 180,
    description: "Best for established businesses (consulting firms, restaurants, clinics, etc.)",
    icon: "/pricing/fire-94.png",
    buttonText: "Get started",
    popular: true,
    features: [
      { name: "Ai Content Generation", included: true, value: "Limited" },
      { name: "Max Reviews Exported", included: true, value: "Upto 20" },
      { name: "Website Edits", included: true, value: "Unlimited" },
      { name: "Multiple Theme Changes", included: true, value: "yes" },
      { name: "Multi-language Support", included: true, value: "Arabic English" },
      { name: "Ahna Badge", included: true, value: "Footer" },
      { name: "Ahna Popup", included: true, value: "10 min Inactivity" },
      { name: "Online Support - Assistant", included: true, value: "yes" },
      { name: "Auto update Google reviews", included: true, value: "Max 20" },
      { name: "Auto update Google Photos", included: true, value: "Max 20" },
      { name: "Custom domain", included: true, value: "Yes" },
      { name: "Ai Auto Fill", included: true, value: "Limited usage" },
      { name: "Website Views Counter", included: false, value: "no" },
    ],
  },
  {
    name: "Enterprise",
    price: 18,
    period: "monthly",
    yearlyPrice: 216,
    description: "Best for Arabic established businesses (consulting firms, restaurants, clinics, etc.)",
    icon: "/pricing/crown-94.png",
    buttonText: "Get started",
    popular: false,
    features: [
      { name: "Ai Content Generation", included: true, value: "Unlimited" },
      { name: "Max Reviews Exported", included: true, value: "Unlimited" },
      { name: "Website Edits", included: true, value: "Unlimited" },
      { name: "Multiple Theme Changes", included: true, value: "yes" },
      { name: "Multi-language Support", included: true, value: "Arabic English" },
      { name: "Ahna Badge", included: true, value: "Badge Removed" },
      { name: "Ahna Popup", included: true, value: "Never" },
      { name: "Online Support - Assistant", included: true, value: "yes" },
      { name: "Auto update Google reviews", included: true, value: "Unlimited" },
      { name: "Auto update Google Photos", included: true, value: "Unlimited" },
      { name: "Custom domain", included: true, value: "Yes" },
      { name: "Ai Auto Fill", included: true, value: "Unlimited" },
      { name: "Website Views Counter", included: true, value: "yes" },
    ],
  },
];

const faqs = [
  {
    question: "What is AI Content Generation and how does it work?",
    answer: "AI Content Generation automatically creates professional website content including headings, descriptions, and taglines based on your business type. Basic plan includes one-time use, while Pro and Enterprise plans offer unlimited generations. Simply enter your business details and our AI does the rest in seconds."
  },
  {
    question: "How many Google reviews can I export with each plan?",
    answer: "Basic plan allows you to export up to 10 reviews, Pro plan allows up to 20 reviews, and Enterprise plan offers unlimited review exports. This helps you showcase social proof on your website and build trust with potential customers."
  },
  {
    question: "Can I edit my website after it's created?",
    answer: "Yes! All plans include unlimited website edits. You can update text, images, colors, and layout anytime from your easy-to-use dashboard. No technical skills required."
  },
  {
    question: "What does Multi-language Support mean for my website?",
    answer: "Basic plan supports English only. Pro and Enterprise plans support both Arabic and English languages, allowing you to reach a wider audience in the UAE and across the Middle East."
  },
  {
    question: "What kind of customer support do I get?",
    answer: "Basic plan includes email support. Pro and Enterprise plans include priority online assistant support with faster response times and dedicated help for any issues you encounter."
  },
  {
    question: "How does Auto update Google reviews and photos work?",
    answer: "Pro plan auto-updates up to 20 reviews and photos. Enterprise plan offers unlimited auto-updates. Your website will automatically sync with your Google Maps listing, keeping your reviews and photos current without any manual work."
  },
  {
    question: "Can I connect my own custom domain?",
    answer: "Basic plan does not include custom domain support. Pro and Enterprise plans allow you to connect your own domain (like yourbusiness.com) to your website for a professional look."
  },
  {
    question: "What is AI Auto Fill and how does it save me time?",
    answer: "AI Auto Fill automatically populates your website with business information, contact details, and service descriptions. Available on Pro and Enterprise plans (unlimited use), it saves hours of manual data entry."
  },
  {
    question: "Is there a contract or cancellation fee?",
    answer: "No contracts or cancellation fees! You can cancel anytime. All plans are billed monthly or annually (save 20% with annual billing). You keep your website data even after cancellation."
  },
  {
    question: "How do I get started with ahna.ae?",
    answer: "Simply choose your plan, click 'Get Started', and follow the setup wizard. You'll need your Google Maps business link. Your website will be ready in less than 5 minutes. No coding or design skills needed!"
  }
];

export default function PricingPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [slotsLeft, setSlotsLeft] = useState<number | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function fetchCount() {
      const { data, error } = await supabase.rpc("get_registered_user_count");
      if (!error && typeof data === "number") {
        setSlotsLeft(Math.max(0, TOTAL_SLOTS - data));
      }
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
          className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-300 text-xs font-medium px-3 py-1.5 rounded-[6px] mb-6"
        >
          <Zap size={12} />
          Simple pricing cheaper than 1 meter Pizza
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2 }}
          className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-4"
        >
          Save Web Hosting Costs
          <br />
          <span className="text-indigo-500 dark:text-indigo-400">Save development time</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="text-sm text-muted-foreground mb-8 max-w-xl"
        >
          With ahna.ae no need a website developer.
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
              className={`relative rounded-[6px] transition-all duration-300 ${
                plan.popular
                  ? "bg-gradient-to-b from-indigo-50 dark:from-indigo-950/50 to-gray-50 dark:to-gray-900 border-2 border-indigo-500 shadow-sm shadow-indigo-500/10"
                  : "bg-card border border-border hover:border-border/70"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-[3px]">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-[6px] bg-accent flex items-center justify-center overflow-hidden">
                    <Image 
                      src={plan.icon} 
                      alt={`${plan.name} icon`}
                      width={20}
                      height={20}
                      className="object-contain"
                    />
                  </div>
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                </div>

                <div className="mb-3">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.price} AED</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    {plan.yearlyPrice} AED/year - Billed Annually 
                  </p>
                  <p className="text-xs text-gray-500 mt-2">{plan.description}</p>
                </div>

                {plan.name === "Basic" && slotsLeft === 0 ? (
                  <button
                    disabled
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[6px] font-medium mb-6 border border-border bg-secondary text-muted-foreground opacity-50 cursor-not-allowed"
                  >
                    Fully Booked
                  </button>
                ) : (
                  <Link
                    href={plan.name === "Enterprise" ? "/contact" : "/register"}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-[6px] font-medium transition-all mb-6 ${
                      plan.popular
                        ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-500/25"
                        : "border border-input hover:border-indigo-500 text-muted-foreground hover:text-indigo-600 dark:hover:text-white"
                    }`}
                  >
                    {plan.name === "Basic" ? (
                      slotsLeft === null ? (
                        <span className="opacity-60">Loading…</span>
                      ) : (
                        <>
                          <Flame size={14} className="text-orange-400 shrink-0" />
                          Limited · {slotsLeft} Slot{slotsLeft !== 1 ? "s" : ""} Left
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

      {/* FAQs Section */}
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 pb-24">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Frequently Asked Questions</h2>
          <p className="text-muted-foreground text-sm">
            Everything you need to know about our plans and features
          </p>
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