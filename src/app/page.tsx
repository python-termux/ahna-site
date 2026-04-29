"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Pencil, Globe, ArrowRight, Zap, Image, Star, Database, Pizza, Search, Link2, Sparkles, Bot, Wand2 } from "lucide-react";
import { fadeUp, stagger, VIEWPORT } from "@/lib/motion";
import Footer from "@/components/Footer";
import SiteHeader from "@/components/SiteHeader";

const features = [
  { icon: <Zap size={20} className="text-indigo-400" />, title: "Ready in 60 seconds", desc: "Paste your Google Maps link and your website is live instantly. No developers to fight with." },
  { icon: <Database size={20} className="text-emerald-400" />, title: "Fetch All Your Data", desc: "We turn real feedback into clear messaging that fits your business automatically." },
  { icon: <Pencil size={20} className="text-amber-400" />, title: "No Coding Required", desc: "Change any text, image, service, testimonial, or contact detail from your dashboard anytime." },
  { icon: <Star size={20} className="text-yellow-400" />, title: "Add or Edit Anything", desc: "Showcase real customer feedback with star ratings. Add or edit as many as you like." },
  { icon: <Bot size={20} className="text-indigo-400" />, title: "AI Powered Content", desc: "Generate professional headings, taglines, and descriptions instantly with one click. Let Ai write your website content." },
  { icon: <Pizza size={20} className="text-orange-400" />, title: "Less than 1 Meter Pizza", desc: "You get a proper functional business website for a fraction of the cost. Just 10 AED monthly." },
  { icon: <Search size={20} className="text-violet-400" />, title: "Proper Auto SEO", desc: "Any website created with ahna.ae gets optimized for search engines automatically." },
  { icon: <Link2 size={20} className="text-cyan-400" />, title: "Support Custom Domains", desc: "If you wish to add a custom domain to your website, please contact our support team." },
  { icon: <Sparkles size={20} className="text-purple-400" />, title: "Still in Beta", desc: "We are still in beta. Some great features will be available soon. Stay tuned!" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">

      <SiteHeader />

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-4 sm:px-6 pt-20 pb-20 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-300 text-sm font-medium px-3 py-1.5 rounded-[8px] mb-8"
        >
          <Pizza size={12} />
          No coding. No Hosting. No Fuss.
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-6"
        >
          Get Your Business Online
          <br />
          <span className="text-indigo-500 dark:text-indigo-400">Less Than 1 Meter Pizza Cost</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="text-sm text-muted-foreground mb-10 max-w-xl"
        >
          Your customers have already told you why they pick you on your Google Business Profile, now turn that feedback into a high converting website starting from just <strong>8.25 AED</strong>/month. Zero coding. Zero hosting hassle.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-7 py-3.5 rounded-[8px] transition-colors text-base group"
          >
            Get started Now
            <motion.span
              className="inline-flex"
              initial={{ x: -4, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.6, ease: "easeOut" }}
            >
              <Star size={16} />
            </motion.span>
          </Link>
        </motion.div>
      </section>

      {/* Features */}
      <motion.section
        variants={stagger(0.07)}
        initial="hidden"
        whileInView="show"
        viewport={VIEWPORT}
        className="max-w-6xl mx-auto px-4 sm:px-6 pb-24 grid sm:grid-cols-3 gap-5"
      >
        {features.map((f) => (
          <motion.div
            key={f.title}
            variants={fadeUp}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-card border border-border hover:border-border/70 rounded-[8px] p-6 transition-colors cursor-default"
          >
            <div className="mb-3">{f.icon}</div>
            <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
            <p className="text-sm text-muted-foreground">{f.desc}</p>
          </motion.div>
        ))}
      </motion.section>

      <Footer />
    </main>
  );
}
