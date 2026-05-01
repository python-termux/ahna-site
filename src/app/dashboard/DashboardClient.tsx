"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut, ExternalLink, Pencil, Check, X, Loader2, Trash2, Plus, Sparkles,
  MoreVertical, AlertTriangle, Type, Palette, Images, Layers, Phone,
  BarChart2, Clock, Share2, Star, Upload,
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
  testimonials: Testimonial[]; social: Social; theme_color: string; corner_radius: string;
  stat_years: string; stat_clients: string; stat_projects: string;
}

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const ACCENT_THEMES = ["indigo","violet","rose","orange","emerald","sky","amber"];

const NAV = [
  { id: "branding",  label: "Branding",  icon: Type      },
  { id: "theme",     label: "Theme",     icon: Palette   },
  { id: "images",    label: "Images",    icon: Images    },
  { id: "services",  label: "Services",  icon: Layers    },
  { id: "contact",   label: "Contact",   icon: Phone     },
  { id: "stats",     label: "Stats",     icon: BarChart2 },
  { id: "hours",     label: "Hours",     icon: Clock     },
  { id: "social",    label: "Social",    icon: Share2    },
  { id: "reviews",   label: "Reviews",   icon: Star      },
] as const;

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
        <span className="font-bold text-lg">syrflow.com</span>
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
                    <Pencil size={12} /> Edit
                  </button>
                  <Link
                    href={`https://${b.slug}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "syrflow.com"}`}
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

