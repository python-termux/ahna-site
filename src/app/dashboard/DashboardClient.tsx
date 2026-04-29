"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut, ExternalLink, ChevronRight,
  Pencil, Check, X, Loader2, Trash2, Plus, Sparkles, MoreVertical, AlertTriangle,
} from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

// ─── types ────────────────────────────────────────────────────────────────────
interface Testimonial { author: string; role: string; text: string; rating: number }
interface Hours { [day: string]: string }
interface Social { instagram?: string; facebook?: string; twitter?: string; tiktok?: string; whatsapp?: string }

interface Business {
  id: string; slug: string; name: string; tagline: string; description: string;
  category: string; phone: string; email: string; address: string; website: string;
  hero_image: string; gallery: string[]; about_image: string; hours: Hours; services: { title: string; description: string }[];
  testimonials: Testimonial[]; social: Social; theme_color: string;
  stat_years: string; stat_clients: string; stat_projects: string;
}

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const ACCENT_THEMES = ["indigo","violet","rose","orange","emerald","sky","amber"];

// ─── main component ────────────────────────────────────────────────────────────
export default function DashboardClient({ user, businesses }: {
  user: User; businesses: Business[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [activeBiz, setActiveBiz] = useState<Business | null>(
    businesses.length === 1 ? businesses[0] : null
  );

  async function logout() {
    await supabase.auth.signOut();
    toast.success("Logged out");
    router.push("/");
  }

  if (activeBiz) {
    return (
      <EditForm
        biz={activeBiz}
        userId={user.id}
        onBack={businesses.length > 1 ? () => setActiveBiz(null) : undefined}
        onLogout={logout}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-background text-foreground"
    >
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="border-b border-border px-6 py-4 flex items-center justify-between max-w-6xl mx-auto"
      >
        <span className="font-bold text-lg">ahna.ae</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden sm:block">{user.email}</span>
          <button onClick={logout} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <LogOut size={15} /> Log out
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
          Your pages
        </motion.h1>

        {businesses.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">No pages found.</div>
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
                  <p className="text-xs text-muted-foreground mt-0.5">/site/{b.slug}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveBiz(b)}
                    className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 border border-indigo-900 rounded-[4px] px-3 py-1.5 transition-colors"
                  >
                    <Pencil size={12} /> Edit
                  </button>
                  <Link
                    href={`/site/${b.slug}`}
                    target="_blank"
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border rounded-[4px] px-3 py-1.5 transition-colors"
                  >
                    View <ExternalLink size={12} />
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

// ─── EDIT FORM ────────────────────────────────────────────────────────────────
function EditForm({ biz, userId, onBack, onLogout }: {
  biz: Business;
  userId: string;
  onBack?: () => void;
  onLogout: () => void;
}) {
  const [data, setData] = useState<Business>({ ...biz });
  const savedSnapshot = useRef(JSON.stringify(biz));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [open, setOpen] = useState<string>("header");
  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({});
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [discardModal, setDiscardModal] = useState<{ onConfirm: () => void } | null>(null);

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
    if (isDirty) {
      setDiscardModal({ onConfirm: onBack });
    } else {
      onBack();
    }
  }

  function update(k: keyof Business, v: unknown) { setData((d) => ({ ...d, [k]: v })); }

  async function fillWithAI(key: string, field: string, context: Record<string, string>) {
    setAiLoading((s) => ({ ...s, [key]: true }));
    try {
      const res = await fetch("/api/ai-fill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field, context }),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error ?? "AI failed"); return; }
      return json.value as string;
    } catch {
      toast.error("AI request failed");
    } finally {
      setAiLoading((s) => ({ ...s, [key]: false }));
    }
  }

  async function save() {
    if (data.tagline && data.tagline.length < 250) {
      toast.error(`Tagline is too short — minimum 250 characters (currently ${data.tagline.length})`);
      setOpen("header"); return;
    }
    if (data.tagline && data.tagline.length > 300) {
      toast.error(`Tagline is too long — maximum 300 characters (currently ${data.tagline.length})`);
      setOpen("header"); return;
    }
    if (data.description && data.description.length < 350) {
      toast.error(`About description is too short — minimum 350 characters (currently ${data.description.length})`);
      setOpen("header"); return;
    }
    if (data.description && data.description.length > 400) {
      toast.error(`About description is too long — maximum 400 characters (currently ${data.description.length})`);
      setOpen("header"); return;
    }
    for (let i = 0; i < data.services.length; i++) {
      const svc = data.services[i];
      if (svc.description && svc.description.length < 150) {
        toast.error(`Service "${svc.title || `#${i + 1}`}" description too short — must be exactly 150 characters (currently ${svc.description.length})`);
        setOpen("services"); return;
      }
      if (svc.description && svc.description.length > 150) {
        toast.error(`Service "${svc.title || `#${i + 1}`}" description too long — must be exactly 150 characters (currently ${svc.description.length})`);
        setOpen("services"); return;
      }
    }

    setSaving(true); setSaved(false);
    const id = toast.loading("Saving changes…");
    const res = await fetch("/api/business", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    setSaving(false);
    if (!res.ok) {
      toast.error(json.error ?? "Failed to save", { id });
    } else {
      toast.success("Changes saved!", { id });
      savedSnapshot.current = JSON.stringify(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  }

  const isLight = data.theme_color === "white" || data.theme_color.startsWith("white-");
  const currentAccent = data.theme_color.startsWith("white-")
    ? data.theme_color.slice(6)
    : data.theme_color === "white" ? "indigo" : (data.theme_color || "indigo");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border px-4 sm:px-6 py-4 bg-background flex items-center justify-between max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-3">
          {onBack ? (
            <button onClick={tryBack} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
          ) : (
            <span className="font-bold text-sm">ahna</span>
          )}
          <span className="font-semibold truncate max-w-[160px] text-sm text-foreground">{data.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <AnimatePresence>
            {isDirty && (
              <motion.button
                key="save-btn"
                initial={{ opacity: 0, scale: 0.85, x: 10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.85, x: 10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                onClick={save}
                disabled={saving}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-sm font-medium transition-colors"
              >
                {saving && <Loader2 size={13} className="animate-spin" />}
                {saving ? "Saving…" : "Save"}
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
              <DropdownMenu.Content
                align="end"
                sideOffset={8}
                className="z-50 w-52 bg-card border border-border rounded-[6px] shadow-2xl overflow-hidden"
              >
                <div className="p-2 flex flex-col gap-0.5">
                  <DropdownMenu.Item asChild>
                    <Link
                      href={`/site/${data.slug}`}
                      target="_blank"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-[6px] text-sm font-medium text-foreground hover:bg-secondary transition-colors cursor-pointer outline-none"
                    >
                      <ExternalLink size={15} className="shrink-0" />
                      Preview site
                    </Link>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item asChild>
                    <button
                      onClick={save}
                      disabled={saving}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[6px] text-sm font-medium text-foreground hover:bg-secondary transition-colors cursor-pointer outline-none disabled:opacity-50"
                    >
                      {saving ? <Loader2 size={15} className="animate-spin shrink-0" /> : <Check size={15} className="shrink-0" />}
                      {saving ? "Saving…" : saved ? "Saved!" : "Save changes"}
                    </button>
                  </DropdownMenu.Item>
                </div>
                <div className="border-t border-border p-2">
                  <DropdownMenu.Item asChild>
                    <button
                      onClick={onLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[6px] text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-colors cursor-pointer outline-none"
                    >
                      <LogOut size={15} className="shrink-0" />
                      Log out
                    </button>
                  </DropdownMenu.Item>
                </div>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex flex-col gap-3">

        {/* ── Header & branding ── */}
        <Section title="Header & branding" id="header" open={open} setOpen={setOpen}>
          <div className="flex flex-col gap-4">
            <Field
              label="Business name (shown in header)"
              value={data.name}
              onChange={(v) => update("name", v)}
              maxLength={20}
              placeholder="Your business name"
            />
            <Field
              label="Tagline"
              value={data.tagline}
              onChange={(v) => update("tagline", v)}
              placeholder="e.g. Best pizza in town since 1998"
              maxLength={300}
              minLength={250}
              aiLoading={aiLoading["tagline"]}
              onAI={async () => {
                const v = await fillWithAI("tagline", "tagline", { name: data.name, category: data.category });
                if (v) update("tagline", v);
              }}
            />
            <TextareaField
              label="About description"
              value={data.description}
              onChange={(v) => update("description", v)}
              maxLength={400}
              minLength={350}
              aiLoading={aiLoading["description"]}
              onAI={async () => {
                const v = await fillWithAI("description", "description", { name: data.name, category: data.category, tagline: data.tagline });
                if (v) update("description", v);
              }}
            />
            <div>
              <label className="block text-sm text-foreground mb-1.5">Category</label>
              <div className="w-full bg-secondary/50 border border-border/40 rounded-[6px] px-3 py-2.5 text-sm text-muted-foreground cursor-not-allowed select-none">
                {data.category || "—"}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Auto-set from Google Places · cannot be changed</p>
            </div>
          </div>
        </Section>

        {/* ── Theme ── */}
        <Section title="Theme" id="theme" open={open} setOpen={setOpen}>
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-sm text-foreground mb-2 font-medium">Mode</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => update("theme_color", `white-${currentAccent}`)}
                  className={`px-5 py-2 rounded-[6px] text-sm font-medium border transition-all ${
                    isLight ? "bg-white text-gray-900 border-white shadow-sm" : "text-muted-foreground border-border hover:border-gray-500"
                  }`}
                >
                  Light
                </button>
                <button
                  type="button"
                  onClick={() => update("theme_color", currentAccent)}
                  className={`px-5 py-2 rounded-[6px] text-sm font-medium border transition-all ${
                    !isLight ? "bg-secondary text-foreground border-gray-600" : "text-muted-foreground border-border hover:border-gray-500"
                  }`}
                >
                  Dark
                </button>
              </div>
            </div>
            <div>
              <p className="text-sm text-foreground mb-2 font-medium">Accent colour</p>
              <div className="flex gap-2.5 flex-wrap">
                {ACCENT_THEMES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => update("theme_color", isLight ? `white-${t}` : t)}
                    title={t.charAt(0).toUpperCase() + t.slice(1)}
                    className={`w-8 h-8 rounded-[6px] border-2 transition-all bg-${t}-600 ${
                      currentAccent === t ? "border-white scale-110 ring-2 ring-white/40" : "border-transparent hover:border-white/40"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* ── Images ── */}
        <Section title="Images" id="images" open={open} setOpen={setOpen}>
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-sm text-foreground mb-3 font-medium">Hero image</p>
              {data.hero_image ? (
                <div className="relative group w-full h-40 rounded-[6px] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={data.hero_image} alt="hero" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => update("hero_image", "")}
                      className="bg-red-600 hover:bg-red-500 text-white rounded-[4px] px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <Trash2 size={12} /> Remove hero image
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-border rounded-[6px] h-40 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <p className="text-sm">No hero image</p>
                  <p className="text-xs">Paste a URL below to set one</p>
                </div>
              )}
              <input
                value={data.hero_image}
                onChange={(e) => update("hero_image", e.target.value)}
                placeholder="https://... paste image URL"
                className="mt-2 w-full bg-secondary border border-border rounded-[6px] px-3 py-2 text-xs text-foreground placeholder-muted-foreground/60 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <p className="text-sm text-foreground mb-3 font-medium">
                Gallery <span className="text-muted-foreground font-normal">({data.gallery.length} images)</span>
              </p>
              {data.gallery.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {data.gallery.map((url, i) => (
                    <div key={i} className="relative group aspect-square rounded-[6px] overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`gallery ${i + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          onClick={() => update("gallery", data.gallery.filter((_, idx) => idx !== i))}
                          className="bg-red-600 hover:bg-red-500 text-white rounded-[4px] p-1.5 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No gallery images.</p>
              )}
            </div>

            <div>
              <p className="text-sm text-foreground mb-3 font-medium">About Us image</p>
              {(() => {
                const allImgs = [data.hero_image, ...(data.gallery ?? [])].filter(Boolean);
                return (
                  <>
                    {allImgs.length > 0 && (
                      <div className="grid grid-cols-4 gap-2 mb-3">
                        {allImgs.map((url, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => update("about_image", url)}
                            className={`relative aspect-square rounded-[6px] overflow-hidden border-2 transition-all ${
                              data.about_image === url ? "border-indigo-500 ring-2 ring-indigo-500/40" : "border-transparent"
                            }`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={url} alt={`img ${i + 1}`} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                    <input
                      value={data.about_image ?? ""}
                      onChange={(e) => update("about_image", e.target.value)}
                      placeholder="Or paste any image URL…"
                      className="w-full bg-secondary border border-border rounded-[6px] px-3 py-2 text-xs text-foreground placeholder-muted-foreground/60 focus:outline-none focus:border-indigo-500"
                    />
                    {data.about_image && (
                      <div className="mt-2 relative group w-full h-32 rounded-[6px] overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={data.about_image} alt="about" className="w-full h-full object-cover" />
                        <button
                          onClick={() => update("about_image", "")}
                          className="absolute top-2 right-2 bg-red-600 hover:bg-red-500 text-white rounded-[4px] px-2 py-1 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </Section>

        {/* ── Reviews ── */}
        <Section title={`Reviews (${data.testimonials.length})`} id="reviews" open={open} setOpen={setOpen}>
          <div className="flex flex-col gap-3">
            {data.testimonials.length === 0 ? (
              <p className="text-sm text-muted-foreground">No reviews imported.</p>
            ) : (
              data.testimonials.map((t, i) => (
                <motion.div
                  key={i}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-secondary rounded-[6px] p-4 flex items-start justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-foreground">{t.author}</span>
                      <span className="flex gap-0.5">
                        {[1,2,3,4,5].map((n) => (
                          <span key={n} className={`text-xs ${n <= t.rating ? "text-yellow-400" : "text-gray-700"}`}>★</span>
                        ))}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{t.text}</p>
                  </div>
                  <button
                    onClick={() => update("testimonials", data.testimonials.filter((_, idx) => idx !== i))}
                    className="text-muted-foreground hover:text-red-400 transition-colors shrink-0"
                  >
                    <Trash2 size={15} />
                  </button>
                </motion.div>
              ))
            )}
            <p className="text-xs text-muted-foreground mt-1">Reviews and ratings are imported from Google Maps at registration and cannot be modified.</p>
          </div>
        </Section>

        {/* ── Contact ── */}
        <Section title="Contact information" id="contact" open={open} setOpen={setOpen}>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Phone" value={data.phone} onChange={(v) => update("phone", v)} placeholder="+1 234 567 8900" />
            <Field label="Email" value={data.email} onChange={(v) => update("email", v)} placeholder="hello@yourbusiness.com" />
            <div>
              <label className="text-sm text-foreground block mb-1.5">Address</label>
              <div className="w-full bg-secondary/50 border border-border/40 rounded-[6px] px-3 py-2.5 text-sm text-muted-foreground cursor-not-allowed select-none">
                {data.address || "—"}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Set during registration · cannot be changed</p>
            </div>
            <Field
              label={<span className="flex items-center gap-1.5"><img src="/social-icons/whatsapp.png" alt="WhatsApp" width={14} height={14} className="object-contain" />WhatsApp</span>}
              value={(data.social as Record<string, string>).whatsapp ?? ""}
              onChange={(v) => update("social", { ...data.social, whatsapp: v })}
              placeholder="+1234567890"
            />
          </div>
        </Section>

        {/* ── Stats ── */}
        <Section title="Stats (hero section)" id="stats" open={open} setOpen={setOpen}>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Years in business" value={data.stat_years} onChange={(v) => update("stat_years", v)} placeholder="e.g. 12+" />
            <div>
              <label className="text-sm text-foreground block mb-1.5">Clients / Reviews</label>
              <div className="w-full bg-secondary/50 border border-border/40 rounded-[6px] px-3 py-2.5 text-sm text-muted-foreground cursor-not-allowed select-none">
                {data.stat_clients || "—"}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Auto-fetched from Google Places</p>
            </div>
            <div>
              <label className="text-sm text-foreground block mb-1.5">Rating</label>
              <div className="w-full bg-secondary/50 border border-border/40 rounded-[6px] px-3 py-2.5 text-sm text-muted-foreground cursor-not-allowed select-none">
                {data.stat_projects || "—"}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Auto-fetched from Google Places</p>
            </div>
          </div>
        </Section>

        {/* ── Opening hours ── */}
        <Section title="Opening hours" id="hours" open={open} setOpen={setOpen}>
          <div className="flex flex-col gap-3">
            {DAYS.map((day) => (
              <div key={day} className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground w-24 shrink-0">{day}</span>
                <input
                  value={(data.hours as Record<string,string>)[day] ?? ""}
                  onChange={(e) => update("hours", { ...data.hours, [day]: e.target.value })}
                  placeholder="9am – 6pm or Closed"
                  className="flex-1 bg-secondary border border-border rounded-[6px] px-3 py-2 text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none focus:border-indigo-500"
                />
              </div>
            ))}
          </div>
        </Section>

        {/* ── Social links ── */}
        <Section title="Social links" id="social" open={open} setOpen={setOpen}>
          <div className="grid sm:grid-cols-2 gap-4">
            {(["instagram","facebook","twitter","tiktok"] as const).map((k) => {
              const iconMap: Record<string, string> = {
                instagram: "/social-icons/instagram.png",
                facebook: "/social-icons/facebook.png",
                twitter: "/social-icons/x.png",
                tiktok: "/social-icons/tiktok.png",
              };
              return (
                <Field
                  key={k}
                  label={
                    <span className="flex items-center gap-1.5">
                      <img src={iconMap[k]} alt={k} width={14} height={14} className="object-contain" />
                      {k.charAt(0).toUpperCase() + k.slice(1)}
                    </span>
                  }
                  value={(data.social as Record<string, string>)[k] ?? ""}
                  onChange={(v) => update("social", { ...data.social, [k]: v })}
                  placeholder={`https://${k}.com/yourpage`}
                />
              );
            })}
          </div>
        </Section>

        {/* ── Services ── */}
        <Section title="Services" id="services" open={open} setOpen={setOpen}>
          <ServicesEditor
            value={data.services}
            onChange={(v) => update("services", v)}
            bizName={data.name}
            bizCategory={data.category}
            aiLoading={aiLoading}
            onFillAI={fillWithAI}
          />
        </Section>

        {/* ── Danger zone ── */}
        <div className="bg-red-950/20 border border-red-900/50 rounded-lg p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-red-400">Delete account</p>
            <p className="text-xs text-muted-foreground mt-0.5">Permanently delete your account and all business data. This cannot be undone.</p>
          </div>
          <button
            onClick={() => { setDeleteModal(true); setDeleteConfirm(""); }}
            className="shrink-0 flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-[4px] text-sm font-medium transition-colors"
          >
            <Trash2 size={14} /> Delete account
          </button>
        </div>

      </main>

      {/* ── Unsaved changes confirm modal ── */}
      <AnimatePresence>
        {discardModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.18 }}
              className="w-full max-w-sm bg-card border border-border rounded-[6px] p-6 shadow-lg"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-[4px] bg-amber-950/60 flex items-center justify-center shrink-0">
                  <AlertTriangle size={16} className="text-amber-400" />
                </div>
                <h3 className="font-semibold text-foreground">Unsaved changes</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-5">
                You have unsaved changes that will be lost. Do you want to save before leaving, or discard?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setDiscardModal(null)}
                  className="flex-1 px-3 py-2.5 rounded-[4px] border border-border text-sm text-foreground hover:border-border/60 transition-colors"
                >
                  Stay
                </button>
                <button
                  onClick={() => { setDiscardModal(null); discardModal.onConfirm(); }}
                  className="flex-1 px-3 py-2.5 rounded-[4px] border border-border text-sm text-muted-foreground hover:text-foreground hover:border-border/60 transition-colors"
                >
                  Discard
                </button>
                <button
                  onClick={async () => { await save(); setDiscardModal(null); discardModal.onConfirm(); }}
                  className="flex-1 px-3 py-2.5 rounded-[4px] bg-indigo-600 hover:bg-indigo-500 text-sm font-medium text-white transition-colors"
                >
                  Save & leave
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Delete account modal ── */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-card border border-border rounded-[6px] p-6 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-[4px] bg-red-950 flex items-center justify-center shrink-0">
                <AlertTriangle size={18} className="text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Delete your account?</h3>
                <p className="text-xs text-muted-foreground mt-0.5">This will permanently delete all your data.</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              This action <strong className="text-foreground">cannot be undone</strong>. All your business pages and account data will be permanently erased.
            </p>

            <div className="mb-5">
              <label className="text-xs text-muted-foreground block mb-1.5">
                Type <span className="font-mono font-semibold text-foreground">DELETE</span> to confirm
              </label>
              <input
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="DELETE"
                className="w-full bg-secondary border border-border rounded-[6px] px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal(false)}
                className="flex-1 px-4 py-2.5 rounded-[4px] border border-border text-sm text-foreground hover:border-border/60 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={deleteConfirm !== "DELETE" || deleteLoading}
                onClick={async () => {
                  setDeleteLoading(true);
                  const supabase = (await import("@/lib/supabase/client")).createClient();
                  await supabase.from("businesses").delete().eq("user_id", userId);
                  const { error } = await supabase.rpc("delete_user");
                  if (error) {
                    toast.error("Failed to delete account. Contact support@ahna.ae");
                    setDeleteLoading(false);
                    return;
                  }
                  await supabase.auth.signOut();
                  toast.success("Account deleted.");
                  onLogout();
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-[4px] bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
              >
                {deleteLoading ? <Loader2 size={14} className="animate-spin" /> : <><Trash2 size={14} /> Delete forever</>}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// ─── SECTION ACCORDION ────────────────────────────────────────────────────────
function Section({ title, id, open, setOpen, children }: {
  title: string; id: string; open: string; setOpen: (v: string) => void; children: React.ReactNode;
}) {
  const isOpen = open === id;
  return (
    <div className="bg-card border border-border rounded-[6px] overflow-hidden">
      <button
        onClick={() => setOpen(isOpen ? "" : id)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-accent/5 transition-colors"
      >
        <span className="font-medium">{title}</span>
        <motion.span animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronRight size={16} className="text-muted-foreground" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
            style={{ overflow: "hidden" }}
          >
            <div className="px-5 pb-5 border-t border-border pt-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── SERVICES EDITOR ──────────────────────────────────────────────────────────
function ServicesEditor({ value, onChange, bizName, bizCategory, aiLoading, onFillAI }: {
  value: { title: string; description: string }[];
  onChange: (v: { title: string; description: string }[]) => void;
  bizName: string;
  bizCategory: string;
  aiLoading: Record<string, boolean>;
  onFillAI: (key: string, field: string, ctx: Record<string, string>) => Promise<string | undefined>;
}) {
  function add() { onChange([...value, { title: "", description: "" }]); }
  function remove(i: number) { onChange(value.filter((_, idx) => idx !== i)); }
  function set(i: number, k: "title" | "description", v: string) {
    onChange(value.map((s, idx) => idx === i ? { ...s, [k]: v } : s));
  }
  return (
    <div className="flex flex-col gap-4">
      {value.map((s, i) => (
        <div key={i} className="bg-secondary rounded-[6px] p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Service {i + 1}</span>
            <button
              onClick={() => remove(i)}
              className="flex items-center gap-1.5 text-xs font-medium bg-red-600 hover:bg-red-500 text-white rounded-[4px] px-2.5 py-1 transition-colors"
            >
              <Trash2 size={11} /> Delete
            </button>
          </div>
          {/* Title — user writes, no AI, max 20 chars */}
          <Field
            label="Service name"
            value={s.title}
            onChange={(v) => set(i, "title", v)}
            placeholder="e.g. Custom Cakes"
            maxLength={20}
          />
          <TextareaField
            label="Description"
            value={s.description}
            onChange={(v) => set(i, "description", v)}
            placeholder="Brief description..."
            maxLength={150}
            minLength={150}
            aiLoading={aiLoading[`svc_desc_${i}`]}
            onAI={async () => {
              const v = await onFillAI(`svc_desc_${i}`, "service_description", { name: bizName, category: bizCategory, serviceTitle: s.title || "service" });
              if (v) set(i, "description", v);
            }}
          />
        </div>
      ))}
      <button onClick={add} className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 border border-indigo-900 rounded-[4px] px-3 py-2 w-fit transition-colors">
        <Plus size={14} /> Add service
      </button>
    </div>
  );
}

// ─── SHARED INPUTS ─────────────────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder, required, maxLength, minLength, onAI, aiLoading }: {
  label: React.ReactNode; value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean; maxLength?: number; minLength?: number;
  onAI?: () => void; aiLoading?: boolean;
}) {
  const belowMin = minLength !== undefined && value.length > 0 && value.length < minLength;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm text-foreground">{label}</label>
        <div className="flex items-center gap-2">
          {onAI && (
            <button
              type="button"
              onClick={onAI}
              disabled={aiLoading}
              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 rounded-[4px] px-2.5 py-1 transition-colors disabled:opacity-50"
            >
              {aiLoading ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
              AI fill
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
        className="w-full bg-secondary border border-border rounded-[6px] px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none focus:border-indigo-500"
      />
    </div>
  );
}

function TextareaField({ label, value, onChange, placeholder, maxLength, minLength, onAI, aiLoading }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; maxLength?: number; minLength?: number;
  onAI?: () => void; aiLoading?: boolean;
}) {
  const belowMin = minLength !== undefined && value.length > 0 && value.length < minLength;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm text-foreground">{label}</label>
        <div className="flex items-center gap-2">
          {onAI && (
            <button
              type="button"
              onClick={onAI}
              disabled={aiLoading}
              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 rounded-[4px] px-2.5 py-1 transition-colors disabled:opacity-50"
            >
              {aiLoading ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
              AI fill
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
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        maxLength={maxLength}
        className="w-full bg-secondary border border-border rounded-[6px] px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none focus:border-indigo-500 resize-none"
      />
    </div>
  );
}
