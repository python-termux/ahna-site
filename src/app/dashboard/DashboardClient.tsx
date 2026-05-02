"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRateLimit } from "@/lib/use-rate-limit";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeProvider";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut, ExternalLink, Pencil, Check, X, Loader2, Trash2, Plus, Sparkles,
  MoreVertical, AlertTriangle, Type, Palette, Images, Layers, Phone,
  BarChart2, Clock, Share2, Star, Upload, ArrowLeft, ArrowRight, KeyRound, User, Link2,
} from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { useLanguage } from "@/lib/language";

// ─── types ────────────────────────────────────────────────────────────────────
interface Testimonial { author: string; role: string; text: string; rating: number }
interface Hours { [day: string]: string }
interface Social { instagram?: string; facebook?: string; twitter?: string; tiktok?: string; whatsapp?: string }

interface Business {
  id: string; slug: string; name: string; tagline: string; description: string;
  category: string; phone: string; email: string; address: string; website: string;
  hero_image: string; gallery: string[]; about_image: string; hours: Hours; services: { title: string; description: string }[];
  testimonials: Testimonial[]; social: Social; theme_color: string; corner_radius: string;
  stat_years: string; stat_clients: string; stat_projects: string;
}

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const DAYS_AR: Record<string, string> = {
  Monday: "الاثنين", Tuesday: "الثلاثاء", Wednesday: "الأربعاء",
  Thursday: "الخميس", Friday: "الجمعة", Saturday: "السبت", Sunday: "الأحد",
};
const ACCENT_THEMES = ["indigo","violet","rose","orange","emerald","sky","amber"];

const NAV = [
  { id: "branding",  icon: Type      },
  { id: "theme",     icon: Palette   },
  { id: "images",    icon: Images    },
  { id: "services",  icon: Layers    },
  { id: "contact",   icon: Phone     },
  { id: "stats",     icon: BarChart2 },
  { id: "hours",     icon: Clock     },
  { id: "social",    icon: Share2    },
  { id: "reviews",   icon: Star      },
  { id: "account",   icon: User      },
] as const;

const NAV_LABELS: Record<string, { en: string; ar: string }> = {
  branding: { en: "Branding",  ar: "العلامة التجارية" },
  theme:    { en: "Theme",     ar: "المظهر"           },
  images:   { en: "Images",    ar: "الصور"            },
  services: { en: "Services",  ar: "الخدمات"          },
  contact:  { en: "Contact",   ar: "التواصل"          },
  stats:    { en: "Stats",     ar: "الإحصائيات"       },
  hours:    { en: "Hours",     ar: "أوقات العمل"      },
  social:   { en: "Social",    ar: "التواصل الاجتماعي"},
  reviews:  { en: "Reviews",   ar: "التقييمات"        },
  account:  { en: "Account",   ar: "الحساب"           },
};

const NAV_DESCS: Record<string, { en: string; ar: string }> = {
  branding: { en: "Name, tagline & description",  ar: "الاسم والشعار والوصف"           },
  theme:    { en: "Colors and corner style",       ar: "الألوان وشكل الزوايا"          },
  images:   { en: "Gallery & about photo",         ar: "المعرض وصورة من نحن"           },
  services: { en: "What you offer",               ar: "الخدمات التي تقدمها"            },
  contact:  { en: "Phone, email & address",       ar: "الهاتف والبريد والعنوان"        },
  stats:    { en: "Years, reviews & rating",      ar: "السنوات والتقييمات والتصنيف"    },
  hours:    { en: "Opening times",                ar: "أوقات العمل"                    },
  social:   { en: "Instagram, Facebook & more",   ar: "إنستغرام وفيسبوك وغيره"        },
  reviews:  { en: "Google reviews",              ar: "تقييمات غوغل"                   },
  account:  { en: "Password & danger zone",       ar: "كلمة المرور والإعدادات الحساسة"},
};

// ─── Dynamic section label based on category ─────────────────────────────────
function getSectionMeta(category: string) {
  const c = (category ?? "").toLowerCase();
  if (/restaurant|cafe|coffee|pizza|bakery|food|dining|burger|sushi|مطعم|كافيه|مقهى|بيتزا|شاورما|فلافل/.test(c)) {
    return {
      en: { label: "Menu",      desc: "Dishes, drinks & offerings",     item: "item",    addItem: "Add item",     noItems: "No menu items yet",     noItemsDesc: "Add your menu items so customers know what you serve." },
      ar: { label: "قائمة الطعام", desc: "الأطباق والمشروبات",          item: "عنصر",   addItem: "إضافة عنصر",   noItems: "لم تتم إضافة عناصر بعد", noItemsDesc: "أضف عناصر قائمتك لإعلام العملاء بما تقدمه." },
    };
  }
  if (/retail|shop|store|boutique|fashion|clothing|market|pharmacy|متجر|بقالة|صيدلية|ملابس/.test(c)) {
    return {
      en: { label: "Products",  desc: "Items you sell",                  item: "product", addItem: "Add product",  noItems: "No products added yet",  noItemsDesc: "Add your products so customers know what you sell." },
      ar: { label: "المنتجات", desc: "المنتجات المعروضة",                item: "منتج",   addItem: "إضافة منتج",   noItems: "لم تتم إضافة منتجات بعد", noItemsDesc: "أضف منتجاتك لإعلام العملاء بما تعرضه." },
    };
  }
  if (/hotel|resort|motel|accommodation|فندق|منتجع|شقق/.test(c)) {
    return {
      en: { label: "Amenities", desc: "Rooms & facilities",              item: "amenity", addItem: "Add amenity",  noItems: "No amenities added yet", noItemsDesc: "Add your rooms and facilities." },
      ar: { label: "المرافق",  desc: "الغرف والمرافق",                  item: "مرفق",   addItem: "إضافة مرفق",   noItems: "لم تتم إضافة مرافق بعد", noItemsDesc: "أضف غرفك ومرافقك." },
    };
  }
  return {
    en: { label: "Services",  desc: "What you offer",                   item: "service", addItem: "Add service",  noItems: "No services added yet",  noItemsDesc: "Add your services so customers know what you offer." },
    ar: { label: "الخدمات",  desc: "الخدمات التي تقدمها",               item: "خدمة",   addItem: "إضافة خدمة",   noItems: "لم تتم إضافة خدمات بعد", noItemsDesc: "أضف خدماتك لإعلام العملاء بما تقدمه." },
  };
}

