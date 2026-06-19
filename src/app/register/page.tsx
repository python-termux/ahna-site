"use client";

import { useState, useEffect, useRef } from "react";
import { useRateLimit } from "@/lib/use-rate-limit";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Loader2, Star, Phone, Globe, Eye, EyeOff, Image,
  ChevronRight, Check,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { PlaceResult } from "@/lib/places";
import { useLanguage } from "@/lib/language";
import { ThemeToggle } from "@/components/ThemeProvider";
import { validateGoogleMapsUrl, validateEmail, validatePassword } from "@/lib/validation";

const FB_APP_ID = "1463790922054350";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Window { FB: any; fbAsyncInit: () => void; }
}

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
  posts?: { data: { full_picture?: string }[] };
}

function mapFBToPlace(details: FBPageDetails, page: FBPage): PlaceResult {
  const seen = new Set<string>();
  const images: string[] = [];
  function addImg(src: string | undefined) {
    if (src && !seen.has(src)) { seen.add(src); images.push(src); }
  }
  if (details.cover?.source) addImg(details.cover.source);
  if (details.photos?.data) {
    for (const photo of details.photos.data) {
      addImg(photo.images?.sort((a, b) => b.width - a.width)[0]?.source);
    }
  }
  if (details.posts?.data) {
    for (const post of details.posts.data) { addImg(post.full_picture); }
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
    images: images.slice(0, 30),
    reviews: [],
    hours: {},
    rating: details.overall_star_rating || 0,
    reviewCount: details.rating_count || details.fan_count || 0,
    mapsUrl: "",
  };
}

function strength(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}
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

// Use strict validation from validation library
function isValidGoogleMapsUrl(url: string): boolean {
  const validation = validateGoogleMapsUrl(url);
  return validation.valid;
}

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
    /* dir="ltr" locks the marquee to LTR regardless of page language */
    <div className="flex flex-col gap-4" dir="ltr">
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

function FBIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} className={className}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

