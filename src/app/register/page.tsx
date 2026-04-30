"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Loader2, Star, Phone, Globe, Eye, EyeOff, Brain, Image,
  ChevronRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { PlaceResult } from "@/lib/places";

const FB_APP_ID = "1463790922054350";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Window { FB: any; fbAsyncInit: () => void; }
}

// ── Facebook types ────────────────────────────────────────────────────────────
interface FBPage {
  id: string; name: string; access_token: string; category: string;
  picture?: { data: { url: string } };
}
interface FBPageDetails {
  id: string; name: string; about?: string; description?: string;
  phone?: string; website?: string; fan_count?: number;
  overall_star_rating?: number; rating_count?: number;
  location?: { city?: string; country?: string; street?: string };
  cover?: { source: string };
  picture?: { data: { url: string } };
  photos?: { data: { images: { source: string; width: number }[] }[] };
}

function mapFBToPlace(details: FBPageDetails, page: FBPage): PlaceResult {
  const images: string[] = [];
  if (details.cover?.source) images.push(details.cover.source);
  if (details.photos?.data) {
    for (const photo of details.photos.data) {
      const src = photo.images?.sort((a, b) => b.width - a.width)[0]?.source;
      if (src) images.push(src);
    }
  }
  const loc = details.location;
  const address = loc ? [loc.street, loc.city, loc.country].filter(Boolean).join(", ") : "";
  return {
    name: details.name || page.name,
    category: page.category || "Business",
    description: details.about || details.description || "",
    phone: details.phone || "",
    address,
    website: details.website || "",
    images: images.slice(0, 10),
    reviews: [],
    hours: {},
    rating: details.overall_star_rating || 0,
    reviewCount: details.rating_count || details.fan_count || 0,
    mapsUrl: "",
  };
}

// ── Password strength ─────────────────────────────────────────────────────────
function strength(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}
const strengthLabel = ["Too short", "Weak", "Fair", "Good", "Strong"];
const strengthColor = ["bg-red-500", "bg-red-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"];

const mapsReasoningPool = [
  "Connecting to Google servers...", "Scanning business profile...",
  "Analyzing your listing data...", "Fetching customer reviews...",
  "Extracting business information...", "Processing location details...",
  "Verifying business authenticity...", "Loading contact information...",
  "Retrieving operating hours...", "Collecting gallery images...",
  "Reading customer feedback...", "Generating business insights...",
  "Almost there...", "Crawling Google Maps data...",
  "Extracting ratings and stats...", "Preparing your business profile...",
  "Just a few more seconds...", "Fetching the latest updates...",
];

const fbReasoningPool = [
  "Connecting to Facebook...", "Reading your page profile...",
  "Fetching page details...", "Loading contact information...",
  "Importing photos and cover...", "Reading about section...",
  "Fetching follower stats...", "Almost there...",
];

// ── Validate Google Maps URL ──────────────────────────────────────────────────
function isValidGoogleMapsUrl(url: string): boolean {
  if (!url || !url.trim()) return false;
  const patterns = [
    /^https:\/\/(www\.)?google\.com\/maps\/place\/.+/i,
    /^https:\/\/(www\.)?google\.com\/maps\/@.+/i,
    /^https:\/\/maps\.app\.goo\.gl\/[A-Za-z0-9]+/i,
    /^https:\/\/(www\.)?google\.com\/maps\/search\/.+/i,
  ];
  return patterns.some((p) => p.test(url.trim()));
}

