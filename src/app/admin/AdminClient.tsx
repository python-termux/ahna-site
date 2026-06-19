"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ShieldCheck, LogOut, Search, ExternalLink, Globe,
  CheckCircle2, XCircle, Clock, Trash2, Loader2, Rocket, Power, X,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeProvider";

export type AdminRow = {
  id: string;
  name: string;
  slug: string;          // empty when no subdomain chosen yet
  email: string;
  registeredAt: string;
  published: boolean;
  publishedUntil: string | null;
  isTmp: boolean;
};

type Status = "live" | "expired" | "unpublished" | "nosite";

function statusOf(r: AdminRow): Status {
  if (r.isTmp) return "nosite";
  if (!r.published) return "unpublished";
  if (r.publishedUntil && new Date(r.publishedUntil).getTime() <= Date.now()) return "expired";
  return "live";
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

const YEAR_CHIPS = [1, 2, 3, 4];

export default function AdminClient({
  rows: initialRows,
  adminEmail,
  rootDomain,
}: {
  rows: AdminRow[];
  adminEmail: string;
  rootDomain: string;
}) {
  const router = useRouter();
  const [rows, setRows] = useState<AdminRow[]>(initialRows);
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [publishOpen, setPublishOpen] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ type: "expire" | "delete"; row: AdminRow } | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) => r.email.toLowerCase().includes(q) || r.slug.toLowerCase().includes(q) || r.name.toLowerCase().includes(q)
    );
  }, [rows, query]);

  const stats = useMemo(() => {
    let live = 0, expired = 0, unpublished = 0;
    for (const r of rows) {
      const s = statusOf(r);
      if (s === "live") live++;
      else if (s === "expired") expired++;
      else if (s === "unpublished") unpublished++;
    }
    return { total: rows.length, live, expired, unpublished };
  }, [rows]);

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  async function publish(row: AdminRow, years: number | null) {
    setBusyId(row.id);
    try {
      const res = await fetch("/api/admin/site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: row.id, action: "publish", years }),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error ?? "Failed to publish"); return; }
      setRows((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, published: true, publishedUntil: json.publishedUntil ?? null } : r))
      );
      toast.success(years ? `Published for ${years} year${years > 1 ? "s" : ""}` : "Published (no expiry)");
      setPublishOpen(null);
    } finally {
      setBusyId(null);
    }
  }

  async function expire(row: AdminRow) {
    setBusyId(row.id);
    try {
      const res = await fetch("/api/admin/site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: row.id, action: "expire" }),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error ?? "Failed to expire"); return; }
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, published: false } : r)));
      toast.success("Site taken offline");
      setConfirm(null);
    } finally {
      setBusyId(null);
    }
  }

  async function remove(row: AdminRow) {
    setBusyId(row.id);
    try {
      const res = await fetch("/api/admin/site", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: row.id }),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error ?? "Failed to delete"); return; }
      setRows((prev) => prev.filter((r) => r.id !== row.id));
      toast.success("Site deleted");
      setConfirm(null);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-30 bg-background/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <ShieldCheck size={16} className="text-[#0066cc]" />
            Admin
            <span className="text-muted-foreground font-normal hidden sm:inline">· {adminEmail}</span>
          </div>
          <button
            onClick={signOut}
            className="inline-flex items-center gap-1.5 text-xs border border-border hover:bg-accent rounded-[6px] px-3 py-1.5 transition-colors"
          >
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Stat chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard label="Total sites" value={stats.total} />
          <StatCard label="Live" value={stats.live} tone="green" />
          <StatCard label="Unpublished" value={stats.unpublished} tone="gray" />
          <StatCard label="Expired" value={stats.expired} tone="red" />
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by email, domain, or name…"
            className="w-full bg-card border border-input rounded-[6px] pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-[#0066cc] transition-colors"
          />
        </div>

        {/* Desktop column headers */}
        <div className="hidden md:grid grid-cols-[1.4fr_1.2fr_0.8fr_0.8fr_auto] gap-3 px-4 pb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          <span>User</span>
          <span>Domain</span>
          <span>Registered</span>
          <span>Status</span>
          <span className="text-right">Actions</span>
        </div>

        <div className="flex flex-col gap-3">
          {filtered.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-16 border border-dashed border-border rounded-[6px]">
              No sites found.
            </div>
          )}

          {filtered.map((row) => {
            const status = statusOf(row);
            const domain = row.slug ? `${row.slug}.${rootDomain}` : null;
            const busy = busyId === row.id;
            return (
              <div
                key={row.id}
                className="bg-card border border-border rounded-[6px] p-4 md:grid md:grid-cols-[1.4fr_1.2fr_0.8fr_0.8fr_auto] md:items-center md:gap-3"
              >
                {/* User */}
                <div className="min-w-0 mb-2 md:mb-0">
                  <p className="text-sm font-semibold truncate">{row.email}</p>
                  <p className="text-xs text-muted-foreground truncate">{row.name}</p>
                </div>

                {/* Domain */}
                <div className="min-w-0 mb-2 md:mb-0">
                  {domain ? (
                    <a
                      href={`https://${domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-[#0066cc] dark:text-[#2997ff] hover:underline truncate"
                    >
                      <Globe size={13} className="shrink-0" />
                      <span className="truncate">{domain}</span>
                      <ExternalLink size={11} className="shrink-0 opacity-60" />
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">No subdomain yet</span>
                  )}
                </div>

                {/* Registered */}
                <div className="text-xs text-muted-foreground mb-2 md:mb-0">
                  <span className="md:hidden font-medium text-foreground">Registered: </span>
                  {fmtDate(row.registeredAt)}
                </div>

                {/* Status */}
                <div className="mb-3 md:mb-0">
                  <StatusBadge status={status} until={row.publishedUntil} />
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-start md:justify-end gap-2">
                  {status === "live" ? (
                    <button
                      onClick={() => setConfirm({ type: "expire", row })}
                      disabled={busy}
                      className="inline-flex items-center gap-1.5 text-xs border border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-[6px] px-2.5 py-1.5 transition-colors disabled:opacity-50"
                    >
                      <Power size={13} /> Expire
                    </button>
                  ) : status === "nosite" ? (
                    <span className="text-xs text-muted-foreground">—</span>
                  ) : (
                    <div className="relative">
                      <button
                        onClick={() => setPublishOpen(publishOpen === row.id ? null : row.id)}
                        disabled={busy}
                        className="inline-flex items-center gap-1.5 text-xs bg-[#0066cc] hover:bg-[#0071e3] text-white rounded-[6px] px-2.5 py-1.5 transition-colors disabled:opacity-50"
                      >
                        {busy ? <Loader2 size={13} className="animate-spin" /> : <Rocket size={13} />}
                        {status === "expired" ? "Republish" : "Publish"}
                      </button>

                      {publishOpen === row.id && (
                        <div className="absolute right-0 md:right-0 mt-2 z-20 w-56 bg-card border border-border rounded-[8px] shadow-lg p-3">
                          <p className="text-xs font-medium mb-2">Publish for how long?</p>
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {YEAR_CHIPS.map((y) => (
                              <button
                                key={y}
                                onClick={() => publish(row, y)}
                                disabled={busy}
                                className="text-xs font-medium border border-border hover:border-[#0066cc] hover:text-[#0066cc] rounded-full px-3 py-1.5 transition-colors disabled:opacity-50"
                              >
                                {y} yr{y > 1 ? "s" : ""}
                              </button>
                            ))}
                            <button
                              onClick={() => publish(row, null)}
                              disabled={busy}
                              className="text-xs font-medium border border-border hover:border-[#0066cc] hover:text-[#0066cc] rounded-full px-3 py-1.5 transition-colors disabled:opacity-50"
                            >
                              Forever
                            </button>
                          </div>
                          <button
                            onClick={() => setPublishOpen(null)}
                            className="text-[11px] text-muted-foreground hover:text-foreground"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => setConfirm({ type: "delete", row })}
                    disabled={busy}
                    className="inline-flex items-center gap-1.5 text-xs border border-red-300 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-[6px] px-2.5 py-1.5 transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Confirm dialog */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50" onClick={() => setConfirm(null)}>
          <div className="w-full max-w-sm bg-card border border-border rounded-[8px] p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-base font-semibold">
                {confirm.type === "delete" ? "Delete this site?" : "Take site offline?"}
              </h3>
              <button onClick={() => setConfirm(null)} className="text-muted-foreground hover:text-foreground">
                <X size={16} />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-5">
              {confirm.type === "delete" ? (
                <>This permanently deletes <span className="font-medium text-foreground">{confirm.row.name}</span> ({confirm.row.email}) and its site. This cannot be undone.</>
              ) : (
                <>This unpublishes <span className="font-medium text-foreground">{confirm.row.slug}.{rootDomain}</span>. Visitors will see an unavailable page until you publish it again.</>
              )}
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirm(null)}
                className="text-sm border border-border hover:bg-accent rounded-[6px] px-4 py-2 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => (confirm.type === "delete" ? remove(confirm.row) : expire(confirm.row))}
                disabled={busyId === confirm.row.id}
                className={`inline-flex items-center gap-1.5 text-sm text-white rounded-[6px] px-4 py-2 transition-colors disabled:opacity-50 ${
                  confirm.type === "delete" ? "bg-red-600 hover:bg-red-700" : "bg-amber-600 hover:bg-amber-700"
                }`}
              >
                {busyId === confirm.row.id ? <Loader2 size={14} className="animate-spin" /> : confirm.type === "delete" ? <Trash2 size={14} /> : <Power size={14} />}
                {confirm.type === "delete" ? "Delete" : "Take offline"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-5 right-5 z-40">
        <ThemeToggle />
      </div>
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: number; tone?: "green" | "red" | "gray" }) {
  const color =
    tone === "green" ? "text-green-600 dark:text-green-400"
    : tone === "red" ? "text-red-600 dark:text-red-400"
    : tone === "gray" ? "text-muted-foreground"
    : "text-foreground";
  return (
    <div className="bg-card border border-border rounded-[6px] p-4">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function StatusBadge({ status, until }: { status: Status; until: string | null }) {
  if (status === "live") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900 rounded-full px-2.5 py-1">
        <CheckCircle2 size={12} /> Live{until ? ` · until ${fmtDate(until)}` : ""}
      </span>
    );
  }
  if (status === "expired") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-full px-2.5 py-1">
        <Clock size={12} /> Expired
      </span>
    );
  }
  if (status === "nosite") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground bg-muted border border-border rounded-full px-2.5 py-1">
        No site yet
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground bg-muted border border-border rounded-full px-2.5 py-1">
      <XCircle size={12} /> Unpublished
    </span>
  );
}
