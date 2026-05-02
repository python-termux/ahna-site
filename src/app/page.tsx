"use client";

import Link from "next/link";
import { Zap, Link2, Globe, Code, Bot, DollarSign, Search, Gauge, AtSign, Share2, Shield, Gem, Sparkles, Star, Pizza } from "lucide-react";
import Footer from "@/components/Footer";
import SiteHeader from "@/components/SiteHeader";
import InView from "@/components/InView";
import { useLanguage } from "@/lib/language";

const ICONS = [
  <Zap key="zap" size={20} style={{ color: "#0066cc" }} />,
  <Link2 key="link2" size={20} style={{ color: "#0066cc" }} />,
  <Globe key="globe" size={20} style={{ color: "#0066cc" }} />,
  <Code key="code" size={20} style={{ color: "#0066cc" }} />,
  <Bot key="bot" size={20} style={{ color: "#0066cc" }} />,
  <DollarSign key="dollar" size={20} style={{ color: "#0066cc" }} />,
  <Search key="search" size={20} style={{ color: "#0066cc" }} />,
  <Gauge key="gauge" size={20} style={{ color: "#0066cc" }} />,
  <AtSign key="at" size={20} style={{ color: "#0066cc" }} />,
  <Share2 key="share" size={20} style={{ color: "#0066cc" }} />,
];

const WHY_US_ICONS = [
  <Shield key="shield" size={22} style={{ color: "#0066cc" }} />,
  <Gem key="gem" size={22} style={{ color: "#0066cc" }} />,
  <Sparkles key="sparkles" size={22} style={{ color: "#0066cc" }} />,
  <Zap key="zap2" size={22} style={{ color: "#0066cc" }} />,
];

export default function Home() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteHeader />

      {/* Hero — sequential CSS animations on page load */}
      <section className="flex flex-col items-center text-center px-4 sm:px-6 pt-20 pb-20 max-w-3xl mx-auto">
        <div
          className="anim-up inline-flex items-center gap-2 border text-sm font-medium px-3 py-1.5 rounded-[8px] mb-8"
          style={{ backgroundColor: "rgba(0,102,204,0.08)", borderColor: "rgba(0,102,204,0.2)", color: "#0066cc" }}
        >
          <Pizza size={12} />
          {t.home.badge}
        </div>

        <h1 className="anim-up anim-d1 text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-6">
          {t.home.h1a}
          <br />
          <span style={{ color: "#0066cc" }}>{t.home.h1b}</span>
        </h1>

        <p className="anim-up anim-d2 text-sm text-muted-foreground mb-10 max-w-xl">
          {t.home.hero}
        </p>

        <div className="anim-up anim-d3">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 text-white font-semibold px-7 py-3.5 transition-opacity hover:opacity-90 active:scale-95 text-base"
            style={{ backgroundColor: "#0066cc", borderRadius: 8 }}
          >
            {t.home.cta}
            <Star size={16} />
          </Link>
        </div>
      </section>

      {/* Features — staggered when scrolled into view */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {t.home.features.map((f, i) => {
          const isSoon = i === 9;
          return (
            <InView
              key={i}
              delay={i * 0.06}
              animation="up"
              className={isSoon
                ? "rounded-[8px] p-6 cursor-default"
                : "bg-card border border-border hover:border-border/70 rounded-[8px] p-6 cursor-default"
              }
              style={isSoon ? { backgroundColor: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.28)" } : undefined}
            >
              <div className="mb-3">
                {isSoon ? <Share2 size={20} style={{ color: "#10b981" }} /> : ICONS[i]}
              </div>
              <h3 className="font-semibold mb-1" style={isSoon ? { color: "#10b981" } : undefined}>{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </InView>
          );
        })}
      </section>

      {/* Why Us */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-28 w-full">
        <InView className="text-center mb-12" animation="up">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">{t.home.whyUsTitle}</h2>
          <p className="text-sm text-muted-foreground">{t.home.whyUsSub}</p>
        </InView>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {t.home.whyUs.map((item, i) => (
            <InView
              key={i}
              delay={i * 0.08}
              animation="up"
              className="bg-card border border-border hover:border-border/70 rounded-[8px] p-6 cursor-default"
            >
              <div className="mb-3">{WHY_US_ICONS[i]}</div>
              <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </InView>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
