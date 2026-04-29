"use client";

import { useState, useEffect } from "react";

const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

function parseMinutes(t: string): number | null {
  const s = t.trim().toLowerCase().replace(/\s/g, "");
  const m = s.match(/^(\d{1,2})(?::(\d{2}))?(am|pm)?$/);
  if (!m) return null;
  let h = parseInt(m[1]);
  const min = m[2] ? parseInt(m[2]) : 0;
  if (m[3] === "pm" && h !== 12) h += 12;
  if (m[3] === "am" && h === 12) h = 0;
  return h * 60 + min;
}

function checkOpen(hoursStr: string): boolean | null {
  const s = hoursStr.trim().toLowerCase();
  if (s === "closed") return false;
  if (s.includes("24")) return true;
  const parts = s.split(/[–\-]/).map((p) => p.trim());
  if (parts.length !== 2) return null;
  const open = parseMinutes(parts[0]);
  const close = parseMinutes(parts[1]);
  if (open === null || close === null) return null;
  const cur = new Date().getHours() * 60 + new Date().getMinutes();
  return close > open ? cur >= open && cur < close : cur >= open || cur < close;
}

export default function OpenStatus({
  hours,
  isLight,
}: {
  hours: Record<string, string>;
  isLight: boolean;
}) {
  const [status, setStatus] = useState<{ open: boolean; todayHours: string } | null>(null);

  useEffect(() => {
    function update() {
      const today = DAYS[new Date().getDay()];
      const todayHours = Object.entries(hours).find(
        ([day]) => day.toLowerCase() === today.toLowerCase()
      )?.[1] ?? "";
      if (!todayHours) { setStatus(null); return; }
      const open = checkOpen(todayHours);
      if (open === null) { setStatus(null); return; }
      setStatus({ open, todayHours });
    }
    update();
    const t = setInterval(update, 60_000);
    return () => clearInterval(t);
  }, [hours]);

  if (!status) return null;

  return (
    <div className={`flex items-center gap-1.5 mt-3 pt-3 border-t ${isLight ? "border-gray-200" : "border-gray-800"}`}>
      <span className={`w-2 h-2 rounded-full shrink-0 ${status.open ? "bg-emerald-400" : "bg-red-400"}`} />
      <span className={`text-xs font-semibold ${status.open ? "text-emerald-400" : "text-red-400"}`}>
        {status.open ? "Open now" : "Closed now"}
      </span>
      <span className={`text-xs ${isLight ? "text-gray-400" : "text-gray-600"}`}>
        · {status.todayHours}
      </span>
    </div>
  );
}