// ── Image Strip ───────────────────────────────────────────────────────────────
function ImageSlider({ images }: { images: string[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const paused = useRef(false);
  const rafRef = useRef<number | null>(null);
  const THUMB = 80; const GAP = 6;

  useEffect(() => {
    if (images.length < 2) return;
    const total = images.length * (THUMB + GAP);
    let pos = 0;
    const tick = () => {
      if (!paused.current) { pos += 0.4; if (pos >= total) pos -= total; setOffset(pos); }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [images.length]);

  if (!images.length) return (
    <div className="h-20 bg-accent rounded-[6px] flex items-center justify-center">
      <p className="text-xs text-gray-500">No images</p>
    </div>
  );
  const doubled = [...images, ...images];
  return (
    <div className="overflow-hidden w-full" onMouseEnter={() => { paused.current = true; }} onMouseLeave={() => { paused.current = false; }}>
      <div ref={trackRef} className="flex" style={{ transform: `translateX(-${offset}px)`, gap: GAP, willChange: "transform" }}>
        {doubled.map((img, i) => (
          <img key={i} src={img} alt="" className="shrink-0 rounded-[6px] object-cover" style={{ width: THUMB, height: THUMB }} />
        ))}
      </div>
    </div>
  );
}

// ── Reviews Slider ────────────────────────────────────────────────────────────
function ReviewsSlider({ reviews }: { reviews: { author: string; text: string; rating: number }[] }) {
  const [idx, setIdx] = useState(0);
  const paused = useRef(false);
  useEffect(() => {
    if (reviews.length < 2) return;
    const t = setInterval(() => { if (!paused.current) setIdx((p) => (p + 1) % reviews.length); }, 4500);
    return () => clearInterval(t);
  }, [reviews.length]);
  if (!reviews.length) return null;
  const r = reviews[idx];
  const stars = "★".repeat(Math.round(r.rating));
  const snippet = r.text.length > 110 ? r.text.slice(0, 110) + "…" : r.text;
  return (
    <div className="bg-accent/60 border border-border/50 rounded-[6px] p-4 cursor-ew-resize select-none mb-3"
      onMouseEnter={() => { paused.current = true; }} onMouseLeave={() => { paused.current = false; }}
      onClick={() => setIdx((p) => (p + 1) % reviews.length)}>
      <p className="text-sm text-yellow-400 font-medium mb-1">
        {stars} <span className="text-muted-foreground font-normal text-xs">({r.rating}/5)</span>{" "}
        <span className="text-foreground text-xs">{snippet}</span>
      </p>
      <div className="flex items-center gap-2 mt-2.5">
        <div className="w-7 h-7 rounded-[6px] bg-[#0066cc] flex items-center justify-center text-xs font-bold text-white shrink-0">{r.author?.[0]?.toUpperCase() ?? "?"}</div>
        <span className="text-xs text-muted-foreground font-medium">{r.author}</span>
      </div>
    </div>
  );
}

// ── Testimonials Marquee ──────────────────────────────────────────────────────
const TESTIMONIALS = [
  { author: "Sarah Mitchell",   business: "The Golden Fork",       quote: "Our booking calls dropped 80% — customers book online now. Best decision we made.",                rating: 5 },
  { author: "James Al-Rashid", business: "Elite Auto Garage",      quote: "Clients find us on Google, see our page, and just show up. It runs itself.",                       rating: 5 },
  { author: "Priya Sharma",    business: "Bloom Yoga Studio",      quote: "We went from 12 to 45 monthly members in 3 months. The page sells for us.",                        rating: 5 },
  { author: "Carlos Mendez",   business: "MC Plumbing",            quote: "I paste my Google Maps link and it fills everything automatically. Took 4 minutes.",                rating: 5 },
  { author: "Aisha Hassan",    business: "Glow Skin Clinic",       quote: "Our online presence finally looks as premium as our service. Clients notice.",                      rating: 5 },
  { author: "Tom Erikson",     business: "Nordic Bakery",          quote: "The reviews slider on our page converted 3 new catering clients this week.",                        rating: 5 },
  { author: "Linda Chen",      business: "Pearl Wedding Co.",      quote: "Brides find us, see our work, and enquire — all without us lifting a finger.",                     rating: 5 },
  { author: "Mohammed Al-Ali", business: "Prestige Real Estate",   quote: "Listings look incredible. Clients comment on our website before we even pitch.",                   rating: 5 },
  { author: "Fatima Nour",     business: "Maison de Beauté",       quote: "Setup was under 5 minutes. My page now gets more traffic than our Instagram.",                     rating: 5 },
  { author: "Ryan O'Brien",    business: "CrossFit Dublin",        quote: "New members say they chose us because of our page. That's worth everything.",                      rating: 5 },
  { author: "Zara Williams",   business: "Zara Law Group",         quote: "Professional, fast, and clients actually read it. Finally a site I'm proud of.",                   rating: 5 },
  { author: "David Kim",       business: "Kim's Sushi Bar",        quote: "Reservations up 60% since launch. The auto-import from Google Maps is magic.",                     rating: 5 },
];
function TestimonialCard({ t }: { t: typeof TESTIMONIALS[0] }) {
  return (
    <div className="flex-shrink-0 w-64 bg-card border border-border rounded-[6px] p-4 mx-2">
      <div className="flex gap-0.5 mb-2.5">{[1,2,3,4,5].map((n) => <Star key={n} size={11} className="fill-yellow-400 text-yellow-400" />)}</div>
      <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-3">&ldquo;{t.quote}&rdquo;</p>
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-[6px] bg-[#0066cc] flex items-center justify-center text-xs font-bold text-white shrink-0">{t.author[0]}</div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-foreground truncate">{t.author}</p>
          <p className="text-[10px] text-gray-500 truncate">{t.business}</p>
        </div>
      </div>
    </div>
  );
}
function TestimonialsMarquee() {
  const row1 = TESTIMONIALS.slice(0, 6); const row2 = TESTIMONIALS.slice(6, 12);
  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="flex" style={{ animation: "marquee-l 35s linear infinite", width: "max-content" }}>
          {[...row1, ...row1].map((t, i) => <TestimonialCard key={i} t={t} />)}
        </div>
      </div>
      <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="flex" style={{ animation: "marquee-r 35s linear infinite", width: "max-content" }}>
          {[...row2, ...row2].map((t, i) => <TestimonialCard key={i} t={t} />)}
        </div>
      </div>
    </div>
  );
}

// ── FB icon SVG ───────────────────────────────────────────────────────────────
function FBIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} className={className}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

// ── AI loading block ──────────────────────────────────────────────────────────
function AILoadingBlock({ step, steps }: { step: number; steps: string[] }) {
  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden mt-2">
      <div className="border border-[#0066cc]/30 rounded-[6px] bg-[#0066cc]/8 dark:bg-[#0066cc]/10 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2 border-b border-[#0066cc]/30 bg-[#0066cc]/10 dark:bg-[#0066cc]/15">
          <Brain size={16} className="text-[#2997ff]/30" />
          <motion.span className="text-xs font-medium text-[#0066cc] dark:text-[#2997ff]" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}>
            AI is thinking
          </motion.span>
          <div className="flex gap-1 ml-auto">
            {[0, 0.2, 0.4].map((d, i) => (
              <motion.span key={i} className="w-1 h-1 bg-[#2997ff] rounded-[6px]" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: d }} />
            ))}
          </div>
        </div>
        <div className="px-4 py-3">
          <motion.p key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="text-sm text-foreground">
            {steps[step]}
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  // Wizard state
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [source, setSource] = useState<"maps" | "facebook" | null>(null);
  const [place, setPlace] = useState<PlaceResult | null>(null);

  // Google Maps state
  const [mapsUrl, setMapsUrl] = useState("");
  const [fetchError, setFetchError] = useState("");
  const [urlError, setUrlError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [reasoningStep, setReasoningStep] = useState(0);
  const [currentSteps, setCurrentSteps] = useState<string[]>([]);

  // Facebook state
  const [sdkReady, setSdkReady] = useState(false);
  const [fbSubStep, setFbSubStep] = useState<"connect" | "pages" | "fetching">("connect");
  const [fbPages, setFbPages] = useState<FBPage[]>([]);
  const [fbError, setFbError] = useState("");
  const [fbLoadingPages, setFbLoadingPages] = useState(false);

  // Account state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  // ── Helpers ──────────────────────────────────────────────────────────────────
  function getRandomSteps(pool: string[]) {
    const shuffled = [...pool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, 8);
  }

  async function runLoadingAnimation(pool: string[]) {
    const steps = getRandomSteps(pool);
    setCurrentSteps(steps);
    setReasoningStep(0);
    for (let i = 0; i < steps.length; i++) {
      setReasoningStep(i);
      await new Promise((r) => setTimeout(r, 550 + Math.random() * 300));
    }
    return steps;
  }

  // ── Google Maps flow ──────────────────────────────────────────────────────────
  const isUrlValid = isValidGoogleMapsUrl(mapsUrl);
  const canFind = !isLoading && mapsUrl.trim().length > 0 && isUrlValid;

  function handleUrlChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setMapsUrl(v);
    setFetchError("");
    setUrlError(v.trim().length > 0 && !isValidGoogleMapsUrl(v) ? "Please enter a valid Google Maps link only" : "");
  }

  async function findBusiness() {
    if (!canFind) return;
    setIsLoading(true);
    setFetchError("");
    setUrlError("");
    const animPromise = runLoadingAnimation(mapsReasoningPool);
    try {
      const res = await fetch("/api/places/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mapsUrl: mapsUrl.trim() }),
      });
      await animPromise;
      setIsLoading(false);
      const data = await res.json();
      if (!res.ok) { setFetchError(data.error ?? "Could not find that business."); return; }
      setPlace(data as PlaceResult);
      setStep(2);
    } catch {
      setIsLoading(false);
      setFetchError("Failed to fetch business data");
    }
  }

  // ── Facebook flow ─────────────────────────────────────────────────────────────
  function initFBSDK() {
    window.FB.init({ appId: FB_APP_ID, cookie: true, xfbml: false, version: "v22.0" });
    setSdkReady(true);
  }

  function handleFBLogin() {
    setFbError("");
    setFbLoadingPages(true);
    window.FB.login(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (res: any) => {
        if (res.authResponse) {
          fetchFBPages();
        } else {
          setFbLoadingPages(false);
          setFbError("Login cancelled or permission denied.");
        }
      },
      { scope: "pages_show_list,business_management,pages_read_engagement,pages_read_user_content" }
    );
  }

  function fetchFBPages() {
    window.FB.api(
      "/me/accounts",
      { fields: "id,name,access_token,category,picture.type(small)" },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (res: any) => {
        if (!res.error && res.data?.length > 0) {
          setFbPages(res.data);
          setFbLoadingPages(false);
          setFbSubStep("pages");
          return;
        }
        // Fallback: Business Manager
        window.FB.api("/me/businesses", { fields: "id,name" },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (bizRes: any) => {
            if (bizRes.error || !bizRes.data?.length) {
              setFbLoadingPages(false);
              setFbError("No Facebook Pages found. Make sure you are the Admin of a Page.");
              return;
            }
            const allPages: FBPage[] = [];
            let pending = bizRes.data.length;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            bizRes.data.forEach((biz: any) => {
              window.FB.api(`/${biz.id}/owned_pages`, { fields: "id,name,access_token,category,picture.type(small)" },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (pageRes: any) => {
                  if (!pageRes.error && pageRes.data?.length) allPages.push(...pageRes.data);
                  if (--pending === 0) {
                    setFbLoadingPages(false);
                    if (allPages.length === 0) {
                      setFbError("No Facebook Pages found. Make sure you are the Admin of a Page.");
                    } else {
                      setFbPages(allPages);
                      setFbSubStep("pages");
                    }
                  }
                }
              );
            });
          }
        );
      }
    );
  }

  async function selectFBPage(page: FBPage) {
    setFbSubStep("fetching");
    setFbError("");
    const animPromise = runLoadingAnimation(fbReasoningPool);
    window.FB.api(
      `/${page.id}`,
      {
        access_token: page.access_token,
        fields: [
          "id", "name", "about", "description", "phone", "website",
          "fan_count", "overall_star_rating", "rating_count",
          "location", "cover", "picture.type(large)",
          "photos.limit(9){images}",
        ].join(","),
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async (res: any) => {
        await animPromise;
        if (res.error) {
          setFbSubStep("pages");
          setFbError(res.error.message);
          return;
        }
        const mapped = mapFBToPlace(res as FBPageDetails, page);
        setPlace(mapped);
        setStep(2);
      }
    );
  }

  // ── Account creation ──────────────────────────────────────────────────────────
  const pwStrength = strength(password);
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const pwMatch = password === confirmPw && confirmPw.length > 0;
  const canSubmit = emailValid && pwStrength >= 2 && pwMatch;

  async function createAccount(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || !place) return;
    setAuthLoading(true);
    setAuthError("");

    const { error: authErr } = await supabase.auth.signUp({ email, password });
    if (authErr) { setAuthError(authErr.message); setAuthLoading(false); return; }

    const bizRes = await fetch("/api/business", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: place.name,
        tagline: "",
        description: place.description,
        category: place.category,
        phone: place.phone,
        email: "",
        address: place.address,
        maps_url: place.mapsUrl || "",
        website: place.website,
        hero_image: "",
        gallery: place.images,
        hours: place.hours,
        services: [],
        testimonials: place.reviews.map((r) => ({ author: r.author, role: "", text: r.text, rating: r.rating })),
        social: {},
        theme_color: "indigo",
        stat_years: "",
        stat_clients: place.reviewCount ? `${place.reviewCount.toLocaleString()}+` : "",
        stat_projects: place.rating ? `${place.rating} ★` : "",
      }),
    });

    if (!bizRes.ok) {
      const d = await bizRes.json();
      setAuthError(d.error ?? "Account created but failed to save business");
      setAuthLoading(false);
      return;
    }
    router.push("/dashboard");
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <>
      <Script src="https://connect.facebook.net/en_US/sdk.js" strategy="afterInteractive" onLoad={initFBSDK} />

      <div className="min-h-screen bg-background text-foreground flex flex-col">

        {/* Progress bar */}
        <div className="w-full flex justify-center">
          <div className="w-full max-w-6xl px-4 sm:px-6">
            <div className="w-full h-0.5 bg-accent rounded-[6px]">
              <motion.div className="h-full bg-[#0071e3] rounded-[6px]"
                animate={{ width: step === 1 ? "33%" : step === 2 ? "66%" : "100%" }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row lg:items-center max-w-6xl mx-auto w-full">

          {/* Form column */}
          <div className="lg:w-[520px] lg:flex-shrink-0 px-4 sm:px-6 py-14 lg:border-r border-border">
          <div className="w-full max-w-lg">

            <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-foreground transition-colors mb-8">
              Return to home
            </Link>

            <motion.p key={step} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-xs text-gray-500 mb-6 font-medium tracking-widest uppercase">
              Step {step} of 3
            </motion.p>

            <AnimatePresence mode="wait">

              {/* ── STEP 1 ── */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                  <h1 className="text-3xl font-bold mb-2">Find your business</h1>
                  <p className="text-muted-foreground mb-6">Choose how you want to import your business data.</p>

                  {/* Source selector */}
                  {!source && (
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <button
                        onClick={() => setSource("maps")}
                        className="flex flex-col items-center gap-3 p-5 bg-card border-2 border-border hover:border-[#0066cc] rounded-[8px] transition-all text-center group"
                      >
                        <div className="w-11 h-11 rounded-[8px] bg-[#0066cc]/10 flex items-center justify-center group-hover:bg-[#0066cc]/15 transition-colors">
                          <MapPin size={20} style={{ color: "#0066cc" }} />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-foreground">Google Maps</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">Paste your Maps link</p>
                        </div>
                      </button>

                      <button
                        onClick={() => setSource("facebook")}
                        className="flex flex-col items-center gap-3 p-5 bg-card border-2 border-border hover:border-[#1877F2] rounded-[8px] transition-all text-center group"
                      >
                        <div className="w-11 h-11 rounded-[8px] bg-[#1877F2]/10 flex items-center justify-center group-hover:bg-[#1877F2]/15 transition-colors">
                          <FBIcon size={20} className="text-[#1877F2]" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-foreground">Facebook Page</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">Connect your Page</p>
                        </div>
                      </button>
                    </div>
                  )}

                  {/* ── Google Maps input ── */}
                  {source === "maps" && (
                    <div className="flex flex-col gap-3">
                      <button onClick={() => setSource(null)} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-foreground transition-colors mb-1">
                        ← Change source
                      </button>

                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-[6px] bg-[#0066cc]/10 flex items-center justify-center">
                          <MapPin size={13} style={{ color: "#0066cc" }} />
                        </div>
                        <span className="text-sm font-medium">Google Maps</span>
                      </div>

                      <p className="text-sm text-muted-foreground mb-2">
                        Open Google Maps, search your business, click <strong className="text-foreground">Share → Copy link</strong> and paste below.
                      </p>

                      {fetchError && (
                        <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-[6px] px-4 py-3">
                          {fetchError}
                        </div>
                      )}

                      <div>
                        <label className="block text-sm text-gray-300 mb-1.5">Google Maps link</label>
                        <div className="flex gap-2">
                          <input
                            value={mapsUrl}
                            onChange={handleUrlChange}
                            onKeyDown={(e) => e.key === "Enter" && canFind && findBusiness()}
                            placeholder="https://maps.app.goo.gl/your-business-link"
                            className={`flex-1 bg-background border rounded-[6px] px-4 py-3 text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none focus:border-[#0066cc] transition-colors ${urlError ? "border-red-500" : "border-input"}`}
                          />
                          <button
                            onClick={findBusiness}
                            disabled={!canFind}
                            className={`px-5 py-3 rounded-[6px] text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${canFind ? "bg-[#0066cc] hover:bg-[#0071e3] text-white" : "bg-accent opacity-50 cursor-not-allowed"}`}
                          >
                            {isLoading ? <Loader2 size={16} className="animate-spin" /> : "Find"}
                          </button>
                        </div>
                        {urlError && <p className="text-xs text-red-400 mt-1">{urlError}</p>}
                        <p className="text-xs text-gray-500 mt-2">Only Google Maps links accepted. Example: https://maps.app.goo.gl/...</p>
                      </div>

                      <AnimatePresence mode="wait">
                        {isLoading && currentSteps.length > 0 && (
                          <AILoadingBlock step={reasoningStep} steps={currentSteps} />
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* ── Facebook flow ── */}
                  {source === "facebook" && (
                    <div className="flex flex-col gap-3">
                      <button onClick={() => { setSource(null); setFbSubStep("connect"); setFbPages([]); setFbError(""); }} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-foreground transition-colors mb-1">
                        ← Change source
                      </button>

                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-[6px] bg-[#1877F2]/10 flex items-center justify-center">
                          <FBIcon size={13} className="text-[#1877F2]" />
                        </div>
                        <span className="text-sm font-medium">Facebook Page</span>
                      </div>

                      {fbError && (
                        <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-[6px] px-4 py-3">
                          {fbError}
                        </div>
                      )}

                      {/* Connect button */}
                      {fbSubStep === "connect" && (
                        <button
                          onClick={handleFBLogin}
                          disabled={fbLoadingPages}
                          className="flex items-center justify-center gap-2.5 bg-[#1877F2] hover:bg-[#166FE5] disabled:opacity-50 text-white font-semibold py-3.5 rounded-[6px] transition-colors"
                        >
                          {(fbLoadingPages || !sdkReady) ? <Loader2 size={16} className="animate-spin" /> : <FBIcon size={16} />}
                          {fbLoadingPages ? "Connecting…" : !sdkReady ? "Loading…" : "Connect with Facebook"}
                        </button>
                      )}

                      {/* Page list */}
                      {fbSubStep === "pages" && fbPages.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground mb-1">Select your business page:</p>
                          {fbPages.map((page) => (
                            <button
                              key={page.id}
                              onClick={() => selectFBPage(page)}
                              className="w-full flex items-center gap-3 bg-card hover:bg-accent border border-border hover:border-border/70 rounded-[8px] p-3.5 text-left transition-all"
                            >
                              {page.picture?.data.url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={page.picture.data.url} alt={page.name} width={36} height={36} className="rounded-full shrink-0 object-cover" />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-[#1877F2]/20 flex items-center justify-center shrink-0">
                                  <span className="text-[#1877F2] font-bold text-sm">{page.name[0]}</span>
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm truncate">{page.name}</p>
                                <p className="text-xs text-muted-foreground">{page.category}</p>
                              </div>
                              <ChevronRight size={15} className="text-muted-foreground shrink-0" />
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Fetching page details animation */}
                      {fbSubStep === "fetching" && (
                        <AnimatePresence>
                          <AILoadingBlock step={reasoningStep} steps={currentSteps} />
                        </AnimatePresence>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── STEP 2 ── */}
              {step === 2 && place && (
                <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                  <h1 className="text-3xl font-bold mb-2">Is this your business?</h1>
                  <p className="text-muted-foreground mb-6">Confirm this is the correct listing before we set up your page.</p>

                  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="bg-card border border-border rounded-[6px] overflow-hidden mb-6">

                    <div className="pt-4 px-4">
                      <ImageSlider images={place.images} />
                    </div>

                    <div className="p-4 pt-3">
                      {/* Source badge */}
                      <div className="flex items-center gap-1.5 mb-2">
                        {source === "facebook" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#1877F2]/10 text-[#1877F2]">
                            <FBIcon size={10} /> Facebook Page
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#0066cc]/10 text-[#0066cc]">
                            <MapPin size={10} /> Google Maps
                          </span>
                        )}
                      </div>

                      <h2 className="text-base font-bold text-foreground mb-0.5">{place.name}</h2>

                      {(place.rating > 0 || place.reviewCount > 0) && (
                        <div className="flex items-center gap-1.5 mb-3">
                          <Star size={13} className="fill-yellow-400 text-yellow-400" />
                          {place.rating > 0 && <span className="text-xs text-muted-foreground font-medium">{place.rating} /5 rating</span>}
                          {place.reviewCount > 0 && (
                            <>
                              <span className="text-muted-foreground text-xs">•</span>
                              <span className="text-xs text-muted-foreground">{place.reviewCount.toLocaleString()} {source === "facebook" ? "followers" : "reviews"}</span>
                            </>
                          )}
                        </div>
                      )}

                      {place.reviews?.length > 0 && <ReviewsSlider reviews={place.reviews} />}

                      <div className="flex items-center gap-4 py-2.5 px-3 bg-accent/50 rounded-[6px] mb-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Star size={11} className="text-yellow-400 fill-yellow-400" />
                          <span><span className="text-foreground font-semibold">{place.reviewCount?.toLocaleString() ?? 0}</span> {source === "facebook" ? "followers" : "reviews"}</span>
                        </div>
                        <div className="w-px h-3 bg-border" />
                        <div className="flex items-center gap-1.5">
                          <Image size={11} className="text-[#0066cc] dark:text-[#2997ff]" />
                          <span><span className="text-foreground font-semibold">{place.images?.length ?? 0}</span> photos</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5 text-xs text-muted-foreground border-t border-border pt-3 mt-1">
                        {place.address && (
                          <div className="flex items-start gap-2">
                            <MapPin size={12} className="text-muted-foreground mt-0.5 shrink-0" />
                            <span>{place.address}</span>
                          </div>
                        )}
                        {place.phone && (
                          <div className="flex items-center gap-2">
                            <Phone size={12} className="text-muted-foreground shrink-0" />
                            <span>{place.phone}</span>
                          </div>
                        )}
                        {place.website && (
                          <div className="flex items-center gap-2">
                            <Globe size={12} className="text-muted-foreground shrink-0" />
                            <span className="truncate">{place.website.replace(/^https?:\/\//, "")}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>

                  <div className="flex flex-col gap-3">
                    <button onClick={() => setStep(3)} className="bg-[#0066cc] hover:bg-[#0071e3] text-white py-3.5 rounded-[6px] font-medium transition-colors">
                      Yes, this is my business
                    </button>
                    <button
                      onClick={() => { setStep(1); setPlace(null); setFetchError(""); setMapsUrl(""); setUrlError(""); setFbSubStep("connect"); setFbPages([]); setFbError(""); }}
                      className="border border-input hover:border-border text-muted-foreground hover:text-foreground py-3.5 rounded-[6px] font-medium transition-colors"
                    >
                      Not my business, search again
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 3 ── */}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                  <h1 className="text-3xl font-bold mb-2">Create your account</h1>
                  <p className="text-muted-foreground mb-8">Almost done. Set up your login details.</p>

                  {authError && (
                    <div className="mb-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-[6px] px-4 py-3">
                      {authError}
                    </div>
                  )}

                  <form onSubmit={createAccount} className="flex flex-col gap-5">
                    <div>
                      <label className="block text-sm text-muted-foreground mb-1.5">Email address</label>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com" required
                        className={`w-full bg-background border rounded-[6px] px-4 py-3 text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none transition-colors ${email.length > 0 ? (emailValid ? "border-green-600 dark:border-green-700" : "border-red-500") : "border-input focus:border-[#0066cc]"}`}
                      />
                      {email.length > 0 && !emailValid && <p className="text-xs text-red-600 dark:text-red-400 mt-1">Enter a valid email address</p>}
                    </div>

                    <div>
                      <label className="block text-sm text-muted-foreground mb-1.5">Password</label>
                      <div className="relative">
                        <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                          placeholder="At least 8 characters" required
                          className="w-full bg-background border border-input rounded-[6px] px-4 py-3 pr-11 text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none focus:border-[#0066cc] transition-colors"
                        />
                        <button type="button" onClick={() => setShowPw((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                          {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                      </div>
                      {password.length > 0 && (
                        <div className="mt-2">
                          <div className="flex gap-1 mb-1">
                            {[0,1,2,3].map((i) => <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < pwStrength ? strengthColor[pwStrength] : "bg-border"}`} />)}
                          </div>
                          <p className="text-xs text-gray-500">{strengthLabel[pwStrength]}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm text-muted-foreground mb-1.5">Confirm password</label>
                      <div className="relative">
                        <input type={showConfirmPw ? "text" : "password"} value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)}
                          placeholder="Repeat your password" required
                          className={`w-full bg-background border rounded-[6px] px-4 py-3 pr-11 text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none transition-colors ${confirmPw.length > 0 ? (pwMatch ? "border-green-600 dark:border-green-700" : "border-red-500") : "border-input focus:border-[#0066cc]"}`}
                        />
                        <button type="button" onClick={() => setShowConfirmPw((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                          {showConfirmPw ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                      </div>
                      {confirmPw.length > 0 && !pwMatch && <p className="text-xs text-red-600 dark:text-red-400 mt-1">Passwords do not match</p>}
                    </div>

                    <p className="text-xs text-muted-foreground text-center">
                      By creating an account you agree to our{" "}
                      <Link href="/terms" className="underline hover:text-foreground">Terms</Link> and{" "}
                      <Link href="/privacy-policy" className="underline hover:text-foreground">Privacy Policy</Link>.
                    </p>

                    <button type="submit" disabled={authLoading || !canSubmit}
                      className="flex items-center justify-center gap-2 bg-[#0066cc] hover:bg-[#0071e3] disabled:opacity-50 py-3.5 rounded-[6px] font-medium transition-colors text-white">
                      {authLoading ? <Loader2 size={16} className="animate-spin" /> : "Create account"}
                    </button>
                  </form>

                  <button onClick={() => setStep(2)} className="flex items-center justify-center gap-1.5 text-xs text-gray-500 hover:text-gray-400 mt-4 w-full transition-colors">
                    Back to business preview
                  </button>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
          </div>

          {/* Marquee column */}
          <div className="flex-1 overflow-hidden px-4 sm:px-6 py-10 lg:py-14 flex flex-col justify-center gap-6 border-t border-border lg:border-t-0">
            <div className="text-center lg:text-left px-2">
              <p className="text-xs text-gray-500 uppercase tracking-widest font-medium mb-1">Love our Solution</p>
              <h3 className="text-lg font-semibold text-foreground">Businesses love ahna.ae</h3>
            </div>
            <TestimonialsMarquee />
          </div>

        </div>
      </div>
    </>
  );
}