// ─── NO PAGES STATE ───────────────────────────────────────────────────────────
function NoPagesState() {
  const router = useRouter();
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
    if (!res.ok) { toast.error(json.error ?? "Failed to import business"); return; }
    toast.success("Business imported!");
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
        <h2 className="text-lg font-semibold mb-1">No business pages yet</h2>
        <p className="text-sm text-muted-foreground">Paste your Google Maps link below to import your business.</p>
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
          {loading ? <Loader2 size={14} className="animate-spin" /> : "Import"}
        </button>
      </div>

      <button
        onClick={() => { setDeleteModal(true); setDeleteConfirm(""); }}
        className="text-xs text-red-400 hover:text-red-300 transition-colors mt-4"
      >
        Delete my account
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
              <h3 className="font-semibold text-foreground">Delete account?</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              This permanently removes your account. Type <span className="font-mono font-semibold text-foreground">DELETE</span> to confirm.
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
              >Cancel</button>
              <button
                disabled={deleteConfirm !== "DELETE" || deleteLoading}
                onClick={async () => {
                  setDeleteLoading(true);
                  const res = await fetch("/api/delete-account", { method: "DELETE" });
                  if (!res.ok) {
                    const json = await res.json().catch(() => ({}));
                    toast.error(json.error ?? "Failed to delete account");
                    setDeleteLoading(false);
                    return;
                  }
                  const supabase = (await import("@/lib/supabase/client")).createClient();
                  await supabase.auth.signOut();
                  toast.success("Account deleted.");
                  window.location.href = "/";
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-[4px] bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
              >
                {deleteLoading ? <Loader2 size={14} className="animate-spin" /> : <><Trash2 size={14} /> Delete</>}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

// ─── EDIT FORM ────────────────────────────────────────────────────────────────
function EditForm({ biz, onBack, onLogout }: {
  biz: Business;
  onBack?: () => void;
  onLogout: () => void;
}) {
  const [data, setData] = useState<Business>({ ...biz });
  const savedSnapshot = useRef(JSON.stringify(biz));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [active, setActive] = useState<string>("branding");
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
    if (isDirty) setDiscardModal({ onConfirm: onBack });
    else onBack();
  }

  function update(k: keyof Business, v: unknown) { setData((d) => ({ ...d, [k]: v })); }

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

  async function handleGalleryUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setGalleryUploading(true);
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      if (data.gallery.length + uploaded.length >= 30) break;
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
      toast.error(`Tagline too short — min 250 chars (currently ${data.tagline.length})`);
      setActive("branding"); return;
    }
    if (data.tagline && data.tagline.length > 300) {
      toast.error(`Tagline too long — max 300 chars (currently ${data.tagline.length})`);
      setActive("branding"); return;
    }
    if (data.description && data.description.length < 350) {
      toast.error(`Description too short — min 350 chars (currently ${data.description.length})`);
      setActive("branding"); return;
    }
    if (data.description && data.description.length > 400) {
      toast.error(`Description too long — max 400 chars (currently ${data.description.length})`);
      setActive("branding"); return;
    }
    for (let i = 0; i < data.services.length; i++) {
      const svc = data.services[i];
      if (svc.description && svc.description.length < 150) {
        toast.error(`Service "${svc.title || `#${i + 1}`}" description must be exactly 150 chars`);
        setActive("services"); return;
      }
      if (svc.description && svc.description.length > 150) {
        toast.error(`Service "${svc.title || `#${i + 1}`}" description must be exactly 150 chars`);
        setActive("services"); return;
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

      {/* ── Sticky header ── */}
      <header className="sticky top-0 z-30 bg-background border-b border-border md:border-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between md:border-b md:border-border">
          <div className="flex items-center gap-3">
            {onBack ? (
              <button onClick={tryBack} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={18} />
              </button>
            ) : (
              <span className="font-bold text-sm">syrflow</span>
            )}
            <span className="text-sm font-semibold truncate max-w-[180px] text-foreground">{data.name}</span>
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
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-[#0066cc] hover:opacity-90 disabled:opacity-60 text-white text-sm font-medium transition-colors"
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
                <DropdownMenu.Content align="end" sideOffset={8}
                  className="z-50 w-52 bg-card border border-border rounded-[6px] shadow-2xl overflow-hidden">
                  <div className="p-2 flex flex-col gap-0.5">
                    <DropdownMenu.Item asChild>
                      <Link href={`https://${data.slug}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "syrflow.com"}`} target="_blank"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-[6px] text-sm font-medium text-foreground hover:bg-secondary transition-colors cursor-pointer outline-none">
                        <ExternalLink size={15} className="shrink-0" /> Preview site
                      </Link>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item asChild>
                      <button onClick={save} disabled={saving}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[6px] text-sm font-medium text-foreground hover:bg-secondary transition-colors cursor-pointer outline-none disabled:opacity-50">
                        {saving ? <Loader2 size={15} className="animate-spin shrink-0" /> : <Check size={15} className="shrink-0" />}
                        {saving ? "Saving…" : saved ? "Saved!" : "Save changes"}
                      </button>
                    </DropdownMenu.Item>
                  </div>
                  <div className="border-t border-border p-2">
                    <DropdownMenu.Item asChild>
                      <button onClick={onLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[6px] text-sm font-medium text-red-400 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer outline-none">
                        <LogOut size={15} className="shrink-0" /> Log out
                      </button>
                    </DropdownMenu.Item>
                  </div>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </div>
      </header>

      {/* ── Mobile tab strip ── */}
      <div className="md:hidden sticky top-14 z-20 bg-background border-b border-border overflow-x-auto">
        <div className="flex gap-0.5 px-4 sm:px-6 py-1.5 w-max min-w-full">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActive(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-xs whitespace-nowrap transition-colors ${
                active === id ? "bg-secondary text-foreground font-medium" : "text-muted-foreground"
              }`}
            >
              <Icon size={12} />{label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Two-column body ── */}
      <div className="max-w-6xl mx-auto flex px-4 sm:px-6 py-6 sm:py-8 gap-6 lg:gap-10">

        {/* ── Sidebar (desktop) ── */}
        <aside className="hidden md:block w-44 shrink-0">
          <nav className="sticky top-[calc(3.5rem+1px)] flex flex-col gap-0.5 pt-2">
            {NAV.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActive(id)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[6px] text-sm transition-colors text-left w-full ${
                  active === id
                    ? "bg-secondary text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                <Icon size={15} className="shrink-0" />{label}
              </button>
            ))}
            <div className="mt-3 pt-3 border-t border-border">
              <button
                onClick={() => { setDeleteModal(true); setDeleteConfirm(""); }}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-[6px] text-sm text-red-400 hover:text-red-500 hover:bg-red-500/10 w-full transition-colors"
              >
                <Trash2 size={15} className="shrink-0" /> Delete account
              </button>
            </div>
          </nav>
        </aside>

        {/* ── Content ── */}
        <main className="flex-1 min-w-0">
          <div className="w-full max-w-2xl flex flex-col gap-5">

            {/* BRANDING */}
            {active === "branding" && <>
              <Field label="Business name" value={data.name} onChange={(v) => update("name", v)} maxLength={20} placeholder="Your business name" />
              <Field
                label="Tagline"
                value={data.tagline}
                onChange={(v) => update("tagline", v)}
                placeholder="e.g. Best pizza in town since 1998"
                maxLength={300} minLength={250}
                aiLoading={aiLoading["tagline"]}
                onAI={async () => { const v = await fillWithAI("tagline", "tagline", { name: data.name, category: data.category }); if (v) update("tagline", v); }}
              />
              <TextareaField
                label="About description"
                value={data.description}
                onChange={(v) => update("description", v)}
                maxLength={400} minLength={350}
                aiLoading={aiLoading["description"]}
                onAI={async () => { const v = await fillWithAI("description", "description", { name: data.name, category: data.category, tagline: data.tagline }); if (v) update("description", v); }}
              />
              <div>
                <label className="block text-sm text-foreground mb-1.5">Category</label>
                <div className="w-full bg-secondary/50 border border-border/40 rounded-[6px] px-3 py-2.5 text-sm text-muted-foreground cursor-not-allowed select-none">{data.category || "—"}</div>
                <p className="text-[10px] text-muted-foreground mt-1">Auto-set from Google Places · cannot be changed</p>
              </div>
            </>}

            {/* THEME */}
            {active === "theme" && <>
              <div>
                <p className="text-sm text-foreground mb-2 font-medium">Mode</p>
                <div className="flex gap-2">
                  <button type="button" onClick={() => update("theme_color", `white-${currentAccent}`)}
                    className={`px-5 py-2 rounded-[6px] text-sm font-medium border transition-all ${isLight ? "bg-white text-gray-900 border-white shadow-sm" : "text-muted-foreground border-border hover:border-gray-500"}`}>
                    Light
                  </button>
                  <button type="button" onClick={() => update("theme_color", currentAccent)}
                    className={`px-5 py-2 rounded-[6px] text-sm font-medium border transition-all ${!isLight ? "bg-secondary text-foreground border-gray-600" : "text-muted-foreground border-border hover:border-gray-500"}`}>
                    Dark
                  </button>
                </div>
              </div>
              <div>
                <p className="text-sm text-foreground mb-2 font-medium">Accent colour</p>
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
                <p className="text-sm text-foreground mb-2 font-medium">Corner roundness</p>
                <div className="flex gap-2">
                  {([
                    { value: "none", label: "Sharp",   radius: "0px" },
                    { value: "md",   label: "Rounded", radius: "8px" },
                    { value: "pill", label: "Pill",    radius: "9999px" },
                  ] as const).map(({ value, label, radius }) => {
                    const selected = (data.corner_radius || "md") === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => update("corner_radius", value)}
                        className={`flex flex-col items-center gap-1.5 px-4 py-2.5 border transition-all ${selected ? "border-[#0066cc] bg-[#0066cc]/5 text-[#0066cc]" : "border-border text-muted-foreground hover:border-border/70"}`}
                        style={{ borderRadius: "8px" }}
                      >
                        <div
                          className={`w-10 h-6 border-2 ${selected ? "border-[#0066cc]" : "border-current"}`}
                          style={{ borderRadius: radius === "9999px" ? "9999px" : radius }}
                        />
                        <span className="text-xs font-medium">{label}</span>
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
                    Gallery <span className="text-muted-foreground font-normal">({data.gallery.length} images)</span>
                  </p>
                  <input ref={galleryInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple className="hidden" onChange={(e) => handleGalleryUpload(e.target.files)} />
                  <button
                    onClick={() => galleryInputRef.current?.click()}
                    disabled={galleryUploading || data.gallery.length >= 30}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#0066cc] hover:bg-[#0071e3] disabled:opacity-50 text-white rounded-[6px] transition-colors"
                  >
                    {galleryUploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                    {galleryUploading ? "Uploading…" : "Upload"}
                  </button>
                </div>
                {data.gallery.length === 0 && !galleryUploading ? (
                  <p className="text-sm text-muted-foreground">No gallery images.</p>
                ) : (
                  <div className="grid grid-cols-5 gap-1.5">
                    {data.gallery.map((url, i) => (
                      <div key={i} className="relative w-full aspect-square rounded-[6px] overflow-hidden bg-accent flex flex-col">
                        <button
                          onClick={() => update("about_image", url)}
                          className="absolute inset-x-0 top-0 py-1 bg-[#0066cc]/90 text-white text-[9px] font-semibold z-10"
                        >
                          About Us
                        </button>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`gallery ${i + 1}`} className="w-full h-full object-cover" />
                        <button
                          onClick={() => { deleteR2Image(url); update("gallery", data.gallery.filter((_, idx) => idx !== i)); }}
                          className="absolute inset-x-0 bottom-0 py-1 bg-red-600/90 text-white text-[9px] font-semibold z-10"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* About Us image */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-foreground font-medium">About Us image</p>
                  <input ref={aboutInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(e) => handleAboutUpload(e.target.files)} />
                  <button
                    onClick={() => aboutInputRef.current?.click()}
                    disabled={aboutUploading}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#0066cc] hover:bg-[#0071e3] disabled:opacity-50 text-white rounded-[6px] transition-colors"
                  >
                    {aboutUploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                    {aboutUploading ? "Uploading…" : "Upload image"}
                  </button>
                </div>
                {data.about_image ? (
                  <div className="relative w-full h-36 rounded-[6px] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={data.about_image} alt="about" className="w-full h-full object-cover" />
                    <button
                      onClick={() => { deleteR2Image(data.about_image); update("about_image", ""); }}
                      className="absolute inset-x-0 bottom-0 py-1.5 bg-red-600/90 text-white text-xs font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No about image. Upload one above.</p>
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
                aiLoading={aiLoading}
                onFillAI={fillWithAI}
              />
            )}

            {/* CONTACT */}
            {active === "contact" && (
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Phone" value={data.phone} onChange={(v) => update("phone", v)} placeholder="+1 234 567 8900" />
                <Field label="Email" value={data.email} onChange={(v) => update("email", v)} placeholder="hello@yourbusiness.com" />
                <div>
                  <label className="text-sm text-foreground block mb-1.5">Address</label>
                  <div className="w-full bg-secondary/50 border border-border/40 rounded-[6px] px-3 py-2.5 text-sm text-muted-foreground cursor-not-allowed select-none">{data.address || "—"}</div>
                  <p className="text-[10px] text-muted-foreground mt-1">Set during registration · cannot be changed</p>
                </div>
                <Field
                  label={<span className="flex items-center gap-1.5"><img src="/social-icons/whatsapp.png" alt="WhatsApp" width={14} height={14} className="object-contain" />WhatsApp</span>}
                  value={(data.social as Record<string, string>).whatsapp ?? ""}
                  onChange={(v) => update("social", { ...data.social, whatsapp: v })}
                  placeholder="+1234567890"
                />
              </div>
            )}

            {/* STATS */}
            {active === "stats" && (
              <div className="grid sm:grid-cols-3 gap-4">
                <Field label="Years in business" value={data.stat_years} onChange={(v) => update("stat_years", v)} placeholder="e.g. 12+" />
                <div>
                  <label className="text-sm text-foreground block mb-1.5">Clients / Reviews</label>
                  <div className="w-full bg-secondary/50 border border-border/40 rounded-[6px] px-3 py-2.5 text-sm text-muted-foreground cursor-not-allowed select-none">{data.stat_clients || "—"}</div>
                  <p className="text-[10px] text-muted-foreground mt-1">Auto-fetched from Google Places</p>
                </div>
                <div>
                  <label className="text-sm text-foreground block mb-1.5">Rating</label>
                  <div className="w-full bg-secondary/50 border border-border/40 rounded-[6px] px-3 py-2.5 text-sm text-muted-foreground cursor-not-allowed select-none">{data.stat_projects || "—"}</div>
                  <p className="text-[10px] text-muted-foreground mt-1">Auto-fetched from Google Places</p>
                </div>
              </div>
            )}

            {/* HOURS */}
            {active === "hours" && (
              <div className="flex flex-col gap-3">
                {DAYS.map((day) => (
                  <div key={day} className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground w-24 shrink-0">{day}</span>
                    <input
                      value={(data.hours as Record<string, string>)[day] ?? ""}
                      onChange={(e) => update("hours", { ...data.hours, [day]: e.target.value })}
                      placeholder="9am – 6pm or Closed"
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
                    />
                  );
                })}
              </div>
            )}

            {/* REVIEWS */}
            {active === "reviews" && (
              <div className="flex flex-col gap-3">
                {data.testimonials.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No reviews imported.</p>
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
                <p className="text-xs text-muted-foreground mt-1">Reviews imported from Google Maps · cannot be modified.</p>
              </div>
            )}

            {/* Mobile: delete account */}
            <div className="md:hidden mt-6 pt-5 border-t border-border">
              <button onClick={() => { setDeleteModal(true); setDeleteConfirm(""); }}
                className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors">
                <Trash2 size={15} /> Delete account
              </button>
            </div>

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
                <h3 className="font-semibold text-foreground">Unsaved changes</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-5">You have unsaved changes. Save before leaving or discard them?</p>
              <div className="flex gap-2">
                <button onClick={() => setDiscardModal(null)}
                  className="flex-1 px-3 py-2.5 rounded-[4px] border border-border text-sm text-foreground hover:border-border/60 transition-colors">Stay</button>
                <button onClick={() => { setDiscardModal(null); discardModal.onConfirm(); }}
                  className="flex-1 px-3 py-2.5 rounded-[4px] border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">Discard</button>
                <button onClick={async () => { await save(); setDiscardModal(null); discardModal.onConfirm(); }}
                  className="flex-1 px-3 py-2.5 rounded-[4px] bg-[#0066cc] hover:opacity-90 text-sm font-medium text-white transition-colors">Save & leave</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              <input value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} placeholder="DELETE"
                className="w-full bg-secondary border border-border rounded-[6px] px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none focus:border-red-500 transition-colors" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModal(false)}
                className="flex-1 px-4 py-2.5 rounded-[4px] border border-border text-sm text-foreground hover:border-border/60 transition-colors">Cancel</button>
              <button
                disabled={deleteConfirm !== "DELETE" || deleteLoading}
                onClick={async () => {
                  setDeleteLoading(true);
                  const res = await fetch("/api/delete-account", { method: "DELETE" });
                  if (!res.ok) {
                    const json = await res.json().catch(() => ({}));
                    toast.error(json.error ?? "Failed to delete account");
                    setDeleteLoading(false);
                    return;
                  }
                  const supabase = (await import("@/lib/supabase/client")).createClient();
                  await supabase.auth.signOut();
                  toast.success("Account deleted.");
                  window.location.href = "/";
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
      {value.length === 0 && (
        <div className="rounded-[6px] border border-dashed border-border px-5 py-8 flex flex-col items-center gap-2 text-center">
          <Layers size={20} className="text-muted-foreground/50" />
          <p className="text-sm font-medium text-foreground">No services added yet</p>
          <p className="text-xs text-muted-foreground">Add your services so customers know what you offer.</p>
        </div>
      )}
      {value.map((s, i) => (
        <div key={i} className="bg-secondary rounded-[6px] p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Service {i + 1}</span>
            <button
              onClick={() => remove(i)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-[6px] px-2 py-1 transition-colors"
            >
              <Trash2 size={12} /> Remove
            </button>
          </div>
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
      <button onClick={add} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground bg-secondary hover:bg-secondary/80 border border-border rounded-[6px] px-4 py-2.5 w-fit transition-colors">
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
            <button type="button" onClick={onAI} disabled={aiLoading}
              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-[#0066cc] hover:opacity-90 rounded-[4px] px-2.5 py-1 transition-colors disabled:opacity-50">
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
        className="w-full bg-secondary border border-border rounded-[6px] px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none focus:border-[#0066cc]"
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
        <label className="text-sm text-foreground">{label}</label>
        <div className="flex items-center gap-2">
          {onAI && (
            <button type="button" onClick={onAI} disabled={aiLoading}
              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-[#0066cc] hover:opacity-90 rounded-[4px] px-2.5 py-1 transition-colors disabled:opacity-50">
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
