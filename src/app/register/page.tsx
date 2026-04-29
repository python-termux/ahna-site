"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Loader2, Star, Phone, Globe, Eye, EyeOff, Brain, Image,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { PlaceResult } from "@/lib/places";

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

// Random reasoning steps pool
const reasoningPool = [
  "Connecting to Google servers...",
  "Scanning business profile...",
  "Analyzing your listing data...",
  "Fetching customer reviews...",
  "Extracting business information...",
  "Processing location details...",
  "Verifying business authenticity...",
  "Loading contact information...",
  "Retrieving operating hours...",
  "Collecting gallery images...",
  "Reading customer feedback...",
  "Generating business insights...",
  "Almost there...",
  "Crawling Google Maps data...",
  "Extracting ratings and stats...",
  "Preparing your business profile...",
  "Just a few more seconds...",
  "Fetching the latest updates...",
  "Processing your request...",
  "Getting everything ready..."
];

// ── Validate Google Maps URL ─────────────────────────────────────────────────
function isValidGoogleMapsUrl(url: string): boolean {
  if (!url || !url.trim()) return false;
  
  const trimmedUrl = url.trim();
  
  const patterns = [
    /^https:\/\/(www\.)?google\.com\/maps\/place\/.+/i,
    /^https:\/\/(www\.)?google\.com\/maps\/@.+/i,
    /^https:\/\/maps\.app\.goo\.gl\/[A-Za-z0-9]+/i,
    /^https:\/\/(www\.)?google\.com\/maps\/search\/.+/i,
  ];
  
  return patterns.some(pattern => pattern.test(trimmedUrl));
}

