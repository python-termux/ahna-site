import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Phone, MapPin, Mail, Clock,
  Star, ArrowRight, CheckCircle,
} from "lucide-react";
import HeroSlider from "@/components/site/HeroSlider";
import ReviewMarquee from "@/components/site/ReviewMarquee";
import { FadeUp, StaggerGrid, StaggerItem, SlideDownHeader } from "@/components/site/AnimatedSection";
import { matchServiceIcon } from "@/lib/service-icons";
import OpenStatus from "@/components/site/OpenStatus";
import SiteLangToggle from "@/components/site/SiteLangToggle";

type SiteLang = "en" | "ar";

const SITE_I18N = {
  en: {
    navServices:    "Services",
    navReviews:     "Reviews",
    navContact:     "Contact",
    callUs:         "Call us",
    onGoogle:       "on Google",
    reviews:        "reviews",
    callNow:        "Call now",
    directions:     "Directions",
    aboutLabel:     "About us",
    aboutTitle:     "Who we are",
    getInTouch:     "Get in touch",
    servicesLabel:  "What we offer",
    servicesTitle:  "Our services",
    whyLabel:       "Why choose us",
    whyTitle:       "Why people choose",
    reviewsLabel:   "Testimonials",
    reviewsTitle:   "Our Google Reviews",
    contactLabel:   "Contact",
    contactTitle:   "Get in touch",
    phone:          "Phone",
    openingHours:   "Opening hours",
    email:          "Email",
    address:        "Address",
    whatsapp:       "WhatsApp",
    followUs:       "Follow us",
    statYears:      "Years",
    statReviews:    "Reviews",
    statRating:     "Rating",
    byBrand:        "by Syria Flow",
  },
  ar: {
    navServices:    "خدماتنا",
    navReviews:     "التقييمات",
    navContact:     "تواصل",
    callUs:         "اتصل بنا",
    onGoogle:       "على غوغل",
    reviews:        "تقييم",
    callNow:        "اتصل الآن",
    directions:     "الاتجاهات",
    aboutLabel:     "من نحن",
    aboutTitle:     "من نحن",
    getInTouch:     "تواصل معنا",
    servicesLabel:  "ما نقدمه",
    servicesTitle:  "خدماتنا",
    whyLabel:       "لماذا تختارنا",
    whyTitle:       "لماذا يختار الناس",
    reviewsLabel:   "آراء العملاء",
    reviewsTitle:   "تقييماتنا على غوغل",
    contactLabel:   "تواصل",
    contactTitle:   "ابق على تواصل",
    phone:          "هاتف",
    openingHours:   "أوقات العمل",
    email:          "البريد الإلكتروني",
    address:        "العنوان",
    whatsapp:       "واتساب",
    followUs:       "تابعنا",
    statYears:      "سنوات",
    statReviews:    "تقييمات",
    statRating:     "التقييم",
    byBrand:        "بـ سوريا فلو",
  },
};

interface Service { title: string; description: string }
interface Testimonial { author: string; role: string; text: string; rating: number }
interface Business {
  id: string; slug: string; name: string; tagline: string; description: string;
  category: string; phone: string; email: string; address: string; maps_url: string; website: string;
  hero_image: string; gallery: string[]; about_image: string; hours: Record<string, string>;
  services: Service[]; testimonials: Testimonial[];
  why_us: { title: string; description: string }[];
  social: { instagram?: string; facebook?: string; twitter?: string; tiktok?: string; whatsapp?: string };
  theme_color: string; corner_radius: string; stat_years: string; stat_clients: string; stat_projects: string;
}

// ── Scrollbar accent colors (hex) ────────────────────────────────────────────
const SCROLLBAR: Record<string, { thumb: string; hover: string }> = {
  indigo:  { thumb: "#4f46e5", hover: "#6366f1" },
  violet:  { thumb: "#7c3aed", hover: "#8b5cf6" },
  rose:    { thumb: "#e11d48", hover: "#f43f5e" },
  orange:  { thumb: "#ea580c", hover: "#f97316" },
  emerald: { thumb: "#059669", hover: "#10b981" },
  sky:     { thumb: "#0284c7", hover: "#0ea5e9" },
  amber:   { thumb: "#d97706", hover: "#f59e0b" },
};

