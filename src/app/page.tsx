"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Pencil, Globe, ArrowRight, Zap, Image, Star, Database, Pizza, Search, Link2, Sparkles, Bot, Wand2 } from "lucide-react";
import { fadeUp, stagger, VIEWPORT } from "@/lib/motion";
import Footer from "@/components/Footer";
import SiteHeader from "@/components/SiteHeader";
import { useLanguage } from "@/lib/language";

const ICONS = [
  <Zap size={20} style={{ color: "#0066cc" }} />,
  <Database size={20} style={{ color: "#0066cc" }} />,
  <Pencil size={20} style={{ color: "#0066cc" }} />,
  <Star size={20} style={{ color: "#0066cc" }} />,
  <Bot size={20} style={{ color: "#0066cc" }} />,
  <Pizza size={20} style={{ color: "#0066cc" }} />,
  <Search size={20} style={{ color: "#0066cc" }} />,
  <Link2 size={20} style={{ color: "#0066cc" }} />,
  <Sparkles size={20} style={{ color: "#0066cc" }} />,
];

export default function Home() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">

      <SiteHeader />

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-4 sm:px-6 pt-20 pb-20 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="inline-flex items-center gap-2 border text-sm font-medium px-3 py-1.5 rounded-[8px] mb-8"
          style={{ backgroundColor: "rgba(0,102,204,0.08)", borderColor: "rgba(0,102,204,0.2)", color: "#0066cc" }}
        >
          <Pizza size={12} />
          {t.home.badge}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-6"
        >
          {t.home.h1a}
          <br />
          <span style={{ color: "#0066cc" }}>{t.home.h1b}</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="text-sm text-muted-foreground mb-10 max-w-xl"
        >
          {t.home.hero}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <Link
            href="/register"
            className="inline-flex items-center gap-2 text-white font-semibold px-7 py-3.5 transition-opacity hover:opacity-90 active:scale-95 text-base group"
            style={{ backgroundColor: "#0066cc", borderRadius: 9999 }}
          >
            {t.home.cta}
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
        {t.home.features.map((f, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-card border border-border hover:border-border/70 rounded-[8px] p-6 transition-colors cursor-default"
          >
            <div className="mb-3">{ICONS[i]}</div>
            <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
            <p className="text-sm text-muted-foreground">{f.desc}</p>
          </motion.div>
        ))}
      </motion.section>

      <Footer />
    </main>
  );
}
