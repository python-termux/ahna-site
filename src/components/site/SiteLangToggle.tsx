"use client";

import { useEffect } from "react";

type SiteLang = "en" | "ar";

function setSiteLangCookie(l: SiteLang) {
  if (typeof document === "undefined") return;
  try {
    const parts = window.location.hostname.split(".");
    const domain = parts.length >= 2 ? `.${parts.slice(-2).join(".")}` : window.location.hostname;
    document.cookie = `syrflow_lang=${l};path=/;domain=${domain};max-age=${365 * 24 * 60 * 60};SameSite=Lax`;
  } catch {}
}

export default function SiteLangToggle({
  initialLang,
  className = "",
}: {
  initialLang: SiteLang;
  className?: string;
}) {
  useEffect(() => {
    document.documentElement.dir = initialLang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = initialLang;
  }, [initialLang]);

  function toggle() {
    const next: SiteLang = initialLang === "en" ? "ar" : "en";
    setSiteLangCookie(next);
    window.location.reload();
  }

  return (
    <button
      onClick={toggle}
      className={`px-2.5 py-1 text-xs font-semibold border rounded-[6px] transition-opacity hover:opacity-70 ${className}`}
    >
      {initialLang === "en" ? "AR" : "EN"}
    </button>
  );
}