// ── Theme system ──────────────────────────────────────────────────────────────
const ACCENT: Record<string, {
  btn: string; btnOutline: string; text: string; textDark: string;
  badge: string; iconBgDark: string; iconBgLight: string;
}> = {
  indigo:  { btn:"bg-indigo-600 hover:bg-indigo-500",  btnOutline:"border-indigo-500 text-indigo-400 hover:bg-indigo-950",  text:"text-indigo-400",  textDark:"text-indigo-600",  badge:"bg-indigo-50 text-indigo-600",   iconBgDark:"bg-indigo-600/15 text-indigo-400",  iconBgLight:"bg-indigo-100 text-indigo-600" },
  violet:  { btn:"bg-violet-600 hover:bg-violet-500",  btnOutline:"border-violet-500 text-violet-400 hover:bg-violet-950",  text:"text-violet-400",  textDark:"text-violet-600",  badge:"bg-violet-50 text-violet-600",   iconBgDark:"bg-violet-600/15 text-violet-400",  iconBgLight:"bg-violet-100 text-violet-600" },
  rose:    { btn:"bg-rose-600 hover:bg-rose-500",      btnOutline:"border-rose-500 text-rose-400 hover:bg-rose-950",        text:"text-rose-400",    textDark:"text-rose-600",    badge:"bg-rose-50 text-rose-600",       iconBgDark:"bg-rose-600/15 text-rose-400",      iconBgLight:"bg-rose-100 text-rose-600" },
  orange:  { btn:"bg-orange-600 hover:bg-orange-500",  btnOutline:"border-orange-500 text-orange-400 hover:bg-orange-950",  text:"text-orange-400",  textDark:"text-orange-600",  badge:"bg-orange-50 text-orange-600",   iconBgDark:"bg-orange-600/15 text-orange-400",  iconBgLight:"bg-orange-100 text-orange-600" },
  emerald: { btn:"bg-emerald-600 hover:bg-emerald-500",btnOutline:"border-emerald-500 text-emerald-400 hover:bg-emerald-950",text:"text-emerald-400", textDark:"text-emerald-600", badge:"bg-emerald-50 text-emerald-600", iconBgDark:"bg-emerald-600/15 text-emerald-400",iconBgLight:"bg-emerald-100 text-emerald-600" },
  sky:     { btn:"bg-sky-600 hover:bg-sky-500",        btnOutline:"border-sky-500 text-sky-400 hover:bg-sky-950",          text:"text-sky-400",     textDark:"text-sky-600",     badge:"bg-sky-50 text-sky-600",         iconBgDark:"bg-sky-600/15 text-sky-400",        iconBgLight:"bg-sky-100 text-sky-600" },
  amber:   { btn:"bg-amber-600 hover:bg-amber-500",    btnOutline:"border-amber-500 text-amber-400 hover:bg-amber-950",    text:"text-amber-400",   textDark:"text-amber-600",   badge:"bg-amber-50 text-amber-600",     iconBgDark:"bg-amber-600/15 text-amber-400",    iconBgLight:"bg-amber-100 text-amber-600" },
  white:   { btn:"bg-indigo-600 hover:bg-indigo-500",  btnOutline:"border-indigo-500 text-indigo-600 hover:bg-indigo-50",  text:"text-indigo-600",  textDark:"text-indigo-600",  badge:"bg-indigo-50 text-indigo-600",   iconBgDark:"bg-indigo-600/15 text-indigo-400",  iconBgLight:"bg-indigo-100 text-indigo-600" },
};

function buildTheme(themeColor: string) {
  const isLight = themeColor === "white" || themeColor.startsWith("white-");
  const accentKey = themeColor.startsWith("white-") ? themeColor.slice(6) : themeColor === "white" ? "indigo" : themeColor;
  const ac = ACCENT[accentKey] ?? ACCENT.indigo;
  return {
    isLight,
    ...ac,
    page:        isLight ? "bg-gray-50"               : "bg-gray-950",
    header:      isLight ? "bg-white/90 border-gray-200" : "bg-gray-950/90 border-white/5",
    card:        isLight ? "bg-white border-gray-200"  : "bg-gray-900 border-gray-800",
    cardHover:   isLight ? "hover:border-gray-300"    : "hover:border-gray-700",
    text:        isLight ? "text-gray-900"            : "text-white",
    muted:       isLight ? "text-gray-600"            : "text-gray-400",
    faint:       isLight ? "text-gray-400"            : "text-gray-600",
    divider:     isLight ? "border-gray-200"          : "border-gray-800",
    navLink:     isLight ? "text-gray-600 hover:text-gray-900" : "text-gray-400 hover:text-white",
    iconBg:      isLight ? ac.iconBgLight             : ac.iconBgDark,
    accentText:  isLight ? ac.textDark                : ac.text,
  };
}