// NEW DotMatrix Loading Component replacing the old AILoadingBlock
function DotMatrixLoading({ step, steps, isAr }: { step: number; steps: string[]; isAr: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden mt-2">
      <div className="border border-blue-500/20 dark:border-blue-500/30 rounded-[6px] bg-blue-50/50 dark:bg-blue-950/20 overflow-hidden">
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-blue-500/20 dark:border-blue-500/30 bg-blue-50/80 dark:bg-blue-950/30 min-h-[44px]">
          <motion.span className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex-1" animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 1.5, repeat: Infinity }}>
            {isAr ? "الذكاء الاصطناعي يفكر" : "AI is thinking"}
          </motion.span>
          <div className="flex gap-1.5 shrink-0">
            {[0, 0.2, 0.4].map((d, i) => (
              <motion.span key={i} className="w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: d }} />
            ))}
          </div>
        </div>
        <div className="px-4 py-3 bg-white dark:bg-gray-950">
          <motion.p key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="text-sm text-gray-700 dark:text-gray-300">
            {steps[step]}
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const { isLimited, label: rlLabel, handle429 } = useRateLimit();

  const strengthLabel = isAr
    ? ["قصير جداً", "ضعيفة", "مقبولة", "جيدة", "قوية"]
    : ["Too short", "Weak", "Fair", "Good", "Strong"];

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [source, setSource] = useState<"maps" | "facebook" | null>(null);
  const [place, setPlace] = useState<PlaceResult | null>(null);

  const [mapsUrl, setMapsUrl] = useState("");
  const [fetchError, setFetchError] = useState("");
  const [urlError, setUrlError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [reasoningStep, setReasoningStep] = useState(0);
  const [currentSteps, setCurrentSteps] = useState<string[]>([]);

  const [sdkReady, setSdkReady] = useState(false);
  const [fbSubStep, setFbSubStep] = useState<"connect" | "pages" | "fetching">("connect");
  const [fbPages, setFbPages] = useState<FBPage[]>([]);
  const [fbError, setFbError] = useState("");
  const [fbLoadingPages, setFbLoadingPages] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  // OTP verification in register
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [otpCodes, setOtpCodes] = useState(["", "", "", "", "", ""]);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [otpSentMessage, setOtpSentMessage] = useState("");

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

  const isUrlValid = isValidGoogleMapsUrl(mapsUrl);
  const canFind = !isLoading && mapsUrl.trim().length > 0 && isUrlValid;

  function handleUrlChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setMapsUrl(v);
    setFetchError("");
    setUrlError(v.trim().length > 0 && !isValidGoogleMapsUrl(v)
      ? (isAr ? "أدخل رابط Google Maps صحيح فقط" : "Please enter a valid Google Maps link only")
      : "");
  }

  async function findBusiness() {
    if (!canFind || isLimited) return;
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
      if (res.status === 429) {
        handle429(data.retryAfter ?? 60);
        setFetchError(isAr ? `الرجاء الانتظار ${rlLabel} قبل المحاولة مجدداً` : `Too many requests — try again in ${rlLabel}`);
        return;
      }
      if (!res.ok) { setFetchError(data.error ?? "Could not find that business."); return; }
      setPlace(data as PlaceResult);
      setStep(2);
    } catch {
      setIsLoading(false);
      setFetchError(isAr ? "فشل الاتصال بالخادم" : "Failed to connect to server");
    }
  }

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
        if (res.authResponse) { fetchFBPages(); }
        else { setFbLoadingPages(false); setFbError("Login cancelled or permission denied."); }
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
          setFbPages(res.data); setFbLoadingPages(false); setFbSubStep("pages"); return;
        }
        window.FB.api("/me/businesses", { fields: "id,name" },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (bizRes: any) => {
            if (bizRes.error || !bizRes.data?.length) {
              setFbLoadingPages(false);
              setFbError(isAr ? "لم يتم العثور على صفحات Facebook. تأكد من أنك مسؤول الصفحة." : "No Facebook Pages found. Make sure you are the Admin of a Page.");
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
                      setFbError(isAr ? "لم يتم العثور على صفحات Facebook. تأكد من أنك مسؤول الصفحة." : "No Facebook Pages found. Make sure you are the Admin of a Page.");
                    } else { setFbPages(allPages); setFbSubStep("pages"); }
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
    setFbSubStep("fetching"); setFbError("");
    const animPromise = runLoadingAnimation(fbReasoningPool);
    window.FB.api(
      `/${page.id}`,
      {
        access_token: page.access_token,
        fields: ["id","name","about","description","phone","website","fan_count","overall_star_rating","rating_count","location","cover","picture.type(large)","photos.limit(30){images}","posts.limit(50){full_picture}"].join(","),
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async (res: any) => {
        await animPromise;
        if (res.error) { setFbSubStep("pages"); setFbError(res.error.message); return; }
        const mapped = mapFBToPlace(res as FBPageDetails, page);
        setPlace(mapped); setStep(2);
      }
    );
  }

  const pwStrength = strength(password);
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const pwMatch = password === confirmPw && confirmPw.length > 0;
  const canSubmit = emailValid && pwStrength >= 2 && pwMatch && termsAccepted;

  async function createAccount(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || !place) return;
    setAuthLoading(true);
    setAuthError("");

    // Validate email format
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      setAuthError(emailValidation.error || "Invalid email");
      setAuthLoading(false);
      return;
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setAuthError(passwordValidation.error || "Invalid password");
      setAuthLoading(false);
      return;
    }

    // Create the account directly (no OTP step)
    const { error: authErr } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (authErr) {
      setAuthError(authErr.message);
      setAuthLoading(false);
      return;
    }

    // Create business
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
        testimonials: place.reviews.map((r) => ({
          author: r.author,
          role: "",
          text: r.text,
          rating: r.rating,
        })),
        social: {},
        theme_color: "white-emerald",
        stat_years: "",
        stat_clients: place.reviewCount ? `${place.reviewCount.toLocaleString()}+` : "",
        stat_projects: place.rating ? `${place.rating} ★` : "",
      }),
    });

    if (!bizRes.ok) {
      const d = await bizRes.json();
      setAuthError(d.error ?? "Failed to create business");
      setAuthLoading(false);
      return;
    }

    // Send welcome email (fire-and-forget)
    fetch("/api/auth/welcome-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessName: place.name }),
    }).catch(() => {});

    // Success! Redirect to dashboard
    router.push("/dashboard");
  }

  async function verifyOtpAndCreateAccount() {
    const code = otpCodes.join("");
    if (code.length !== 6 || !place) {
      setOtpError(isAr ? "أدخل جميع الأرقام الستة" : "Enter all 6 digits");
      return;
    }

    setOtpLoading(true);
    setOtpError("");

    try {
      // Verify OTP first
      const verifyRes = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code, purpose: "login" }),
      });

      if (!verifyRes.ok) {
        const data = await verifyRes.json().catch(() => ({}));
        setOtpError(data.error || (isAr ? "رمز غير صحيح" : "Invalid code"));
        setOtpLoading(false);
        return;
      }

      // OTP verified! Now create account and business
      const { error: authErr } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (authErr) {
        setOtpError(authErr.message);
        setOtpLoading(false);
        return;
      }

      // Create business
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
          testimonials: place.reviews.map((r) => ({
            author: r.author,
            role: "",
            text: r.text,
            rating: r.rating,
          })),
          social: {},
          theme_color: "white-emerald",
          stat_years: "",
          stat_clients: place.reviewCount ? `${place.reviewCount.toLocaleString()}+` : "",
          stat_projects: place.rating ? `${place.rating} ★` : "",
        }),
      });

      if (!bizRes.ok) {
        const d = await bizRes.json();
        setOtpError(d.error ?? "Failed to create business");
        setOtpLoading(false);
        return;
      }

      // Send welcome email
      fetch("/api/auth/welcome-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName: place.name }),
      }).catch(() => {});

      // Success! Redirect to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      setOtpError(err.message || (isAr ? "حدث خطأ" : "An error occurred"));
      setOtpLoading(false);
    }
  }

  const handleOtpInputChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newCodes = [...otpCodes];
    newCodes[index] = digit;
    setOtpCodes(newCodes);

    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpCodes[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  async function handleResendOtp() {
    if (resendCountdown > 0) return;
    const otpRes = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), purpose: "login" }),
    });
    if (otpRes.ok) {
      setOtpCodes(["", "", "", "", "", ""]);
      setResendCountdown(60);
      otpInputRefs.current[0]?.focus();
    }
  }

  // Countdown timer for resend
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => {
      setResendCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

  return (
    <>
      <Script src="https://connect.facebook.net/en_US/sdk.js" strategy="afterInteractive" onLoad={initFBSDK} />

      <div className="min-h-screen bg-background text-foreground flex flex-col">

        {/* Progress bar */}
        <div className="w-full flex justify-center">
          <div className="w-full max-w-6xl px-4 sm:px-6">
            <div className="w-full h-0.5 bg-accent rounded-full">
              <motion.div className="h-full bg-[#0071e3] rounded-full"
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

            <Link href={`https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "syrflow.com"}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-foreground transition-colors mb-8">
              {isAr ? "العودة للرئيسية" : "Return to home"}
            </Link>

            <motion.p key={step} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-xs text-gray-500 mb-6 font-medium tracking-widest uppercase">
              {isAr ? `خطوة ${step} من 3` : `Step ${step} of 3`}
            </motion.p>

            <AnimatePresence mode="wait">

              {/* ── STEP 1 ── */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                  <h1 className="text-3xl font-bold mb-2">{isAr ? "ابحث عن نشاطك التجاري" : "Find your business"}</h1>
                  <p className="text-muted-foreground mb-6">{isAr ? "اختر طريقة استيراد بيانات نشاطك التجاري." : "Choose how you want to import your business data."}</p>

                  {!source && (
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <button onClick={() => setSource("maps")} className="flex flex-col items-center gap-3 p-5 bg-card border-2 border-border hover:border-[#0066cc] rounded-xl transition-all text-center group">
                        <div className="w-11 h-11 rounded-xl bg-[#0066cc]/10 flex items-center justify-center group-hover:bg-[#0066cc]/15 transition-colors">
                          <MapPin size={20} style={{ color: "#0066cc" }} />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-foreground">Google Maps</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{isAr ? "الصق رابط Google Maps" : "Paste your Maps link"}</p>
                        </div>
                      </button>

                      <div
                        className="flex flex-col items-center gap-3 p-5 rounded-xl text-center cursor-default select-none relative"
                        style={{ backgroundColor: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.28)" }}
                      >
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(16,185,129,0.12)" }}>
                          <FBIcon size={20} className="text-[#10b981]" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm" style={{ color: "#10b981" }}>Facebook Page</p>
                          <p className="text-[11px] mt-0.5 font-medium" style={{ color: "#10b981" }}>
                            {isAr ? "قريباً" : "Coming Soon"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Google Maps input ── */}
                  {source === "maps" && (
                    <div className="flex flex-col gap-3">
                      <button onClick={() => setSource(null)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-foreground transition-colors mb-1">
                        {isAr ? "تغيير المصدر" : "Change source"}
                      </button>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-lg bg-[#0066cc]/10 flex items-center justify-center">
                          <MapPin size={13} style={{ color: "#0066cc" }} />
                        </div>
                        <span className="text-sm font-medium">Google Maps</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {isAr
                          ? <>افتح Google Maps، ابحث عن نشاطك، انقر <strong className="text-foreground">Share → Copy link</strong> والصق أدناه.</>
                          : <>Open Google Maps, search your business, click <strong className="text-foreground">Share → Copy link</strong> and paste below.</>
                        }
                      </p>
                      {fetchError && (
                        <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3">
                          {fetchError}
                        </div>
                      )}
                      <div>
                        <label className="block text-sm text-gray-300 mb-1.5">{isAr ? "رابط Google Maps" : "Google Maps link"}</label>
                        <div className="flex gap-2">
                          <input
                            value={mapsUrl}
                            onChange={handleUrlChange}
                            onKeyDown={(e) => e.key === "Enter" && canFind && findBusiness()}
                            placeholder="https://maps.app.goo.gl/your-business-link"
                            className={`flex-1 bg-background border rounded-lg px-4 py-3 text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none focus:border-[#0066cc] transition-colors ${urlError ? "border-red-500" : "border-input"}`}
                          />
                          <button onClick={findBusiness} disabled={!canFind || isLimited}
                            className={`px-5 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${canFind && !isLimited ? "bg-[#0066cc] hover:bg-[#0071e3] text-white" : "bg-accent opacity-50 cursor-not-allowed"}`}>
                            {isLoading ? <Loader2 size={16} className="animate-spin" /> : isLimited ? rlLabel : (isAr ? "بحث" : "Find")}
                          </button>
                        </div>
                        {urlError && <p className="text-xs text-red-400 mt-1">{urlError}</p>}
                        <p className="text-xs text-gray-500 mt-2">
                          {isAr ? "يُقبل روابط Google Maps فقط. مثال: https://maps.app.goo.gl/..." : "Only Google Maps links accepted. Example: https://maps.app.goo.gl/..."}
                        </p>
                      </div>
                      <AnimatePresence mode="wait">
                        {isLoading && currentSteps.length > 0 && <DotMatrixLoading step={reasoningStep} steps={currentSteps} isAr={isAr} />}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* ── Facebook flow ── */}
                  {source === "facebook" && (
                    <div className="flex flex-col gap-3">
                      <button onClick={() => { setSource(null); setFbSubStep("connect"); setFbPages([]); setFbError(""); }} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-foreground transition-colors mb-1">
                        {isAr ? "تغيير المصدر" : "Change source"}
                      </button>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-lg bg-[#1877F2]/10 flex items-center justify-center">
                          <FBIcon size={13} className="text-[#1877F2]" />
                        </div>
                        <span className="text-sm font-medium">Facebook Page</span>
                      </div>
                      {fbError && (
                        <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3">
                          {fbError}
                        </div>
                      )}
                      {fbSubStep === "connect" && (
                        <button onClick={handleFBLogin} disabled={fbLoadingPages}
                          className="flex items-center justify-center gap-2.5 bg-[#1877F2] hover:bg-[#166FE5] disabled:opacity-50 text-white font-semibold py-3.5 rounded-lg transition-colors">
                          {(fbLoadingPages || !sdkReady) ? <Loader2 size={16} className="animate-spin" /> : <FBIcon size={16} />}
                          {fbLoadingPages
                            ? (isAr ? "جارٍ الاتصال…" : "Connecting…")
                            : !sdkReady
                            ? (isAr ? "جارٍ التحميل…" : "Loading…")
                            : (isAr ? "ربط بـ Facebook" : "Connect with Facebook")}
                        </button>
                      )}
                      {fbSubStep === "pages" && fbPages.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground mb-1">{isAr ? "اختر صفحتك التجارية:" : "Select your business page:"}</p>
                          {fbPages.map((page) => (
                            <button key={page.id} onClick={() => selectFBPage(page)}
                              className="w-full flex items-center gap-3 bg-card hover:bg-accent border border-border hover:border-border/70 rounded-xl p-3.5 text-left transition-all">
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
                      {fbSubStep === "fetching" && (
                        <AnimatePresence>
                          <DotMatrixLoading step={reasoningStep} steps={currentSteps} isAr={isAr} />
                        </AnimatePresence>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── STEP 2 ── */}
              {step === 2 && place && (
                <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                  <h1 className="text-3xl font-bold mb-2">{isAr ? "هل هذا نشاطك التجاري؟" : "Is this your business?"}</h1>
                  <p className="text-muted-foreground mb-6">{isAr ? "تأكد من أن هذه القائمة الصحيحة قبل إعداد صفحتك." : "Confirm this is the correct listing before we set up your page."}</p>

                  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="bg-card border border-border rounded-lg overflow-hidden mb-6">
                    <div className="pt-4 px-4"><ImageSlider images={place.images} /></div>
                    <div className="p-4 pt-3">
                      <div className="flex items-center gap-1.5 mb-2">
                        {source === "facebook" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-[4px] bg-[#1877F2]/10 text-[#1877F2]">
                            <FBIcon size={10} /> Facebook Page
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-[4px] bg-[#0066cc]/10 text-[#0066cc]">
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
                              <span className="text-xs text-muted-foreground">{place.reviewCount.toLocaleString()} {source === "facebook" ? (isAr ? "متابع" : "followers") : (isAr ? "تقييم" : "reviews")}</span>
                            </>
                          )}
                        </div>
                      )}
                      {place.reviews?.length > 0 && <ReviewsSlider reviews={place.reviews} />}
                      <div className="flex items-center gap-4 py-2.5 px-3 bg-accent/50 rounded-lg mb-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Star size={11} className="text-yellow-400 fill-yellow-400" />
                          <span><span className="text-foreground font-semibold">{place.reviewCount?.toLocaleString() ?? 0}</span> {source === "facebook" ? (isAr ? "متابع" : "followers") : (isAr ? "تقييم" : "reviews")}</span>
                        </div>
                        <div className="w-px h-3 bg-border" />
                        <div className="flex items-center gap-1.5">
                          <Image size={11} className="text-[#0066cc] dark:text-[#2997ff]" />
                          <span><span className="text-foreground font-semibold">{place.images?.length ?? 0}</span> {isAr ? "صورة" : "photos"}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5 text-xs text-muted-foreground border-t border-border pt-3 mt-1">
                        {place.address && <div className="flex items-start gap-2"><MapPin size={12} className="text-muted-foreground mt-0.5 shrink-0" /><span>{place.address}</span></div>}
                        {place.phone && <div className="flex items-center gap-2"><Phone size={12} className="text-muted-foreground shrink-0" /><span>{place.phone}</span></div>}
                        {place.website && <div className="flex items-center gap-2"><Globe size={12} className="text-muted-foreground shrink-0" /><span className="truncate">{place.website.replace(/^https?:\/\//, "")}</span></div>}
                      </div>
                    </div>
                  </motion.div>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => setStep(3)}
                      className="bg-[#0066cc] hover:bg-[#0071e3] text-white py-3.5 rounded-lg font-medium transition-colors">
                      {isAr ? "نعم، هذا نشاطي التجاري" : "Yes, this is my business"}
                    </button>
                    <button onClick={() => { setStep(1); setPlace(null); setFetchError(""); setMapsUrl(""); setUrlError(""); setFbSubStep("connect"); setFbPages([]); setFbError(""); }}
                      className="border border-input hover:border-border text-muted-foreground hover:text-foreground py-3.5 rounded-lg font-medium transition-colors">
                      {isAr ? "ليس نشاطي، البحث مجدداً" : "Not my business, search again"}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 3 ── */}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                  <AnimatePresence mode="wait">
                    {!showOtpVerification ? (
                      <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                        <h1 className="text-3xl font-bold mb-2">{isAr ? "إنشاء حسابك" : "Create your account"}</h1>
                        <p className="text-muted-foreground mb-8">{isAr ? "اكتمل تقريباً. أعدّ بيانات تسجيل الدخول." : "Almost done. Set up your login details."}</p>

                        {authError && (
                          <div className="mb-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3">
                            {authError}
                          </div>
                        )}

                        <form onSubmit={createAccount} className="flex flex-col gap-5">
                          <div>
                            <label className="block text-sm text-muted-foreground mb-1.5">{isAr ? "البريد الإلكتروني" : "Email address"}</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                              placeholder={isAr ? "you@example.com" : "you@example.com"} required
                              className={`w-full bg-background border rounded-lg px-4 py-3 text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none transition-colors ${email.length > 0 ? (emailValid ? "border-green-600 dark:border-green-700" : "border-red-500") : "border-input focus:border-[#0066cc]"}`}
                            />
                            {email.length > 0 && !emailValid && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{isAr ? "أدخل بريداً إلكترونياً صحيحاً" : "Enter a valid email address"}</p>}
                          </div>

                          <div>
                            <label className="block text-sm text-muted-foreground mb-1.5">{isAr ? "كلمة المرور" : "Password"}</label>
                            <div className="relative">
                              <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                                placeholder={isAr ? "8 أحرف على الأقل" : "At least 8 characters"} required
                                className="w-full bg-background border border-input rounded-lg px-4 py-3 pr-11 text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none focus:border-[#0066cc] transition-colors"
                              />
                              <button type="button" onClick={() => setShowPw((v) => !v)}
                                className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
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
                            <label className="block text-sm text-muted-foreground mb-1.5">{isAr ? "تأكيد كلمة المرور" : "Confirm password"}</label>
                            <div className="relative">
                              <input type={showConfirmPw ? "text" : "password"} value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)}
                                placeholder={isAr ? "كرّر كلمة المرور" : "Repeat your password"} required
                                className={`w-full bg-background border rounded-lg px-4 py-3 pr-11 text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none transition-colors ${confirmPw.length > 0 ? (pwMatch ? "border-green-600 dark:border-green-700" : "border-red-500") : "border-input focus:border-[#0066cc]"}`}
                              />
                              <button type="button" onClick={() => setShowConfirmPw((v) => !v)}
                                className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                                {showConfirmPw ? <EyeOff size={17} /> : <Eye size={17} />}
                              </button>
                            </div>
                            {confirmPw.length > 0 && !pwMatch && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{isAr ? "كلمتا المرور غير متطابقتين" : "Passwords do not match"}</p>}
                          </div>

                          <div className="flex items-start gap-2.5 mb-2">
                            <input
                              type="checkbox"
                              id="terms"
                              checked={termsAccepted}
                              onChange={(e) => setTermsAccepted(e.target.checked)}
                              className="w-4 h-4 mt-0.5 rounded border-gray-300 text-[#0066cc] focus:ring-[#0066cc] cursor-pointer"
                            />
                            <label htmlFor="terms" className="text-xs text-muted-foreground leading-snug cursor-pointer hover:text-foreground transition-colors">
                              {isAr ? (
                                <>بإنشاء حساب، توافق على{" "}<Link href="/terms" className="underline hover:text-foreground font-medium text-foreground">شروط الخدمة</Link> و<Link href="/privacy-policy" className="underline hover:text-foreground font-medium text-foreground">سياسة الخصوصية</Link>.</>
                              ) : (
                                <>By creating an account you agree to our{" "}<Link href="/terms" className="underline hover:text-foreground font-medium text-foreground">Terms</Link> and{" "}<Link href="/privacy-policy" className="underline hover:text-foreground font-medium text-foreground">Privacy Policy</Link>.</>
                              )}
                            </label>
                          </div>
                          {!termsAccepted && <p className="text-xs text-red-600 dark:text-red-400 mb-4">{isAr ? "يجب قبول الشروط والأحكام" : "You must accept the Terms and Privacy Policy"}</p>}

                          <button type="submit" disabled={authLoading || !canSubmit}
                            className="flex items-center justify-center gap-2 bg-[#0066cc] hover:bg-[#0071e3] disabled:opacity-50 py-3.5 rounded-lg font-medium transition-colors text-white">
                            {authLoading ? <Loader2 size={16} className="animate-spin" /> : (isAr ? "إنشاء الحساب" : "Create account")}
                          </button>
                        </form>

                        <button onClick={() => setStep(2)} className="flex items-center justify-center gap-1.5 text-xs text-gray-500 hover:text-gray-400 mt-4 w-full transition-colors">
                          {isAr ? "العودة لمعاينة النشاط" : "Back to business preview"}
                        </button>
                      </motion.div>
                    ) : (
                      <motion.div key="otp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                        <h1 className="text-3xl font-bold mb-2">{isAr ? "تحقق من بريدك" : "Verify your email"}</h1>
                        <p className="text-muted-foreground mb-8">{isAr ? `أدخل الرمز المرسل إلى ${email}` : `Enter the 6-digit code sent to ${email}`}</p>

                        {otpSentMessage && (
                          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mb-6 p-3 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
                            <Check size={18} className="text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                            <p className="text-green-700 dark:text-green-300 text-sm">{otpSentMessage}</p>
                          </motion.div>
                        )}

                        <div className="flex gap-2 mb-6">
                          {otpCodes.map((code, index) => (
                            <input
                              key={index}
                              ref={(el) => {
                                otpInputRefs.current[index] = el;
                              }}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={code}
                              onChange={(e) => handleOtpInputChange(index, e.target.value)}
                              onKeyDown={(e) => handleOtpKeyDown(index, e)}
                              placeholder="0"
                              disabled={otpLoading}
                              className="w-12 h-12 text-center text-2xl font-bold border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                            />
                          ))}
                        </div>

                        {otpError && (
                          <div className="mb-6 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-red-600 dark:text-red-400 text-sm text-center mb-3">{otpError}</p>
                            <button
                              onClick={handleResendOtp}
                              disabled={otpLoading}
                              className="w-full text-[#0066cc] hover:text-[#0071e3] disabled:text-gray-400 font-medium text-sm transition-colors"
                            >
                              {isAr ? "طلب رمز جديد" : "Request new code"}
                            </button>
                          </div>
                        )}

                        <button
                          onClick={verifyOtpAndCreateAccount}
                          disabled={otpLoading || otpCodes.join("").length !== 6}
                          className="w-full px-4 py-3 bg-[#0066cc] hover:bg-[#0071e3] disabled:opacity-50 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          {otpLoading ? <Loader2 size={16} className="animate-spin" /> : (isAr ? "تحقق والإنشاء" : "Verify & Create")}
                        </button>

                        <div className="mt-6 text-center">
                          <button
                            onClick={handleResendOtp}
                            disabled={resendCountdown > 0 || otpLoading}
                            className="text-[#0066cc] hover:text-[#0071e3] disabled:text-gray-400 font-medium text-sm transition-colors"
                          >
                            {resendCountdown > 0
                              ? `${isAr ? "إعادة الإرسال خلال" : "Resend in"} ${resendCountdown}s`
                              : isAr
                                ? "إعادة الإرسال"
                                : "Resend code"}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
          </div>

          {/* Marquee column */}
          <div className="flex-1 overflow-hidden px-4 sm:px-6 py-10 lg:py-14 flex flex-col justify-center gap-6 border-t border-border lg:border-t-0">
            <div className="text-center lg:text-left px-2">
              <p className="text-xs text-gray-500 uppercase tracking-widest font-medium mb-1">
                {isAr ? "يحبون حلنا" : "Love our Solution"}
              </p>
              <h3 className="text-lg font-semibold text-foreground">
                {isAr ? "الشركات تحب syrflow.com" : "Businesses love syrflow.com"}
              </h3>
            </div>
            <TestimonialsMarquee />
          </div>

        </div>
      </div>

      <div className="fixed bottom-5 right-5 z-50">
        <ThemeToggle />
      </div>
    </>
  );
}