// ─── Page completion percentage ───────────────────────────────────────────────
function calcCompletion(data: Business): number {
  const checks = [
    (data.name?.trim().length ?? 0) > 0,
    (data.tagline?.trim().length ?? 0) >= 250,
    (data.description?.trim().length ?? 0) >= 350,
    (data.gallery?.length ?? 0) > 0,
    (data.about_image?.trim().length ?? 0) > 0,
    (data.services?.length ?? 0) > 0,
    (data.phone?.trim().length ?? 0) > 0,
    (data.email?.trim().length ?? 0) > 0,
    Object.values(data.hours ?? {}).some((v) => (v as string)?.trim()),
    Object.values(data.social ?? {}).some((v) => (v as string)?.trim()),
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function LangToggle() {
  const { lang, setLang } = useLanguage();
  return (
    <button
      onClick={() => setLang(lang === "en" ? "ar" : "en")}
      className="px-2.5 py-1 text-xs font-semibold border border-border rounded-[6px] text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
    >
      {lang === "en" ? "AR" : "EN"}
    </button>
  );
}

// ─── main component ────────────────────────────────────────────────────────────
export default function DashboardClient({ user, businesses }: {
  user: User; businesses: Business[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const [activeBiz, setActiveBiz] = useState<Business | null>(
    businesses.length === 1 ? businesses[0] : null
  );

  async function logout() {
    await supabase.auth.signOut();
    toast.success(isAr ? "تم تسجيل الخروج" : "Logged out");
    window.location.href = `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "syrflow.com"}`;
  }

  // If active or any imported biz still has a temp slug, show the slug setup screen
  const tmpBiz = activeBiz?.slug.startsWith("_tmp_")
    ? activeBiz
    : businesses.find((b) => b.slug.startsWith("_tmp_")) ?? null;

  if (tmpBiz) {
    return (
      <SlugSetupScreen
        biz={tmpBiz}
        onComplete={() => { setActiveBiz(null); router.refresh(); }}
      />
    );
  }

  if (activeBiz) {
    return (
      <EditForm
        biz={activeBiz}
        userEmail={user.email ?? ""}
        onBack={businesses.length > 1 ? () => setActiveBiz(null) : undefined}
        onLogout={logout}
      />
    );
  }

  return (
    <motion.div
      dir={isAr ? "rtl" : "ltr"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-background text-foreground"
    >
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        dir="ltr"
        className="border-b border-border px-6 py-4 flex items-center justify-between max-w-6xl mx-auto"
      >
        <span className="font-bold text-lg">syrflow.com</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden sm:block">{user.email}</span>
          <LangToggle />
          <ThemeToggle />
          <button onClick={logout} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <LogOut size={15} /> {isAr ? "خروج" : "Log out"}
          </button>
        </div>
      </motion.header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl font-bold mb-8"
        >
          {isAr ? "صفحاتك" : "Your pages"}
        </motion.h1>

        {businesses.length === 0 ? (
          <NoPagesState />
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } } }}
            className="flex flex-col gap-3"
          >
            {businesses.map((b) => (
              <motion.div
                key={b.id}
                variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } }}
                className="flex items-center justify-between bg-card border border-border hover:border-border/60 rounded-[6px] px-5 py-4 transition-colors"
              >
                <div>
                  <p className="font-medium">{b.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{b.slug}.{process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "syrflow.com"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveBiz(b)}
                    className="flex items-center gap-1.5 text-xs text-[#0066cc] hover:opacity-70 border border-[#0066cc]/30 rounded-[4px] px-3 py-1.5 transition-colors"
                  >
                    <Pencil size={12} /> {isAr ? "تعديل" : "Edit"}
                  </button>
                  <Link
                    href={`https://${b.slug}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "syrflow.com"}`}
                    target="_blank"
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border rounded-[4px] px-3 py-1.5 transition-colors"
                  >
                    {isAr ? "عرض" : "View"} <ExternalLink size={12} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </motion.div>
  );
}

// ─── NO PAGES STATE ───────────────────────────────────────────────────────────
function NoPagesState() {
  const router = useRouter();
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const [mapsUrl, setMapsUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function importBusiness() {
    if (!mapsUrl.trim()) return;
    setLoading(true);
    const res = await fetch("/api/places", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mapsUrl: mapsUrl.trim() }),
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) { toast.error(json.error ?? (isAr ? "فشل استيراد النشاط التجاري" : "Failed to import business")); return; }
    toast.success(isAr ? "تم استيراد النشاط التجاري!" : "Business imported!");
    router.refresh();
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
      className="flex flex-col items-center gap-6 py-16 max-w-md mx-auto text-center"
    >
      <div className="w-14 h-14 rounded-[8px] bg-secondary flex items-center justify-center">
        <Plus size={24} className="text-muted-foreground" />
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-1">{isAr ? "لا توجد صفحات أعمال بعد" : "No business pages yet"}</h2>
        <p className="text-sm text-muted-foreground">{isAr ? "الصق رابط Google Maps أدناه لاستيراد بيانات نشاطك التجاري." : "Paste your Google Maps link below to import your business."}</p>
      </div>
      <div className="w-full flex gap-2">
        <input
          value={mapsUrl}
          onChange={(e) => setMapsUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && importBusiness()}
          placeholder="https://maps.app.goo.gl/..."
          className="flex-1 bg-secondary border border-border rounded-[6px] px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none focus:border-[#0066cc]"
        />
        <button
          onClick={importBusiness}
          disabled={loading || !mapsUrl.trim()}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0066cc] hover:opacity-90 disabled:opacity-50 text-white text-sm font-medium rounded-[6px] transition-colors whitespace-nowrap"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : (isAr ? "استيراد" : "Import")}
        </button>
      </div>

      <button
        onClick={() => { setDeleteModal(true); setDeleteConfirm(""); }}
        className="text-xs text-red-400 hover:text-red-300 transition-colors mt-4"
      >
        {isAr ? "حذف حسابي" : "Delete my account"}
      </button>

      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm bg-card border border-border rounded-[6px] p-6 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-[4px] bg-red-950 flex items-center justify-center shrink-0">
                <AlertTriangle size={16} className="text-red-400" />
              </div>
              <h3 className="font-semibold text-foreground">{isAr ? "حذف الحساب؟" : "Delete account?"}</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {isAr
                ? <>سيؤدي هذا إلى حذف حسابك بشكل دائم. اكتب <span className="font-mono font-semibold text-foreground">DELETE</span> للتأكيد.</>
                : <>This permanently removes your account. Type <span className="font-mono font-semibold text-foreground">DELETE</span> to confirm.</>
              }
            </p>
            <input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="DELETE"
              className="w-full bg-secondary border border-border rounded-[6px] px-3 py-2.5 text-sm text-foreground mb-4 focus:outline-none focus:border-red-500"
            />
            <div className="flex gap-3">
              <button onClick={() => setDeleteModal(false)}
                className="flex-1 px-4 py-2.5 rounded-[4px] border border-border text-sm text-foreground transition-colors"
              >{isAr ? "إلغاء" : "Cancel"}</button>
              <button
                disabled={deleteConfirm !== "DELETE" || deleteLoading}
                onClick={async () => {
                  setDeleteLoading(true);
                  const res = await fetch("/api/delete-account", { method: "DELETE" });
                  if (!res.ok) {
                    const json = await res.json().catch(() => ({}));
                    toast.error(json.error ?? (isAr ? "فشل حذف الحساب" : "Failed to delete account"));
                    setDeleteLoading(false);
                    return;
                  }
                  const supabase = (await import("@/lib/supabase/client")).createClient();
                  await supabase.auth.signOut();
                  toast.success(isAr ? "تم حذف الحساب." : "Account deleted.");
                  window.location.href = `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "syrflow.com"}`;
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-[4px] bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
              >
                {deleteLoading ? <Loader2 size={14} className="animate-spin" /> : <><Trash2 size={14} /> {isAr ? "حذف" : "Delete"}</>}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

// ─── EDIT FORM ────────────────────────────────────────────────────────────────
function EditForm({ biz, userEmail, onBack, onLogout }: {
  biz: Business;
  userEmail: string;
  onBack?: () => void;
  onLogout: () => void;
}) {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const [data, setData] = useState<Business>({ ...biz });
  const savedSnapshot = useRef(JSON.stringify(biz));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [active, setActive] = useState<string>("branding");
  const [mobileView, setMobileView] = useState<"list" | "section">("list");
  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({});
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [discardModal, setDiscardModal] = useState<{ onConfirm: () => void } | null>(null);
  const { isLimited, label: rlLabel, handle429 } = useRateLimit();

  const isDirty = JSON.stringify(data) !== savedSnapshot.current;

  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (isDirty) { e.preventDefault(); }
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  function tryBack() {
    if (!onBack) return;
    if (isDirty) setDiscardModal({ onConfirm: onBack });
    else onBack();
  }

  function update(k: keyof Business, v: unknown) { setData((d) => ({ ...d, [k]: v })); }

  async function resetPassword() {
    setResetLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    setResetLoading(false);
    if (error) toast.error(isAr ? "فشل إرسال رابط إعادة التعيين" : "Failed to send reset link");
    else toast.success(isAr ? "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني" : "Password reset link sent to your email");
  }

  async function deleteR2Image(url: string) {
    if (!url.startsWith(process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "https://pub-90d3e7f40c0c4f5d8a8289b088e8d7f7.r2.dev")) return;
    await fetch("/api/delete-image", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url }) });
  }

  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const aboutInputRef = useRef<HTMLInputElement>(null);
  const [aboutUploading, setAboutUploading] = useState(false);

  async function handleAboutUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];
    setAboutUploading(true);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type, size: file.size }),
      });
      if (!res.ok) { const err = await res.json(); toast.error(err.error ?? "Upload failed"); return; }
      const { presignedUrl, publicUrl } = await res.json();
      const putRes = await fetch(presignedUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      if (!putRes.ok) { toast.error(`Upload failed (${putRes.status})`); return; }
      if (data.about_image) deleteR2Image(data.about_image);
      update("about_image", publicUrl);
    } catch (e) {
      toast.error(`Upload error: ${e instanceof Error ? e.message : "unknown"}`);
    } finally {
      setAboutUploading(false);
    }
  }

  const R2_BASE = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "https://pub-90d3e7f40c0c4f5d8a8289b088e8d7f7.r2.dev";
  const uploadedImageCount = data.gallery.filter((u) => u.startsWith(R2_BASE)).length;

  async function handleGalleryUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    if (uploadedImageCount >= 5) {
      toast.error(isAr ? "الحد الأقصى 5 صور مرفوعة — احذف صورة لرفع أخرى" : "Max 5 uploaded images — delete one to upload a new one");
      return;
    }
    setGalleryUploading(true);
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      if (uploadedImageCount + uploaded.length >= 5) break;
      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: file.name, contentType: file.type, size: file.size }),
        });
        if (!res.ok) {
          const err = await res.json();
          toast.error(err.error ?? "Upload failed");
          continue;
        }
        const { presignedUrl, publicUrl } = await res.json();
        const putRes = await fetch(presignedUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
        if (!putRes.ok) {
          toast.error(`Failed to upload ${file.name} (${putRes.status})`);
          continue;
        }
        uploaded.push(publicUrl);
      } catch (e) {
        toast.error(`Upload error: ${e instanceof Error ? e.message : "unknown"}`);
      }
    }
    if (uploaded.length > 0) update("gallery", [...data.gallery, ...uploaded]);
    setGalleryUploading(false);
  }

  async function fillWithAI(key: string, field: string, context: Record<string, string>) {
    setAiLoading((s) => ({ ...s, [key]: true }));
    try {
      const res = await fetch("/api/ai-fill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field, context }),
      });
      const json = await res.json();
      if (res.status === 429) {
        handle429(json.retryAfter ?? 60);
        toast.error(isAr ? `محاولات كثيرة — انتظر ${rlLabel}` : `AI rate limited — wait ${rlLabel}`);
        return;
      }
      if (!res.ok) { toast.error(json.error ?? "AI failed"); return; }
      return json.value as string;
    } catch {
      toast.error(isAr ? "فشل الاتصال بالخادم" : "Request failed");
    } finally {
      setAiLoading((s) => ({ ...s, [key]: false }));
    }
  }

  async function save() {
    if (data.tagline && data.tagline.length < 250) {
      toast.error(isAr ? `الشعار قصير جداً — الحد الأدنى 250 حرفاً (حالياً ${data.tagline.length})` : `Tagline too short — min 250 chars (currently ${data.tagline.length})`);
      setActive("branding"); return;
    }
    if (data.tagline && data.tagline.length > 300) {
      toast.error(isAr ? `الشعار طويل جداً — الحد الأقصى 300 حرفاً (حالياً ${data.tagline.length})` : `Tagline too long — max 300 chars (currently ${data.tagline.length})`);
      setActive("branding"); return;
    }
    if (data.description && data.description.length < 350) {
      toast.error(isAr ? `الوصف قصير جداً — الحد الأدنى 350 حرفاً (حالياً ${data.description.length})` : `Description too short — min 350 chars (currently ${data.description.length})`);
      setActive("branding"); return;
    }
    if (data.description && data.description.length > 400) {
      toast.error(isAr ? `الوصف طويل جداً — الحد الأقصى 400 حرفاً (حالياً ${data.description.length})` : `Description too long — max 400 chars (currently ${data.description.length})`);
      setActive("branding"); return;
    }
    for (let i = 0; i < data.services.length; i++) {
      const svc = data.services[i];
      if (svc.description && svc.description.length < 150) {
        toast.error(isAr ? `وصف الخدمة "${svc.title || `#${i + 1}`}" يجب أن يكون 150 حرفاً بالضبط` : `Service "${svc.title || `#${i + 1}`}" description must be exactly 150 chars`);
        setActive("services"); return;
      }
      if (svc.description && svc.description.length > 150) {
        toast.error(isAr ? `وصف الخدمة "${svc.title || `#${i + 1}`}" يجب أن يكون 150 حرفاً بالضبط` : `Service "${svc.title || `#${i + 1}`}" description must be exactly 150 chars`);
        setActive("services"); return;
      }
    }
    setSaving(true); setSaved(false);
    const id = toast.loading(isAr ? "جارٍ الحفظ…" : "Saving changes…");
    const res = await fetch("/api/business", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    setSaving(false);
    if (res.status === 429) {
      handle429(json.retryAfter ?? 60);
      toast.error(isAr ? `محاولات كثيرة — انتظر ${rlLabel}` : `Too many saves — wait ${rlLabel}`, { id });
    } else if (!res.ok) {
      toast.error(json.error ?? (isAr ? "فشل الحفظ" : "Failed to save"), { id });
    } else {
      toast.success(isAr ? "تم حفظ التغييرات!" : "Changes saved!", { id });
      savedSnapshot.current = JSON.stringify(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  }

  const isLight = data.theme_color === "white" || data.theme_color.startsWith("white-");
  const currentAccent = data.theme_color.startsWith("white-")
    ? data.theme_color.slice(6)
    : data.theme_color === "white" ? "indigo" : (data.theme_color || "indigo");

  const sectionMeta = getSectionMeta(data.category);
  const sectionLang = sectionMeta[isAr ? "ar" : "en"];
  const completion = calcCompletion(data);

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="min-h-screen bg-background text-foreground">

      {/* ── Sticky header ── */}
      <header dir="ltr" className="sticky top-0 z-30 bg-background border-b border-border md:border-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between md:border-b md:border-border">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile: section view — back to card list */}
            {mobileView === "section" && (
              <button
                onClick={() => setMobileView("list")}
                className="md:hidden flex items-center gap-1.5 text-sm font-semibold text-foreground truncate max-w-[200px]"
              >
                {isAr ? <ArrowRight size={16} className="shrink-0" /> : <ArrowLeft size={16} className="shrink-0" />}
                {active === "services" ? sectionLang.label : NAV_LABELS[active]?.[isAr ? "ar" : "en"]}
              </button>
            )}
            {/* Desktop + mobile list view — business name */}
            <div className={`flex items-center gap-3 ${mobileView === "section" ? "hidden md:flex" : "flex"}`}>
              {onBack && (
                <button onClick={tryBack} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X size={18} />
                </button>
              )}
              <span className="text-sm font-semibold truncate max-w-[200px] text-foreground">{data.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Desktop completion indicator */}
            <div className="hidden md:flex items-center gap-2 me-1">
              <div className="w-16 bg-secondary rounded-full h-1.5 overflow-hidden">
                <div className="h-full rounded-full bg-[#0066cc] transition-all duration-500" style={{ width: `${completion}%` }} />
              </div>
              <span className="text-xs text-muted-foreground font-medium">{completion}%</span>
            </div>
            <Tooltip tip={isAr ? "تبديل لغة لوحة التحكم" : "Switch dashboard language"} side="bottom">
              <LangToggle />
            </Tooltip>
            <Tooltip tip={isAr ? "تبديل الوضع الفاتح/الداكن" : "Toggle light/dark mode"} side="bottom">
              <ThemeToggle />
            </Tooltip>
            <AnimatePresence>
              {(isDirty || isLimited) && (
                <motion.button
                  key="save-btn"
                  initial={{ opacity: 0, scale: 0.85, x: 10 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.85, x: 10 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  onClick={save}
                  disabled={saving || isLimited}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-[#0066cc] hover:opacity-90 disabled:opacity-60 text-white text-sm font-medium transition-colors"
                >
                  {saving && <Loader2 size={13} className="animate-spin" />}
                  {saving ? (isAr ? "جارٍ الحفظ…" : "Saving…") : isLimited ? rlLabel : (isAr ? "حفظ" : "Save")}
                </motion.button>
              )}
            </AnimatePresence>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="p-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  <MoreVertical size={18} />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content align="end" sideOffset={8}
                  className="z-50 w-52 bg-card border border-border rounded-[6px] shadow-2xl overflow-hidden">
                  <div dir={isAr ? "rtl" : "ltr"}>
                  <div className="p-2 flex flex-col gap-0.5">
                    <DropdownMenu.Item asChild>
                      <Link href={`https://${data.slug}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "syrflow.com"}`} target="_blank"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-[6px] text-sm font-medium text-foreground hover:bg-secondary transition-colors cursor-pointer outline-none">
                        <ExternalLink size={15} className="shrink-0" /> {isAr ? "معاينة الموقع" : "Preview site"}
                      </Link>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item asChild onSelect={(e) => e.preventDefault()}>
                      <button
                        onClick={() => {
                          const url = `https://${data.slug}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "syrflow.com"}`;
                          navigator.clipboard.writeText(url).then(() => {
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          });
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[6px] text-sm font-medium text-foreground hover:bg-secondary transition-colors cursor-pointer outline-none"
                      >
                        {copied ? <Check size={15} className="shrink-0 text-emerald-500" /> : <Link2 size={15} className="shrink-0" />}
                        {copied ? (isAr ? "تم النسخ!" : "Copied!") : (isAr ? "نسخ الرابط" : "Copy link")}
                      </button>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item asChild>
                      <button onClick={save} disabled={saving}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[6px] text-sm font-medium text-foreground hover:bg-secondary transition-colors cursor-pointer outline-none disabled:opacity-50">
                        {saving ? <Loader2 size={15} className="animate-spin shrink-0" /> : <Check size={15} className="shrink-0" />}
                        {saving ? (isAr ? "جارٍ الحفظ…" : "Saving…") : saved ? (isAr ? "تم الحفظ!" : "Saved!") : (isAr ? "حفظ التغييرات" : "Save changes")}
                      </button>
                    </DropdownMenu.Item>
                  </div>
                  <div className="border-t border-border p-2">
                    <DropdownMenu.Item asChild>
                      <button onClick={onLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[6px] text-sm font-medium text-red-400 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer outline-none">
                        <LogOut size={15} className="shrink-0" /> {isAr ? "تسجيل الخروج" : "Log out"}
                      </button>
                    </DropdownMenu.Item>
                  </div>
                  </div>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </div>
      </header>

      {/* ── Mobile card grid (list view) ── */}
      {mobileView === "list" && (
        <div className="md:hidden px-4 pt-5 pb-24">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4 px-1">
            {isAr ? "الإعدادات" : "Settings"}
          </p>
          <div className="grid grid-cols-2 gap-3">
            {NAV.map(({ id, icon: Icon }) => (
              <button
                key={id}
                onClick={() => { setActive(id); setMobileView("section"); }}
                className={`bg-card border rounded-[8px] p-4 text-start flex flex-col gap-3 transition-all active:scale-[0.97] ${
                  id === "account"
                    ? "border-red-500/20 hover:border-red-500/40"
                    : "border-border hover:border-border/60"
                }`}
              >
                <div className={`w-9 h-9 rounded-[6px] flex items-center justify-center ${
                  id === "account" ? "bg-red-500/10" : "bg-[#0066cc]/10"
                }`}>
                  <Icon size={18} className={id === "account" ? "text-red-400" : "text-[#0066cc]"} />
                </div>
                <div>
                  <p className={`font-semibold text-sm ${id === "account" ? "text-red-400" : "text-foreground"}`}>
                    {id === "services" ? sectionLang.label : NAV_LABELS[id][isAr ? "ar" : "en"]}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                    {id === "services" ? sectionLang.desc : NAV_DESCS[id][isAr ? "ar" : "en"]}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Two-column body ── */}
      <div className={`max-w-6xl mx-auto flex px-4 sm:px-6 py-6 sm:py-8 pb-24 md:pb-8 gap-6 lg:gap-10 ${mobileView === "list" ? "hidden md:flex" : "flex"}`}>

        {/* ── Sidebar (desktop) ── */}
        <aside className="hidden md:block w-44 shrink-0">
          <nav className="sticky top-[calc(3.5rem+1px)] flex flex-col gap-0.5 pt-2">
            {NAV.map(({ id, icon: Icon }) => (
              <Tooltip key={id} tip={NAV_DESCS[id][isAr ? "ar" : "en"]} side="right">
                <button onClick={() => setActive(id)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[6px] text-sm transition-colors text-start w-full ${
                    active === id
                      ? id === "account"
                        ? "bg-red-500/10 text-red-400 font-medium"
                        : "bg-secondary text-foreground font-medium"
                      : id === "account"
                        ? "text-red-400/70 hover:text-red-400 hover:bg-red-500/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`}
                >
                  <Icon size={15} className="shrink-0" />{id === "services" ? sectionLang.label : NAV_LABELS[id][isAr ? "ar" : "en"]}
                </button>
              </Tooltip>
            ))}
          </nav>
        </aside>

        {/* ── Content ── */}
        <main className="flex-1 min-w-0">
          <div className="w-full max-w-2xl flex flex-col gap-5">

            {/* BRANDING */}
            {active === "branding" && <>
              <Field label={isAr ? "اسم النشاط التجاري" : "Business name"} value={data.name} onChange={(v) => update("name", v)} maxLength={20} placeholder={isAr ? "اسم نشاطك التجاري" : "Your business name"}
                hint={isAr ? "يظهر في أعلى صفحتك (حد أقصى 20 حرفاً)" : "Displayed at the top of your site (max 20 chars)"} />
              <Field
                label={isAr ? "الشعار" : "Tagline"}
                value={data.tagline}
                onChange={(v) => update("tagline", v)}
                placeholder={isAr ? "مثال: أفضل بيتزا في المدينة منذ 1998" : "e.g. Best pizza in town since 1998"}
                maxLength={300} minLength={250}
                aiLoading={aiLoading["tagline"]}
                onAI={async () => { const v = await fillWithAI("tagline", "tagline", { name: data.name, category: data.category }); if (v) update("tagline", v); }}
                hint={isAr ? "جملة جذابة تحت الاسم — بين 250 و300 حرف" : "Catchy one-liner below your name — 250 to 300 chars"}
              />
              <TextareaField
                label={isAr ? "وصف النشاط" : "About description"}
                value={data.description}
                onChange={(v) => update("description", v)}
                maxLength={400} minLength={350}
                aiLoading={aiLoading["description"]}
                onAI={async () => { const v = await fillWithAI("description", "description", { name: data.name, category: data.category, tagline: data.tagline }); if (v) update("description", v); }}
                hint={isAr ? "فقرة قسم 'من نحن' — بين 350 و400 حرف" : "Your About section paragraph — 350 to 400 chars"}
              />
              <div>
                <label className="block text-sm text-foreground mb-1.5">{isAr ? "الفئة" : "Category"}</label>
                <div className="w-full bg-secondary/50 border border-border/40 rounded-[6px] px-3 py-2.5 text-sm text-muted-foreground cursor-not-allowed select-none">{data.category || "—"}</div>
                <p className="text-[10px] text-muted-foreground mt-1">{isAr ? "محدد تلقائياً من Google · لا يمكن تغييره" : "Auto-set from Google Places · cannot be changed"}</p>
              </div>
            </>}

            {/* THEME */}
            {active === "theme" && <>
              <div>
                <p className="text-sm text-foreground mb-2 font-medium">{isAr ? "المظهر" : "Mode"}</p>
                <div className="flex gap-2">
                  <button type="button" onClick={() => update("theme_color", `white-${currentAccent}`)}
                    className={`px-5 py-2 rounded-[6px] text-sm font-medium border transition-all ${isLight ? "bg-white text-gray-900 border-white shadow-sm" : "text-muted-foreground border-border hover:border-gray-500"}`}>
                    {isAr ? "فاتح" : "Light"}
                  </button>
                  <button type="button" onClick={() => update("theme_color", currentAccent)}
                    className={`px-5 py-2 rounded-[6px] text-sm font-medium border transition-all ${!isLight ? "bg-secondary text-foreground border-gray-600" : "text-muted-foreground border-border hover:border-gray-500"}`}>
                    {isAr ? "داكن" : "Dark"}
                  </button>
                </div>
              </div>
              <div>
                <p className="text-sm text-foreground mb-2 font-medium">{isAr ? "لون التمييز" : "Accent colour"}</p>
                <div className="flex gap-2.5 flex-wrap">
                  {ACCENT_THEMES.map((t) => (
                    <button key={t} type="button"
                      onClick={() => update("theme_color", isLight ? `white-${t}` : t)}
                      title={t.charAt(0).toUpperCase() + t.slice(1)}
                      className={`relative w-9 h-9 rounded-[6px] border-2 transition-all flex items-center justify-center bg-${t}-600 ${currentAccent === t ? "border-white ring-2 ring-white/30 scale-110" : "border-transparent hover:border-white/30"}`}
                    >
                      {currentAccent === t && <Check size={14} className="text-white drop-shadow" strokeWidth={3} />}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-foreground mb-2 font-medium">{isAr ? "استدارة الزوايا" : "Corner roundness"}</p>
                <div className="flex gap-2">
                  {([
                    { value: "none" as const, label: isAr ? "حاد"    : "Sharp",   radius: "0px" },
                    { value: "md"   as const, label: isAr ? "مدور"   : "Rounded", radius: "8px" },
                    { value: "pill" as const, label: isAr ? "كبسولي" : "Pill",    radius: "9999px" },
                  ]).map(({ value, label, radius }) => {
                    const selected = (data.corner_radius || "md") === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => update("corner_radius", value)}
                        className={`px-5 py-2 text-sm font-medium border transition-all ${selected ? "border-[#0066cc] bg-[#0066cc]/10 text-[#0066cc]" : "border-border text-muted-foreground hover:border-border/70"}`}
                        style={{ borderRadius: radius }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>}

            {/* IMAGES */}
            {active === "images" && <>
              {/* Gallery */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-foreground font-medium">
                    {isAr ? "المعرض" : "Gallery"} <span className="text-muted-foreground font-normal">({data.gallery.length} {isAr ? "صور" : "images"})</span>
                  </p>
                  <input ref={galleryInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple className="hidden" onChange={(e) => handleGalleryUpload(e.target.files)} />
                  <Tooltip tip={isAr ? "حتى 5 صور مرفوعة (JPEG, PNG, WebP)" : "Up to 5 uploaded images — JPEG, PNG or WebP"} side="bottom">
                    <button
                      onClick={() => galleryInputRef.current?.click()}
                      disabled={galleryUploading || uploadedImageCount >= 5}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#0066cc] hover:bg-[#0071e3] disabled:opacity-50 text-white rounded-[6px] transition-colors"
                    >
                      {galleryUploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                      {galleryUploading ? (isAr ? "جارٍ الرفع…" : "Uploading…") : (isAr ? "رفع" : "Upload")}
                    </button>
                  </Tooltip>
                </div>
                {uploadedImageCount >= 5 && (
                  <p className="text-xs text-amber-500 mb-2">{isAr ? "وصلت لحد الرفع (5 صور) — احذف صورة لرفع أخرى." : "Upload limit reached (5) — delete one to upload a new one."}</p>
                )}
                {data.gallery.length === 0 && !galleryUploading ? (
                  <p className="text-sm text-muted-foreground">{isAr ? "لا توجد صور في المعرض." : "No gallery images."}</p>
                ) : (
                  <div className="grid grid-cols-5 gap-1.5">
                    {data.gallery.map((url, i) => (
                      <div key={i} className="relative w-full aspect-square rounded-[6px] overflow-hidden bg-accent flex flex-col">
                        <button
                          onClick={() => update("about_image", url)}
                          className="absolute inset-x-0 top-0 py-1 bg-[#0066cc]/90 text-white text-[9px] font-semibold z-10"
                        >
                          {isAr ? "من نحن" : "About Us"}
                        </button>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`gallery ${i + 1}`} className="w-full h-full object-cover" />
                        <button
                          onClick={() => { deleteR2Image(url); update("gallery", data.gallery.filter((_, idx) => idx !== i)); }}
                          className="absolute inset-x-0 bottom-0 py-1 bg-red-600/90 text-white text-[9px] font-semibold z-10"
                        >
                          {isAr ? "حذف" : "Delete"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* About Us image */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-foreground font-medium">{isAr ? "صورة من نحن" : "About Us image"}</p>
                  <input ref={aboutInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(e) => handleAboutUpload(e.target.files)} />
                  <Tooltip tip={isAr ? "صورة قسم 'من نحن' في موقعك" : "Photo shown in your About Us section"} side="bottom">
                    <button
                      onClick={() => aboutInputRef.current?.click()}
                      disabled={aboutUploading}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#0066cc] hover:bg-[#0071e3] disabled:opacity-50 text-white rounded-[6px] transition-colors"
                    >
                      {aboutUploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                      {aboutUploading ? (isAr ? "جارٍ الرفع…" : "Uploading…") : (isAr ? "رفع صورة" : "Upload image")}
                    </button>
                  </Tooltip>
                </div>
                {data.about_image ? (
                  <div className="relative w-full h-36 rounded-[6px] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={data.about_image} alt="about" className="w-full h-full object-cover" />
                    <button
                      onClick={() => { deleteR2Image(data.about_image); update("about_image", ""); }}
                      className="absolute inset-x-0 bottom-0 py-1.5 bg-red-600/90 text-white text-xs font-semibold"
                    >
                      {isAr ? "حذف" : "Delete"}
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">{isAr ? "لا توجد صورة. ارفع إحداها أعلاه." : "No about image. Upload one above."}</p>
                )}
              </div>
            </>}

            {/* SERVICES */}
            {active === "services" && (
              <ServicesEditor
                value={data.services}
                onChange={(v) => update("services", v)}
                bizName={data.name}
                bizCategory={data.category}
                sectionLang={sectionLang}
                aiLoading={aiLoading}
                onFillAI={fillWithAI}
              />
            )}

            {/* CONTACT */}
            {active === "contact" && (
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label={isAr ? "الهاتف" : "Phone"} value={data.phone} onChange={(v) => update("phone", v)} placeholder="+1 234 567 8900"
                  hint={isAr ? "يظهر كزر اتصال مباشر في موقعك" : "Shown as a tap-to-call button on your site"} />
                <Field label={isAr ? "البريد الإلكتروني" : "Email"} value={data.email} onChange={(v) => update("email", v)} placeholder="hello@yourbusiness.com"
                  hint={isAr ? "بريد التواصل المعروض في موقعك" : "Contact email displayed on your site"} />
                <div>
                  <label className="text-sm text-foreground block mb-1.5">{isAr ? "العنوان" : "Address"}</label>
                  <div className="w-full bg-secondary/50 border border-border/40 rounded-[6px] px-3 py-2.5 text-sm text-muted-foreground cursor-not-allowed select-none">{data.address || "—"}</div>
                  <p className="text-[10px] text-muted-foreground mt-1">{isAr ? "محدد أثناء التسجيل · لا يمكن تغييره" : "Set during registration · cannot be changed"}</p>
                </div>
                <Field
                  label={<span className="flex items-center gap-1.5"><img src="/social-icons/whatsapp.png" alt="WhatsApp" width={14} height={14} className="object-contain" />WhatsApp</span>}
                  value={(data.social as Record<string, string>).whatsapp ?? ""}
                  onChange={(v) => update("social", { ...data.social, whatsapp: v })}
                  placeholder="+1234567890"
                  hint={isAr ? "يضيف زر دردشة واتساب في موقعك" : "Adds a WhatsApp chat button on your site"}
                />
              </div>
            )}

            {/* STATS */}
            {active === "stats" && (
              <div className="grid sm:grid-cols-3 gap-4">
                <Field label={isAr ? "سنوات في العمل" : "Years in business"} value={data.stat_years} onChange={(v) => update("stat_years", v)} placeholder="e.g. 12+"
                  hint={isAr ? "إحصائية بارزة في موقعك، مثل: 12+" : "Shown as a highlight stat on your site, e.g. 12+"} />
                <div>
                  <label className="text-sm text-foreground block mb-1.5">{isAr ? "العملاء / التقييمات" : "Clients / Reviews"}</label>
                  <div className="w-full bg-secondary/50 border border-border/40 rounded-[6px] px-3 py-2.5 text-sm text-muted-foreground cursor-not-allowed select-none">{data.stat_clients || "—"}</div>
                  <p className="text-[10px] text-muted-foreground mt-1">{isAr ? "مجلوب تلقائياً من Google Places" : "Auto-fetched from Google Places"}</p>
                </div>
                <div>
                  <label className="text-sm text-foreground block mb-1.5">{isAr ? "التقييم" : "Rating"}</label>
                  <div className="w-full bg-secondary/50 border border-border/40 rounded-[6px] px-3 py-2.5 text-sm text-muted-foreground cursor-not-allowed select-none">{data.stat_projects || "—"}</div>
                  <p className="text-[10px] text-muted-foreground mt-1">{isAr ? "مجلوب تلقائياً من Google Places" : "Auto-fetched from Google Places"}</p>
                </div>
              </div>
            )}

            {/* HOURS */}
            {active === "hours" && (
              <div className="flex flex-col gap-3">
                {DAYS.map((day) => (
                  <div key={day} className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground w-24 shrink-0">{isAr ? DAYS_AR[day] : day}</span>
                    <input
                      value={(data.hours as Record<string, string>)[day] ?? ""}
                      onChange={(e) => update("hours", { ...data.hours, [day]: e.target.value })}
                      placeholder={isAr ? "مثال: 09:00 صباحاً – 06:00 مساءً  أو  مغلق" : "e.g. 9:00 AM – 6:00 PM  or  Closed"}
                      className="flex-1 bg-secondary border border-border rounded-[6px] px-3 py-2 text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none focus:border-[#0066cc]"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* SOCIAL */}
            {active === "social" && (
              <div className="grid sm:grid-cols-2 gap-4">
                {(["instagram", "facebook", "twitter", "tiktok"] as const).map((k) => {
                  const iconMap: Record<string, string> = {
                    instagram: "/social-icons/instagram.png",
                    facebook: "/social-icons/facebook.png",
                    twitter: "/social-icons/x.png",
                    tiktok: "/social-icons/tiktok.png",
                  };
                  return (
                    <Field key={k}
                      label={<span className="flex items-center gap-1.5"><img src={iconMap[k]} alt={k} width={14} height={14} className="object-contain" />{k.charAt(0).toUpperCase() + k.slice(1)}</span>}
                      value={(data.social as Record<string, string>)[k] ?? ""}
                      onChange={(v) => update("social", { ...data.social, [k]: v })}
                      placeholder={`https://${k}.com/yourpage`}
                      hint={isAr ? "الرابط الكامل لملفك الشخصي — يظهر كأيقونة في موقعك" : "Full profile URL — shown as an icon link on your site"}
                    />
                  );
                })}
              </div>
            )}

            {/* REVIEWS */}
            {active === "reviews" && (
              <div className="flex flex-col gap-3">
                {data.testimonials.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{isAr ? "لم يتم استيراد أي تقييمات." : "No reviews imported."}</p>
                ) : data.testimonials.map((t, i) => (
                  <motion.div key={i} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="bg-secondary rounded-[6px] p-4 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-foreground">{t.author}</span>
                        <span className="flex gap-0.5">
                          {[1,2,3,4,5].map((n) => <span key={n} className={`text-xs ${n <= t.rating ? "text-yellow-400" : "text-gray-700"}`}>★</span>)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{t.text}</p>
                    </div>
                    <button onClick={() => update("testimonials", data.testimonials.filter((_, idx) => idx !== i))}
                      className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 p-1.5 rounded-[6px] transition-colors shrink-0">
                      <Trash2 size={14} />
                    </button>
                  </motion.div>
                ))}
                <p className="text-xs text-muted-foreground mt-1">{isAr ? "التقييمات مستوردة من Google Maps · لا يمكن تعديلها." : "Reviews imported from Google Maps · cannot be modified."}</p>
              </div>
            )}

            {/* ACCOUNT */}
            {active === "account" && (
              <div className="flex flex-col gap-4">
                {/* Email info */}
                <div className="bg-secondary/50 border border-border/40 rounded-[8px] px-4 py-3 flex items-center gap-2">
                  <User size={14} className="text-muted-foreground shrink-0" />
                  <span className="text-sm text-muted-foreground truncate">{userEmail}</span>
                </div>

                {/* Reset password */}
                <div className="bg-card border border-border rounded-[8px] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-foreground">{isAr ? "إعادة تعيين كلمة المرور" : "Reset password"}</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {isAr ? "سيتم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني" : "A reset link will be sent to your email address"}
                      </p>
                    </div>
                    <button
                      onClick={resetPassword}
                      disabled={resetLoading}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-border rounded-[6px] text-foreground hover:bg-secondary transition-colors whitespace-nowrap disabled:opacity-50 shrink-0"
                    >
                      {resetLoading ? <Loader2 size={12} className="animate-spin" /> : <KeyRound size={12} />}
                      {isAr ? "إرسال رابط" : "Send link"}
                    </button>
                  </div>
                </div>

                {/* Delete account */}
                <div className="bg-card border border-red-500/20 rounded-[8px] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-red-400">{isAr ? "حذف الحساب" : "Delete account"}</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {isAr
                          ? "سيتم حذف حسابك وجميع صفحات أعمالك بشكل نهائي. لا يمكن التراجع عن هذا الإجراء."
                          : "Permanently delete your account and all business pages. This cannot be undone."}
                      </p>
                    </div>
                    <button
                      onClick={() => { setDeleteModal(true); setDeleteConfirm(""); }}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-red-500/30 rounded-[6px] text-red-400 hover:bg-red-500/10 transition-colors whitespace-nowrap shrink-0"
                    >
                      <Trash2 size={12} /> {isAr ? "حذف" : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* ── Unsaved changes modal ── */}
      <AnimatePresence>
        {discardModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }} transition={{ duration: 0.18 }}
              className="w-full max-w-sm bg-card border border-border rounded-[6px] p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-[4px] bg-amber-950/60 flex items-center justify-center shrink-0">
                  <AlertTriangle size={16} className="text-amber-400" />
                </div>
                <h3 className="font-semibold text-foreground">{isAr ? "تغييرات غير محفوظة" : "Unsaved changes"}</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-5">{isAr ? "لديك تغييرات غير محفوظة. هل تريد الحفظ قبل المغادرة أو تجاهلها؟" : "You have unsaved changes. Save before leaving or discard them?"}</p>
              <div className="flex gap-2">
                <button onClick={() => setDiscardModal(null)}
                  className="flex-1 px-3 py-2.5 rounded-[4px] border border-border text-sm text-foreground hover:border-border/60 transition-colors">{isAr ? "البقاء" : "Stay"}</button>
                <button onClick={() => { setDiscardModal(null); discardModal.onConfirm(); }}
                  className="flex-1 px-3 py-2.5 rounded-[4px] border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">{isAr ? "تجاهل" : "Discard"}</button>
                <button onClick={async () => { await save(); setDiscardModal(null); discardModal.onConfirm(); }}
                  className="flex-1 px-3 py-2.5 rounded-[4px] bg-[#0066cc] hover:opacity-90 text-sm font-medium text-white transition-colors">{isAr ? "حفظ والمغادرة" : "Save & leave"}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mobile completion bar (fixed bottom) ── */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-20 bg-background/95 backdrop-blur border-t border-border px-5 py-3 flex items-center gap-3">
        <div className="flex-1 bg-secondary rounded-full h-1.5 overflow-hidden">
          <div className="h-full rounded-full bg-[#0066cc] transition-all duration-500" style={{ width: `${completion}%` }} />
        </div>
        <span className="text-xs font-semibold text-muted-foreground tabular-nums w-10 text-end">{completion}%</span>
        <span className="text-xs text-muted-foreground">{isAr ? "مكتمل" : "complete"}</span>
      </div>

      {/* ── Delete account modal ── */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-card border border-border rounded-[6px] p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-[4px] bg-red-950 flex items-center justify-center shrink-0">
                <AlertTriangle size={18} className="text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{isAr ? "حذف حسابك؟" : "Delete your account?"}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{isAr ? "سيتم حذف جميع بياناتك بشكل دائم." : "This will permanently delete all your data."}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {isAr
                ? <>لا يمكن <strong className="text-foreground">التراجع عن هذا الإجراء</strong>. ستُمحى جميع صفحات أعمالك وبيانات حسابك بشكل نهائي.</>
                : <>This action <strong className="text-foreground">cannot be undone</strong>. All your business pages and account data will be permanently erased.</>
              }
            </p>
            <div className="mb-5">
              <label className="text-xs text-muted-foreground block mb-1.5">
                {isAr ? <>اكتب <span className="font-mono font-semibold text-foreground">DELETE</span> للتأكيد</> : <>Type <span className="font-mono font-semibold text-foreground">DELETE</span> to confirm</>}
              </label>
              <input value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} placeholder="DELETE"
                className="w-full bg-secondary border border-border rounded-[6px] px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none focus:border-red-500 transition-colors" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModal(false)}
                className="flex-1 px-4 py-2.5 rounded-[4px] border border-border text-sm text-foreground hover:border-border/60 transition-colors">{isAr ? "إلغاء" : "Cancel"}</button>
              <button
                disabled={deleteConfirm !== "DELETE" || deleteLoading}
                onClick={async () => {
                  setDeleteLoading(true);
                  const res = await fetch("/api/delete-account", { method: "DELETE" });
                  if (!res.ok) {
                    const json = await res.json().catch(() => ({}));
                    toast.error(json.error ?? (isAr ? "فشل حذف الحساب" : "Failed to delete account"));
                    setDeleteLoading(false);
                    return;
                  }
                  const supabase = (await import("@/lib/supabase/client")).createClient();
                  await supabase.auth.signOut();
                  toast.success(isAr ? "تم حذف الحساب." : "Account deleted.");
                  window.location.href = `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "syrflow.com"}`;
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-[4px] bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
              >
                {deleteLoading ? <Loader2 size={14} className="animate-spin" /> : <><Trash2 size={14} /> {isAr ? "حذف نهائي" : "Delete forever"}</>}
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}

// ─── SLUG SETUP SCREEN ────────────────────────────────────────────────────────
function SlugSetupScreen({ biz, onComplete }: { biz: Business; onComplete: () => void }) {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "syrflow.com";

  const [slug, setSlug] = useState("");
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [availError, setAvailError] = useState("");
  const [saving, setSaving] = useState(false);
  const checkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isValidFormat = /^[a-z0-9]{4,30}$/.test(slug);

  function handleChange(raw: string) {
    const clean = raw.toLowerCase().replace(/[^a-z0-9]/g, "");
    setSlug(clean);
    setAvailable(null);
    setAvailError("");
    if (checkTimer.current) clearTimeout(checkTimer.current);
    if (clean.length >= 4) {
      setChecking(true);
      checkTimer.current = setTimeout(async () => {
        try {
          const res = await fetch(`/api/set-slug?slug=${encodeURIComponent(clean)}`);
          const json = await res.json();
          setAvailable(json.available ?? false);
          setAvailError(json.error ?? "");
        } catch {
          setAvailable(null);
        } finally {
          setChecking(false);
        }
      }, 500);
    } else {
      setChecking(false);
    }
  }

  async function handleSave() {
    if (!isValidFormat || available !== true || saving) return;
    setSaving(true);
    const res = await fetch("/api/set-slug", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId: biz.id, slug }),
    });
    const json = await res.json();
    setSaving(false);
    if (!res.ok) {
      toast.error(json.error ?? (isAr ? "فشل الحفظ" : "Failed to save"));
      if (json.error?.includes("taken")) setAvailable(false);
      return;
    }
    toast.success(isAr ? "تم تعيين رابط موقعك!" : "Site link saved!");
    onComplete();
  }

  const statusNode = (() => {
    if (slug.length === 0) return null;
    if (slug.length < 4) return (
      <span className="text-amber-400 text-xs">
        {isAr ? `الحد الأدنى 4 أحرف (حالياً ${slug.length})` : `Min 4 characters (${slug.length} so far)`}
      </span>
    );
    if (checking) return <span className="text-muted-foreground text-xs">{isAr ? "جارٍ التحقق…" : "Checking…"}</span>;
    if (available === true) return <span className="text-emerald-500 text-xs">{isAr ? "متاح ✓" : "Available ✓"}</span>;
    if (available === false) return (
      <span className="text-red-500 text-xs">
        {availError || (isAr ? "مستخدم بالفعل" : "Already taken")}
      </span>
    );
    return null;
  })();

  const indicatorIcon = (() => {
    if (slug.length < 4) return null;
    if (checking) return <Loader2 size={13} className="animate-spin text-muted-foreground" />;
    if (available === true) return <Check size={13} className="text-emerald-500" strokeWidth={2.5} />;
    if (available === false) return <X size={13} className="text-red-500" strokeWidth={2.5} />;
    return null;
  })();

  return (
    <motion.div
      dir={isAr ? "rtl" : "ltr"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background text-foreground flex flex-col"
    >
      <div className="flex items-center justify-end gap-2 px-6 py-4 border-b border-border">
        <LangToggle />
        <ThemeToggle />
      </div>
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="bg-card border border-border rounded-[6px] p-8">
            <h2 className="text-xl font-semibold mb-1">
              {isAr ? "اختر رابط موقعك" : "Choose your site link"}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              {isAr
                ? "هذا هو العنوان الذي سيصل به العملاء إلى موقعك. لا يمكن تغييره لاحقاً."
                : "This is the address your customers will visit. It cannot be changed later."}
            </p>

            <div className="mb-5">
              <label className="text-sm text-foreground block mb-2">
                {isAr ? "رابط الموقع" : "Site link"}
              </label>
              <div className="flex items-center border border-input rounded-[6px] overflow-hidden focus-within:border-[#0066cc] transition-colors bg-background">
                <input
                  value={slug}
                  onChange={(e) => handleChange(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSave()}
                  placeholder={isAr ? "اسمك" : "yourname"}
                  maxLength={30}
                  autoFocus
                  className="flex-1 bg-transparent px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none min-w-0"
                />
                <div className="flex items-center gap-1.5 px-3 shrink-0 border-s border-input bg-secondary/40">
                  {indicatorIcon}
                  <span className="text-xs text-muted-foreground">.{ROOT_DOMAIN}</span>
                </div>
              </div>
              <div className="mt-1.5 min-h-[18px]">{statusNode}</div>
            </div>

            {slug.length >= 4 && available === true && (
              <div className="mb-5 px-3 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-[6px] text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                {isAr ? `موقعك: ${slug}.${ROOT_DOMAIN}` : `Your site: ${slug}.${ROOT_DOMAIN}`}
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={!isValidFormat || available !== true || saving}
              className="w-full flex items-center justify-center gap-2 bg-[#0066cc] hover:opacity-90 disabled:opacity-40 text-white font-medium py-2.5 rounded-[4px] text-sm transition-colors"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {isAr ? "حفظ الرابط" : "Save link"}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── SERVICES EDITOR ──────────────────────────────────────────────────────────
function ServicesEditor({ value, onChange, bizName, bizCategory, sectionLang, aiLoading, onFillAI }: {
  value: { title: string; description: string }[];
  onChange: (v: { title: string; description: string }[]) => void;
  bizName: string;
  bizCategory: string;
  sectionLang: { label: string; desc: string; item: string; addItem: string; noItems: string; noItemsDesc: string };
  aiLoading: Record<string, boolean>;
  onFillAI: (key: string, field: string, ctx: Record<string, string>) => Promise<string | undefined>;
}) {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  function add() { onChange([...value, { title: "", description: "" }]); }
  function remove(i: number) { onChange(value.filter((_, idx) => idx !== i)); }
  function set(i: number, k: "title" | "description", v: string) {
    onChange(value.map((s, idx) => idx === i ? { ...s, [k]: v } : s));
  }
  return (
    <div className="flex flex-col gap-4">
      {value.length === 0 && (
        <div className="rounded-[6px] border border-dashed border-border px-5 py-8 flex flex-col items-center gap-2 text-center">
          <Layers size={20} className="text-muted-foreground/50" />
          <p className="text-sm font-medium text-foreground">{sectionLang.noItems}</p>
          <p className="text-xs text-muted-foreground">{sectionLang.noItemsDesc}</p>
        </div>
      )}
      {value.map((s, i) => (
        <div key={i} className="bg-secondary rounded-[6px] p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground capitalize">{sectionLang.item} {i + 1}</span>
            <button
              onClick={() => remove(i)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-[6px] px-2 py-1 transition-colors"
            >
              <Trash2 size={12} /> {isAr ? "إزالة" : "Remove"}
            </button>
          </div>
          <Field
            label={isAr ? `اسم ${sectionLang.item}` : `${sectionLang.item.charAt(0).toUpperCase() + sectionLang.item.slice(1)} name`}
            value={s.title}
            onChange={(v) => set(i, "title", v)}
            placeholder={isAr ? "مثال: تصميم ويب" : "e.g. Custom Cakes"}
            maxLength={20}
            hint={isAr ? "عنوان قصير، حد أقصى 20 حرفاً" : "Short title, max 20 chars"}
          />
          <TextareaField
            label={isAr ? "الوصف" : "Description"}
            value={s.description}
            onChange={(v) => set(i, "description", v)}
            placeholder={isAr ? "وصف مختصر..." : "Brief description..."}
            maxLength={150}
            minLength={150}
            hint={isAr ? "وصف من 150 حرفاً بالضبط لهذا العنصر" : "Exactly 150 chars describing this item"}
            aiLoading={aiLoading[`svc_desc_${i}`]}
            onAI={async () => {
              const v = await onFillAI(`svc_desc_${i}`, "service_description", { name: bizName, category: bizCategory, serviceTitle: s.title || "service" });
              if (v) set(i, "description", v);
            }}
          />
        </div>
      ))}
      <button onClick={add} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground bg-secondary hover:bg-secondary/80 border border-border rounded-[6px] px-4 py-2.5 w-fit transition-colors">
        <Plus size={14} /> {sectionLang.addItem}
      </button>
    </div>
  );
}

// ─── TOOLTIP ──────────────────────────────────────────────────────────────────
function Tooltip({ tip, children, side = "top" }: {
  tip: string; children: React.ReactNode; side?: "top" | "bottom" | "right";
}) {
  const [show, setShow] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function open() { if (hideTimer.current) clearTimeout(hideTimer.current); setShow(true); }
  function close() { setShow(false); }
  function toggle() { if (show) { close(); } else { open(); hideTimer.current = setTimeout(close, 2800); } }
  useEffect(() => () => { if (hideTimer.current) clearTimeout(hideTimer.current); }, []);
  const pos = side === "top"
    ? "bottom-full mb-2 left-1/2 -translate-x-1/2"
    : side === "bottom"
    ? "top-full mt-2 left-1/2 -translate-x-1/2"
    : "left-full ms-2 top-1/2 -translate-y-1/2";
  const arrow = side === "top"
    ? "absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"
    : side === "bottom"
    ? "absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-800"
    : "absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-e-gray-800";
  return (
    <span className="relative inline-flex items-center" onMouseEnter={open} onMouseLeave={close} onClick={toggle}>
      {children}
      {show && (
        <span className={`absolute ${pos} z-[9999] px-3 py-2 text-xs font-medium text-white bg-gray-900 border border-white/10 rounded-[6px] pointer-events-none shadow-2xl whitespace-nowrap`}>
          {tip}
          <span className={arrow} />
        </span>
      )}
    </span>
  );
}

function FieldHint({ tip }: { tip: string }) {
  return (
    <Tooltip tip={tip}>
      <span className="inline-flex cursor-help text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors select-none ms-1.5 text-xs">ⓘ</span>
    </Tooltip>
  );
}

// ─── SHARED INPUTS ─────────────────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder, required, maxLength, minLength, onAI, aiLoading, hint }: {
  label: React.ReactNode; value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean; maxLength?: number; minLength?: number;
  onAI?: () => void; aiLoading?: boolean; hint?: string;
}) {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const belowMin = minLength !== undefined && value.length > 0 && value.length < minLength;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm text-foreground flex items-center">{label}{hint && <FieldHint tip={hint} />}</label>
        <div className="flex items-center gap-2">
          {onAI && (
            <button type="button" onClick={onAI} disabled={aiLoading}
              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-[#0066cc] hover:opacity-90 rounded-[4px] px-2.5 py-1 transition-colors disabled:opacity-50">
              {aiLoading ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
              {isAr ? "ملء بالذكاء الاصطناعي" : "AI fill"}
            </button>
          )}
          {maxLength && (
            <span className={`text-[10px] tabular-nums ${belowMin ? "text-amber-400" : "text-muted-foreground"}`}>
              {value.length}/{maxLength}{minLength && belowMin ? ` (min ${minLength})` : ""}
            </span>
          )}
        </div>
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        className="w-full bg-secondary border border-border rounded-[6px] px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none focus:border-[#0066cc]"
      />
    </div>
  );
}

function TextareaField({ label, value, onChange, placeholder, maxLength, minLength, onAI, aiLoading, hint }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; maxLength?: number; minLength?: number;
  onAI?: () => void; aiLoading?: boolean; hint?: string;
}) {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const belowMin = minLength !== undefined && value.length > 0 && value.length < minLength;
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }, [value]);

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm text-foreground flex items-center">{label}{hint && <FieldHint tip={hint} />}</label>
        <div className="flex items-center gap-2">
          {onAI && (
            <button type="button" onClick={onAI} disabled={aiLoading}
              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-[#0066cc] hover:opacity-90 rounded-[4px] px-2.5 py-1 transition-colors disabled:opacity-50">
              {aiLoading ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
              {isAr ? "ملء بالذكاء الاصطناعي" : "AI fill"}
            </button>
          )}
          {maxLength && (
            <span className={`text-[10px] tabular-nums ${belowMin ? "text-amber-400" : "text-muted-foreground"}`}>
              {value.length}/{maxLength}{minLength && belowMin ? ` (min ${minLength})` : ""}
            </span>
          )}
        </div>
      </div>
      <textarea
        ref={taRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={3}
        className="w-full bg-secondary border border-border rounded-[6px] px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none focus:border-[#0066cc] resize-none overflow-hidden"
      />
    </div>
  );
}