// ── Metadata ──────────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("businesses").select("name,tagline,category,theme_color").eq("slug", slug).single();
  if (!data) return { title: "Business" };
  const isLight = data.theme_color === "white" || String(data.theme_color).startsWith("white-");
  const themeColor = isLight ? "#f9fafb" : "#030712";
  return {
    title: data.name,
    description: data.tagline || data.category,
    themeColor,
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function SitePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const cookieStore = await cookies();
  const siteLang: SiteLang = cookieStore.get("syrflow_lang")?.value === "ar" ? "ar" : "en";
  const i18n = SITE_I18N[siteLang];
  const isRtl = siteLang === "ar";

  const supabase = await createClient();
  const { data: biz } = await supabase.from("businesses").select("*").eq("slug", slug).single<Business>();
  if (!biz) notFound();

  const T = buildTheme(biz.theme_color);
  const accentKey = biz.theme_color.startsWith("white-") ? biz.theme_color.slice(6) : biz.theme_color === "white" ? "indigo" : biz.theme_color;
  const sb = SCROLLBAR[accentKey] ?? SCROLLBAR.indigo;
  const sbTrack = T.isLight ? "#f3f4f6" : "#111827";

  const CORNER = { none: { btn: "0px", card: "0px", icon: "4px" }, md: { btn: "6px", card: "10px", icon: "8px" }, pill: { btn: "9999px", card: "16px", icon: "16px" } };
  const cr = CORNER[(biz.corner_radius as keyof typeof CORNER) ?? "md"] ?? CORNER.md;

  const allImages = (biz.gallery ?? []).filter(Boolean);
  const sliderImages = allImages.slice(0, 6);
  const aboutImage = biz.about_image || allImages[1] || allImages[0] || "";

  const stats = [
    biz.stat_years    && { label: i18n.statYears,   value: biz.stat_years },
    biz.stat_clients  && { label: i18n.statReviews, value: biz.stat_clients },
    biz.stat_projects && { label: i18n.statRating,  value: biz.stat_projects },
  ].filter(Boolean) as { label: string; value: string }[];

  const hours = Object.entries(biz.hours ?? {});
  const avgRating = biz.testimonials.length
    ? (biz.testimonials.reduce((s, r) => s + r.rating, 0) / biz.testimonials.length).toFixed(1)
    : null;

  const whyUs = (biz.why_us ?? []).filter((p) => p.title && p.description);

  return (
    <div className={`min-h-screen ${T.page} ${T.text}`} dir={isRtl ? "rtl" : "ltr"}>
      <style>{`
        html,body,*{font-family:${isRtl ? "'Almarai'" : "'GoogleSans'"},sans-serif!important}
        html{scrollbar-color:${sb.thumb} ${sbTrack}!important}
        ::-webkit-scrollbar-track{background:${sbTrack}!important}
        ::-webkit-scrollbar-thumb{background:${sb.thumb}!important}
        ::-webkit-scrollbar-thumb:hover{background:${sb.hover}!important}
        .site-btn{border-radius:${cr.btn}!important}
        .site-card{border-radius:${cr.card}!important}
        .site-icon{border-radius:${cr.icon}!important}
      `}</style>

      {/* ── HEADER ── */}
      <SlideDownHeader className={`sticky top-0 z-40 relative backdrop-blur-md sm:backdrop-blur-none ${T.isLight ? "bg-white/90 sm:bg-transparent" : "bg-gray-950/90 sm:bg-transparent"}`}>
        {/* Desktop only: faded background */}
        <div
          className={`absolute inset-0 hidden sm:block backdrop-blur-md ${T.isLight ? "bg-white/90" : "bg-gray-950/90"}`}
          style={{
            WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
            maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
          }}
        />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between py-3">
            <a href="#hero" className={`text-sm font-bold tracking-tight ${T.accentText}`}>{biz.name}</a>
            <nav className="flex items-center gap-4 sm:gap-5 text-xs sm:text-sm">
              {biz.services.length > 0 && (
                <a href="#services" className={`hidden sm:block ${T.navLink} transition-colors`}>{i18n.navServices}</a>
              )}
              {biz.testimonials.length > 0 && (
                <a href="#reviews" className={`hidden sm:block ${T.navLink} transition-colors`}>{i18n.navReviews}</a>
              )}
              <a href="#contact" className={`${T.navLink} transition-colors`}>{i18n.navContact}</a>
              <SiteLangToggle
                initialLang={siteLang}
                className={T.isLight ? "border-gray-300 text-gray-600 hover:text-gray-900" : "border-gray-700 text-gray-400 hover:text-white"}
              />
              {biz.phone && (
                <a
                  href={`tel:${biz.phone}`}
                  className={`site-btn ${T.btn} text-white px-3 py-1.5 text-xs font-medium transition-colors`}
                >
                  {i18n.callUs}
                </a>
              )}
            </nav>
          </div>
          <div className={`-mx-4 sm:mx-0 h-px ${T.isLight ? "bg-gray-200" : "bg-gray-800"}`} />
        </div>
      </SlideDownHeader>

      {/* ── HERO ── */}
      <section id="hero" className="pt-12 pb-16 sm:pt-16 sm:pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">

          {/* Left: text */}
          <div className="flex flex-col gap-4">
            {avgRating && (
              <div className={`site-card inline-flex items-center gap-2 w-fit px-3 py-1.5 text-xs font-medium ${T.iconBg}`}>
                <Star size={11} className="fill-current" />
                {avgRating} {i18n.onGoogle}
                {biz.stat_clients && <span className="opacity-70">· {biz.stat_clients} {i18n.reviews}</span>}
              </div>
            )}

            {biz.category !== "Other" && (
              <span className={`site-card inline-flex w-fit text-xs font-semibold px-2.5 py-1 ${T.badge}`}>
                {biz.category}
              </span>
            )}

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-tight">
              {biz.name}
            </h1>

            {biz.tagline && (
              <p className={`text-sm sm:text-base ${T.muted} leading-relaxed`}>
                {biz.tagline}
              </p>
            )}

            {/* Stats */}
            {stats.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1">
                {stats.map((s) => (
                  <span key={s.label} className={`site-card inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 border ${T.divider} ${T.isLight ? "bg-white text-gray-700" : "bg-gray-900 text-gray-300"}`}>
                    <span className={`font-bold ${T.accentText}`}>{s.value}</span>
                    {s.label}
                  </span>
                ))}
              </div>
            )}

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-2 mt-1">
              {biz.phone && (
                <a
                  href={`tel:${biz.phone}`}
                  className={`site-btn inline-flex items-center gap-1.5 ${T.btn} text-white px-4 py-2.5 font-medium text-sm transition-colors`}
                >
                  <Phone size={14} /> {i18n.callNow}
                </a>
              )}
              {(biz.maps_url || biz.address) && (
                <a
                  href={biz.maps_url || `https://maps.google.com/?q=${encodeURIComponent(biz.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`site-btn inline-flex items-center gap-1.5 border px-4 py-2.5 font-medium text-sm transition-colors ${T.btnOutline}`}
                >
                  <MapPin size={14} /> {i18n.directions}
                </a>
              )}
            </div>
          </div>

          {/* Right: image slider */}
          <div className="w-full h-56 sm:h-[300px] lg:h-[420px]">
            <HeroSlider images={sliderImages} />
          </div>
        </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      {biz.description && (
        <section className="pb-12 sm:pb-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className={`h-px mb-10 sm:mb-14 bg-gradient-to-r from-transparent ${T.isLight ? "via-gray-300" : "via-gray-800"} to-transparent`} />
            <div className="grid lg:grid-cols-2 gap-6 lg:gap-10 items-center">

              {/* Text — left on desktop, top on mobile */}
              <div>
                <p className={`text-xs font-semibold uppercase tracking-widest mb-3 ${T.accentText}`}>
                  {i18n.aboutLabel}
                </p>
                <h2 className="text-xl sm:text-2xl font-bold mb-4 leading-snug">
                  {i18n.aboutTitle}
                </h2>
                <p className={`${T.muted} text-sm sm:text-base leading-relaxed`}>
                  {biz.description}
                </p>
                {biz.phone && (
                  <a
                    href="#contact"
                    className={`inline-flex items-center gap-1.5 mt-6 font-semibold text-sm ${T.accentText} group`}
                  >
                    {i18n.getInTouch}
                    <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </a>
                )}
              </div>

              {/* Image — right on desktop, bottom on mobile */}
              {aboutImage && (
                <div className="w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={aboutImage}
                    alt={biz.name}
                    className="w-full h-52 sm:h-64 lg:h-72 object-cover rounded-lg"
                  />
                </div>
              )}

            </div>
          </div>
        </section>
      )}

      {/* ── SERVICES ── */}
      {biz.services?.length > 0 && (
        <section id="services" className="pb-12 sm:pb-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className={`h-px mb-10 sm:mb-14 bg-gradient-to-r from-transparent ${T.isLight ? "via-gray-300" : "via-gray-800"} to-transparent`} />
            <FadeUp className="mb-8">
              <p className={`text-xs font-semibold uppercase tracking-widest mb-2 ${T.accentText}`}>
                {i18n.servicesLabel}
              </p>
              <h2 className="text-xl sm:text-2xl font-bold">{i18n.servicesTitle}</h2>
            </FadeUp>

            <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {biz.services.map((s, i) => {
                const Icon = matchServiceIcon(s.title);
                return (
                  <StaggerItem
                    key={i}
                    className={`site-card p-4 sm:p-5 border transition-all cursor-default ${T.card} ${T.cardHover}`}
                  >
                    <div className={`site-icon w-9 h-9 flex items-center justify-center mb-3 ${T.iconBg}`}>
                      <Icon size={18} />
                    </div>
                    <h3 className="font-semibold text-sm sm:text-base mb-1">{s.title}</h3>
                    {s.description && (
                      <p className={`text-xs sm:text-sm leading-relaxed ${T.muted}`}>{s.description}</p>
                    )}
                  </StaggerItem>
                );
              })}
            </StaggerGrid>
          </div>
        </section>
      )}

      {/* ── WHY US ── */}
      {whyUs.length > 0 && (
        <section className="pb-12 sm:pb-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className={`h-px mb-10 sm:mb-14 bg-gradient-to-r from-transparent ${T.isLight ? "via-gray-300" : "via-gray-800"} to-transparent`} />
            <FadeUp className="mb-8">
              <p className={`text-xs font-semibold uppercase tracking-widest mb-2 ${T.accentText}`}>{i18n.whyLabel}</p>
              <h2 className="text-xl sm:text-2xl font-bold">{i18n.whyTitle} {biz.name}</h2>
            </FadeUp>
            <StaggerGrid className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {whyUs.map((p, i) => (
                <StaggerItem key={i} className={`site-card p-5 sm:p-6 border flex flex-col gap-3 ${T.card}`}>
                  <div className={`site-icon w-9 h-9 flex items-center justify-center shrink-0 ${T.iconBg}`}>
                    <CheckCircle size={17} />
                  </div>
                  <p className={`text-sm sm:text-base font-semibold leading-snug ${T.text}`}>{p.title}</p>
                  <p className={`text-xs sm:text-sm leading-relaxed ${T.muted}`}>{p.description}</p>
                </StaggerItem>
              ))}
            </StaggerGrid>
          </div>
        </section>
      )}

      {/* ── REVIEWS ── */}
      {biz.testimonials?.length > 0 && (
        <section id="reviews" className="pb-12 sm:pb-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className={`h-px mb-10 sm:mb-14 bg-gradient-to-r from-transparent ${T.isLight ? "via-gray-300" : "via-gray-800"} to-transparent`} />
            <FadeUp className="mb-8">
              <p className={`text-xs font-semibold uppercase tracking-widest mb-2 ${T.accentText}`}>
                {i18n.reviewsLabel}
              </p>
              <div className="flex flex-wrap items-end gap-3">
                <h2 className="text-xl sm:text-2xl font-bold">{i18n.reviewsTitle}</h2>
                {avgRating && (
                  <div className="flex items-center gap-1 mb-0.5">
                    <Star size={14} className="fill-yellow-400 text-yellow-400" />
                    <span className="font-bold text-sm">{avgRating}</span>
                    <span className={`text-xs ${T.faint}`}>({biz.testimonials.length})</span>
                  </div>
                )}
              </div>
            </FadeUp>
          </div>

          {biz.testimonials.length > 3 ? (
            <div dir="ltr"><ReviewMarquee reviews={biz.testimonials} isLight={T.isLight} /></div>
          ) : (
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {biz.testimonials.map((r, i) => (
                  <StaggerItem key={i} className={`site-card p-4 sm:p-5 border flex flex-col gap-3 ${T.card}`}>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map((n) => (
                        <Star key={n} size={12} className={n <= r.rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-700 text-gray-700"} />
                      ))}
                    </div>
                    <p className={`text-xs sm:text-sm leading-relaxed flex-1 ${T.muted}`}>&ldquo;{r.text}&rdquo;</p>
                    <div>
                      <p className={`font-semibold text-sm ${T.text}`}>{r.author}</p>
                      {r.role && <p className={`text-xs ${T.faint}`}>{r.role}</p>}
                    </div>
                  </StaggerItem>
                ))}
              </StaggerGrid>
            </div>
          )}
        </section>
      )}

      {/* ── GET IN TOUCH ── */}
      <section id="contact" className="pb-12 sm:pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className={`h-px mb-10 sm:mb-14 bg-gradient-to-r from-transparent ${T.isLight ? "via-gray-300" : "via-gray-800"} to-transparent`} />
          <FadeUp className="mb-8">
            <p className={`text-xs font-semibold uppercase tracking-widest mb-2 ${T.accentText}`}>
              {i18n.contactLabel}
            </p>
            <h2 className="text-xl sm:text-2xl font-bold">{i18n.contactTitle}</h2>
          </FadeUp>

          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">

            {biz.phone && (
              <a
                href={`tel:${biz.phone}`}
                className={`site-card break-inside-avoid block p-4 sm:p-5 border transition-all ${T.card} ${T.cardHover}`}
              >
                <div className={`site-icon w-9 h-9 flex items-center justify-center mb-3 ${T.iconBg}`}>
                  <Phone size={16} />
                </div>
                <p className={`text-[10px] font-medium uppercase tracking-wider mb-1 ${T.faint}`}>{i18n.phone}</p>
                <p className={`font-semibold text-sm ${T.text}`}>{biz.phone}</p>
              </a>
            )}

            {hours.length > 0 && (
              <div className={`site-card break-inside-avoid p-4 sm:p-5 border ${T.card}`}>
                <div className={`site-icon w-9 h-9 flex items-center justify-center mb-3 ${T.iconBg}`}>
                  <Clock size={16} />
                </div>
                <p className={`text-[10px] font-medium uppercase tracking-wider mb-3 ${T.faint}`}>{i18n.openingHours}</p>
                <div className="flex flex-col gap-1.5">
                  {hours.map(([day, time]) => (
                    <div key={day} className={`flex justify-between text-xs py-1 border-b last:border-0 ${T.divider}`}>
                      <span className={T.muted}>{day.slice(0, 3)}</span>
                      <span className={`font-medium ${T.text}`}>{time}</span>
                    </div>
                  ))}
                </div>
                <OpenStatus hours={biz.hours ?? {}} isLight={T.isLight} />
              </div>
            )}

            {biz.email && (
              <a
                href={`mailto:${biz.email}`}
                className={`site-card break-inside-avoid block p-4 sm:p-5 border transition-all ${T.card} ${T.cardHover}`}
              >
                <div className={`site-icon w-9 h-9 flex items-center justify-center mb-3 ${T.iconBg}`}>
                  <Mail size={16} />
                </div>
                <p className={`text-[10px] font-medium uppercase tracking-wider mb-1 ${T.faint}`}>{i18n.email}</p>
                <p className={`font-semibold text-sm break-all ${T.text}`}>{biz.email}</p>
              </a>
            )}

            {biz.address && (
              <a
                href={biz.maps_url || `https://maps.google.com/?q=${encodeURIComponent(biz.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`site-card break-inside-avoid block p-4 sm:p-5 border transition-all ${T.card} ${T.cardHover}`}
              >
                <div className={`site-icon w-9 h-9 flex items-center justify-center mb-3 ${T.iconBg}`}>
                  <MapPin size={16} />
                </div>
                <p className={`text-[10px] font-medium uppercase tracking-wider mb-1 ${T.faint}`}>{i18n.address}</p>
                <p className={`font-semibold text-sm ${T.text} leading-snug`}>{biz.address}</p>
              </a>
            )}

            {biz.social?.whatsapp && (
              <a
                href={`https://wa.me/${biz.social.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`site-card break-inside-avoid block p-4 sm:p-5 border transition-all ${T.card} ${T.cardHover}`}
              >
                <div className={`site-icon w-9 h-9 flex items-center justify-center mb-3 ${T.iconBg}`}>
                  <img src="/social-icons/whatsapp.png" alt="WhatsApp" width={18} height={18} className="object-contain" />
                </div>
                <p className={`text-[10px] font-medium uppercase tracking-wider mb-1 ${T.faint}`}>{i18n.whatsapp}</p>
                <p className={`font-semibold text-sm ${T.text}`}>{biz.social.whatsapp}</p>
              </a>
            )}

            {Object.entries(biz.social ?? {}).filter(([k, v]) => k !== "whatsapp" && v).length > 0 && (
              <div className={`site-card break-inside-avoid p-4 sm:p-5 border ${T.card}`}>
                <p className={`text-[10px] font-medium uppercase tracking-wider mb-3 ${T.faint}`}>{i18n.followUs}</p>
                <div className="flex flex-wrap gap-2">
                  {biz.social?.instagram && (
                    <SocialLink href={biz.social.instagram} name="Instagram" icon="/social-icons/instagram.png" />
                  )}
                  {biz.social?.facebook && (
                    <SocialLink href={biz.social.facebook} name="Facebook" icon="/social-icons/facebook.png" />
                  )}
                  {biz.social?.twitter && (
                    <SocialLink href={biz.social.twitter} name="X" icon="/social-icons/x.png" />
                  )}
                  {biz.social?.tiktok && (
                    <SocialLink href={biz.social.tiktok} name="TikTok" icon="/social-icons/tiktok.png" />
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="pb-5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className={`h-px mb-5 ${T.isLight ? "bg-gray-200" : "bg-gray-800"}`} />
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Desktop: Left and Right */}
          <div className="hidden sm:flex items-center justify-between">
            <span className={`text-sm ${T.faint}`}>
              <a href="#hero" className={`font-semibold ${T.accentText}`}>{biz.name}</a>
            </span>
            <span className={`text-sm ${T.faint}`}>
              © {new Date().getFullYear()}
            </span>
          </div>

          {/* Mobile: Centered, One Line */}
          <div className="flex sm:hidden items-center justify-center">
            <span className={`text-xs ${T.faint} text-center`}>
              <a href="#hero" className={`font-semibold ${T.accentText}`}>{biz.name}</a>
              {" "}© {new Date().getFullYear()}
            </span>
          </div>
        </div>
      </footer>

      {/* ── FLOATING BY BRAND BADGE ── */}
      <Link
        href={`https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "syrflow.com"}`}
        className={`fixed bottom-4 right-4 z-10 px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:opacity-80 ${
          T.isLight
            ? "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300"
            : "bg-gray-900 text-gray-400 hover:bg-gray-800 border border-gray-800"
        }`}
        title="Made with Syria Flow"
      >
        {i18n.byBrand}
      </Link>

    </div>
  );
}

// ── Social link component ─────────────────────────────────────────────────────
function SocialLink({ href, name, icon }: { href: string; name: string; icon: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={name}
      className="w-10 h-10 rounded-lg flex items-center justify-center transition-opacity hover:opacity-70 bg-white"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={icon} alt={name} width={22} height={22} className="object-contain" />
    </a>
  );
}