// ── Image Strip (auto-scrolling thumbnails, square, no dots) ─────────────────
function ImageSlider({ images }: { images: string[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const paused = useRef(false);
  const rafRef = useRef<number | null>(null);

  const THUMB = 80; // px per thumbnail (w + gap)
  const GAP = 6;

  useEffect(() => {
    if (images.length < 2) return;
    const total = images.length * (THUMB + GAP);
    let pos = 0;
    const tick = () => {
      if (!paused.current) {
        pos += 0.4;
        if (pos >= total) pos -= total;
        setOffset(pos);
      }
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
    <div
      className="overflow-hidden w-full"
      onMouseEnter={() => { paused.current = true; }}
      onMouseLeave={() => { paused.current = false; }}
    >
      <div
        ref={trackRef}
        className="flex"
        style={{ transform: `translateX(-${offset}px)`, gap: GAP, willChange: "transform" }}
      >
        {doubled.map((img, i) => (
          <img
            key={i}
            src={img}
            alt=""
            className="shrink-0 rounded-[6px] object-cover"
            style={{ width: THUMB, height: THUMB }}
          />
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
    const t = setInterval(() => {
      if (!paused.current) setIdx((p) => (p + 1) % reviews.length);
    }, 4500);
    return () => clearInterval(t);
  }, [reviews.length]);

  if (!reviews.length) return (
    <div className="bg-accent/60 rounded-[6px] p-3">
      <p className="text-xs text-gray-500">No reviews</p>
    </div>
  );

  const r = reviews[idx];
  const stars = "★".repeat(Math.round(r.rating));
  const snippet = r.text.length > 110 ? r.text.slice(0, 110) + "…" : r.text;
  const initial = r.author?.[0]?.toUpperCase() ?? "?";

  return (
    <div
      className="bg-accent/60 border border-border/50 rounded-[6px] p-4 cursor-ew-resize select-none"
      onMouseEnter={() => { paused.current = true; }}
      onMouseLeave={() => { paused.current = false; }}
      onClick={() => setIdx((p) => (p + 1) % reviews.length)}
    >
      {/* Stars + rating label */}
      <p className="text-sm text-yellow-400 font-medium mb-1">
        {stars} <span className="text-muted-foreground font-normal text-xs">({r.rating}/5)</span>{" "}
        <span className="text-foreground text-xs">{snippet}</span>
      </p>

      {/* Author row */}
      <div className="flex items-center gap-2 mt-2.5">
        <div className="w-7 h-7 rounded-[6px] bg-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
          {initial}
        </div>
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
      <div className="flex gap-0.5 mb-2.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star key={n} size={11} className="fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-3">"{t.quote}"</p>
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-[6px] bg-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
          {t.author[0]}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-foreground truncate">{t.author}</p>
          <p className="text-[10px] text-gray-500 truncate">{t.business}</p>
        </div>
      </div>
    </div>
  );
}

function TestimonialsMarquee() {
  const row1 = TESTIMONIALS.slice(0, 6);
  const row2 = TESTIMONIALS.slice(6, 12);
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

// ── Main page ─────────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [mapsUrl, setMapsUrl] = useState("");
  const [place, setPlace] = useState<PlaceResult | null>(null);
  const [fetchError, setFetchError] = useState("");
  const [urlError, setUrlError] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [reasoningStep, setReasoningStep] = useState(0);
  const [currentSteps, setCurrentSteps] = useState<string[]>([]);
  
  const getRandomSteps = () => {
    const shuffled = [...reasoningPool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, 8);
  };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const isUrlValid = isValidGoogleMapsUrl(mapsUrl);
  const canFind = !isLoading && mapsUrl.trim().length > 0 && isUrlValid;

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMapsUrl(value);
    setFetchError("");
    
    if (value.trim().length > 0 && !isValidGoogleMapsUrl(value)) {
      setUrlError("Please enter a valid Google Maps link only");
    } else {
      setUrlError("");
    }
  };

  async function findBusiness() {
    if (!canFind) return;
    
    const randomSteps = getRandomSteps();
    setCurrentSteps(randomSteps);
    setIsLoading(true);
    setFetchError("");
    setUrlError("");
    
    for (let i = 0; i < randomSteps.length; i++) {
      setReasoningStep(i);
      await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 300));
    }
    
    try {
      const res = await fetch("/api/places/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mapsUrl: mapsUrl.trim() }),
      });
      const data = await res.json();
      setIsLoading(false);
      
      if (!res.ok) {
        setFetchError(data.error ?? "Could not find that business. Try a different URL.");
        return;
      }
      
      setPlace(data as PlaceResult);
      setStep(2);
    } catch (err) {
      setIsLoading(false);
      setFetchError("Failed to fetch business data");
    }
  }

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
    if (authErr) {
      setAuthError(authErr.message);
      setAuthLoading(false);
      return;
    }

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
        website: place.website,
        hero_image: place.images[0] ?? "",
        gallery: place.images.slice(1, 6),
        hours: place.hours,
        services: [],
        testimonials: place.reviews.map((r) => ({
          author: r.author,
          role: "",
          text: r.text,
          rating: r.rating,
        })),
        social: {},
        theme_color: "indigo",
        stat_years: "",
        stat_clients: place.reviewCount ? `${place.reviewCount.toLocaleString()}+` : "",
        stat_projects: place.rating ? `${place.rating} ★` : "",
      }),
    });

    if (!bizRes.ok) {
      const bizData = await bizRes.json();
      setAuthError(bizData.error ?? "Account created but failed to save business");
      setAuthLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">

      {/* Progress bar */}
      <div className="w-full flex justify-center">
        <div className="w-full max-w-6xl px-4 sm:px-6">
          <div className="w-full h-0.5 bg-accent rounded-[6px]">
            <motion.div
              className="h-full bg-indigo-500 rounded-[6px]"
              animate={{ width: step === 1 ? "33%" : step === 2 ? "66%" : "100%" }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            />
          </div>
        </div>
      </div>

      {/* Two-column layout: form left, marquee right (desktop) / form top, marquee bottom (mobile) */}
      <div className="flex-1 flex flex-col lg:flex-row lg:items-center max-w-6xl mx-auto w-full">

        {/* Form column */}
        <div className="lg:w-[520px] lg:flex-shrink-0 px-4 sm:px-6 py-14 lg:border-r border-border">
        <div className="w-full max-w-lg">

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-foreground transition-colors mb-8"
          >
            Return to home
          </Link>

          <motion.p
            key={step}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-gray-500 mb-6 font-medium tracking-widest uppercase"
          >
            Step {step} of 3
          </motion.p>

          <AnimatePresence mode="wait">

            {/* STEP 1 */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-3xl font-bold mb-2">Find your business</h1>
                <p className="text-muted-foreground mb-8">
                  Open Google Maps, search your business, <br />click <strong className="text-foreground">Share → Copy link</strong> and paste it below.
                </p>

                {fetchError && (
                  <div className="mb-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-[6px] px-4 py-3">
                    {fetchError}
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1.5">Google Maps link</label>
                    <div className="flex gap-2">
                      <input
                        value={mapsUrl}
                        onChange={handleUrlChange}
                        onKeyDown={(e) => e.key === "Enter" && canFind && findBusiness()}
                        placeholder="https://maps.app.goo.gl/your-business-link"
                        className={`flex-1 bg-background border rounded-[6px] px-4 py-3 text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none focus:border-indigo-500 transition-colors ${
                          urlError ? "border-red-500 focus:border-red-500" : "border-input"
                        }`}
                      />
                      <button
                        onClick={findBusiness}
                        disabled={!canFind}
                        className={`px-5 py-3 rounded-[6px] text-sm font-medium transition-colors whitespace-nowrap flex items-center justify-center gap-2 ${
                          canFind
                            ? "bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
                            : "bg-accent cursor-not-allowed opacity-50"
                        }`}
                      >
                        {isLoading ? <Loader2 size={16} className="animate-spin" /> : "Find"}
                      </button>
                    </div>
                    {urlError && (
                      <p className="text-xs text-red-400 mt-1">{urlError}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Only Google Maps links are accepted. Example: https://maps.app.goo.gl/....
                    </p>
                  </div>

                  <AnimatePresence mode="wait">
                    {isLoading && currentSteps.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-2 border border-indigo-500/30 rounded-[6px] bg-indigo-50 dark:bg-indigo-950/20 overflow-hidden">
                          <div className="flex items-center gap-2 px-4 py-2 border-b border-indigo-500/30 bg-indigo-100 dark:bg-indigo-950/40">
                            <div className="relative">
                              <Brain size={16} className="text-indigo-400/30" />
                              <motion.div
                                className="absolute inset-0"
                                animate={{
                                  background: [
                                    "linear-gradient(90deg, transparent 0%, rgba(99,102,241,0) 0%, transparent 100%)",
                                    "linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.8) 50%, transparent 100%)",
                                    "linear-gradient(90deg, transparent 0%, rgba(99,102,241,0) 100%, transparent 100%)"
                                  ]
                                }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  maskImage: "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"%3E%3Cpath d=\"M12 4a4 4 0 0 1 3.5 6A4 4 0 0 1 12 18a4 4 0 0 1-3.5-6A4 4 0 0 1 12 4z\"%3E%3C/path%3E%3Cpath d=\"M12 2v2\"%3E%3C/path%3E%3Cpath d=\"M12 20v2\"%3E%3C/path%3E%3Cpath d=\"M4.93 4.93l1.41 1.41\"%3E%3C/path%3E%3Cpath d=\"M17.66 17.66l1.41 1.41\"%3E%3C/path%3E%3Cpath d=\"M2 12h2\"%3E%3C/path%3E%3Cpath d=\"M20 12h2\"%3E%3C/path%3E%3C/svg%3E')",
                                  maskRepeat: "no-repeat",
                                  maskSize: "contain"
                                }}
                              />
                            </div>
                            <motion.span
                              className="text-xs font-medium text-indigo-600 dark:text-indigo-300"
                              animate={{ opacity: [0.5, 1, 0.5] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                              AI is thinking
                            </motion.span>
                            <div className="flex gap-1 ml-auto">
                              <motion.span className="w-1 h-1 bg-indigo-400 rounded-[6px]" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0 }} />
                              <motion.span className="w-1 h-1 bg-indigo-400 rounded-[6px]" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} />
                              <motion.span className="w-1 h-1 bg-indigo-400 rounded-[6px]" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} />
                            </div>
                          </div>
                          <div className="px-4 py-3">
                            <motion.p
                              key={reasoningStep}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.3 }}
                              className="text-sm text-foreground"
                            >
                              {currentSteps[reasoningStep]}
                            </motion.p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* STEP 2 - with Image Slider (no dots) and Reviews Slider */}
            {step === 2 && place && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-3xl font-bold mb-2">Is this your business?</h1>
                <p className="text-muted-foreground mb-6">Confirm this is the correct listing before we set up your page.</p>

                {/* Business card */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-card border border-border rounded-[6px] overflow-hidden mb-6"
                >
                  {/* Image strip */}
                  <div className="pt-4 px-4">
                    <ImageSlider images={place.images} />
                  </div>

                  <div className="p-4 pt-3">
                    {/* Business name */}
                    <h2 className="text-base font-bold text-foreground mb-0.5">{place.name}</h2>

                    {/* Rating row */}
                    {(place.rating || place.reviewCount) && (
                      <div className="flex items-center gap-1.5 mb-3">
                        <Star size={13} className="fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-muted-foreground font-medium">
                          {place.rating} /5 rating
                        </span>
                        {place.reviewCount ? (
                          <>
                            <span className="text-muted-foreground text-xs">•</span>
                            <span className="text-xs text-muted-foreground">{place.reviewCount.toLocaleString()} reviews</span>
                          </>
                        ) : null}
                      </div>
                    )}

                    {/* Review slider */}
                    {place.reviews && place.reviews.length > 0 && (
                      <div className="mb-3">
                        <ReviewsSlider reviews={place.reviews} />
                      </div>
                    )}

                    {/* Counts row */}
                    <div className="flex items-center gap-4 py-2.5 px-3 bg-accent/50 rounded-[6px] mb-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Star size={11} className="text-yellow-400 fill-yellow-400" />
                        <span><span className="text-foreground font-semibold">{place.reviewCount?.toLocaleString() ?? 0}</span> reviews</span>
                      </div>
                      <div className="w-px h-3 bg-border" />
                      <div className="flex items-center gap-1.5">
                        <Image size={11} className="text-indigo-500 dark:text-indigo-400" />
                        <span><span className="text-foreground font-semibold">{place.images?.length ?? 0}</span> photos</span>
                      </div>
                    </div>

                    {/* Business details */}
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
                  <button
                    onClick={() => setStep(3)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white py-3.5 rounded-[6px] font-medium transition-colors cursor-pointer"
                  >
                    Yes, this is my business
                  </button>

                  <button
                    onClick={() => { setStep(1); setPlace(null); setFetchError(""); setMapsUrl(""); setUrlError(""); }}
                    className="border border-input hover:border-border text-muted-foreground hover:text-foreground py-3.5 rounded-[6px] font-medium transition-colors cursor-pointer"
                  >
                    Not my Business search again
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
              >
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
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className={`w-full bg-background border rounded-[6px] px-4 py-3 text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none transition-colors ${
                        email.length > 0 ? (emailValid ? "border-green-600 dark:border-green-700 focus:border-green-500" : "border-red-500 dark:border-red-800 focus:border-red-500") : "border-input focus:border-indigo-500"
                      }`}
                    />
                    {email.length > 0 && !emailValid && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">Enter a valid email address</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm text-muted-foreground mb-1.5">Password</label>
                    <div className="relative">
                      <input
                        type={showPw ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        required
                        className="w-full bg-background border border-input rounded-[6px] px-4 py-3 pr-11 text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gray-700 dark:hover:text-gray-300 transition-colors cursor-pointer"
                      >
                        {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                    {password.length > 0 && (
                      <div className="mt-2">
                        <div className="flex gap-1 mb-1">
                          {[0, 1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className={`h-1 flex-1 rounded-full transition-colors ${
                                i < pwStrength ? strengthColor[pwStrength] : "bg-border"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-gray-500">{strengthLabel[pwStrength]}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm text-muted-foreground mb-1.5">Confirm password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPw ? "text" : "password"}
                        value={confirmPw}
                        onChange={(e) => setConfirmPw(e.target.value)}
                        placeholder="Repeat your password"
                        required
                        className={`w-full bg-background border rounded-[6px] px-4 py-3 pr-11 text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none transition-colors ${
                          confirmPw.length > 0 ? (pwMatch ? "border-green-600 dark:border-green-700 focus:border-green-500" : "border-red-500 dark:border-red-800 focus:border-red-500") : "border-input focus:border-indigo-500"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPw((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gray-700 dark:hover:text-gray-300 transition-colors cursor-pointer"
                      >
                        {showConfirmPw ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                    {confirmPw.length > 0 && !pwMatch && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">Passwords do not match</p>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground text-center">
                    By creating an account you agree to our{" "}
                    <Link href="/terms" className="text-muted-foreground hover:text-foreground underline">Terms</Link>
                    {" "}and{" "}
                    <Link href="/privacy-policy" className="text-muted-foreground hover:text-foreground underline">Privacy Policy</Link>.
                  </p>
                  <button
                    type="submit"
                    disabled={authLoading || !canSubmit}
                    className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 py-3.5 rounded-[6px] font-medium transition-colors cursor-pointer"
                  >
                    {authLoading ? <Loader2 size={16} className="animate-spin" /> : "Create account"}
                  </button>
                </form>

                <button
                  onClick={() => setStep(2)}
                  className="flex items-center justify-center gap-1.5 text-xs text-gray-500 hover:text-gray-400 mt-4 w-full transition-colors cursor-pointer"
                >
                  Back to business preview
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
        </div>{/* end form column */}

        {/* Marquee column */}
        <div className="flex-1 overflow-hidden px-4 sm:px-6 py-10 lg:py-14 flex flex-col justify-center gap-6 border-t border-border lg:border-t-0">
          <div className="text-center lg:text-left px-2">
            <p className="text-xs text-gray-500 uppercase tracking-widest font-medium mb-1">Love our Solution</p>
            <h3 className="text-lg font-semibold text-foreground">Businesses love ahna.ae</h3>
          </div>
          <TestimonialsMarquee />
        </div>

      </div>{/* end two-column */}

    </div>
  );
}