"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { ThemeToggle } from "./ThemeProvider";
import { useLanguage } from "@/lib/language";

type NavItem = {
  label: string;
  href?: string;
  children?: Array<{ label: string; href: string }>;
};

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

function DropdownItem({ item }: { item: NavItem }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { lang } = useLanguage();

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  if (!item.children) {
    const active = pathname === item.href;
    return (
      <Link
        href={item.href!}
        className={`px-3 py-2 text-sm font-semibold transition-colors ${active ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
      >
        {item.label}
      </Link>
    );
  }

  const anyActive = item.children.some((c) => pathname === c.href);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1 px-3 py-2 text-sm font-semibold transition-colors ${anyActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
      >
        {item.label}
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={13} />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            dir={lang === "ar" ? "rtl" : "ltr"}
            className="absolute top-full right-0 mt-1.5 w-48 bg-background border border-border rounded-[8px] shadow-2xl overflow-hidden z-50"
          >
            <div className="p-1.5 flex flex-col gap-0.5">
              {item.children.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  onClick={() => setOpen(false)}
                  className={`px-3 py-2.5 rounded-[6px] text-sm font-semibold transition-colors ${
                    pathname === child.href
                      ? "text-foreground bg-accent"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  {child.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [legalOpen, setLegalOpen] = useState(false);
  const pathname = usePathname();
  const { lang, t } = useLanguage();

  const NAV: NavItem[] = [
    { label: t.nav.pricing, href: "/pricing" },
    { label: t.nav.contact, href: "/contact" },
    {
      label: t.nav.legal,
      children: [
        { label: t.nav.terms,   href: "/terms" },
        { label: t.nav.privacy, href: "/privacy-policy" },
        { label: t.nav.refund,  href: "/refund" },
      ],
    },
  ];

  useEffect(() => {
    setMobileOpen(false);
    setLegalOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileOpen) setLegalOpen(true);
  }, [mobileOpen]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        dir="ltr"
        className="flex items-center justify-between px-4 sm:px-6 py-5 max-w-6xl mx-auto w-full relative z-40"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center hover:opacity-70 transition-opacity">
          <span className="text-xl font-bold tracking-tight" style={{ color: "#0066cc" }}>{lang === "ar" ? "سوريا فلو" : "Syria flow"}</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-1">
          {NAV.map((item) => (
            <DropdownItem key={item.label} item={item} />
          ))}
          <div className="w-px h-4 bg-accent mx-2" />
          <LangToggle />
          <ThemeToggle />
          <Link href="/auth/login" className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
            {t.nav.login}
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 text-sm text-white font-semibold transition-opacity hover:opacity-90 active:scale-95"
            style={{ backgroundColor: "#0066cc", borderRadius: 9999 }}
          >
            {t.nav.getStarted}
          </Link>
        </div>

        {/* Mobile: lang toggle + theme toggle + hamburger */}
        <div className="sm:hidden flex items-center gap-1 relative z-50">
          <LangToggle />
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="w-9 h-9 flex items-center justify-center"
            aria-label="Toggle menu"
          >
            <span className="relative block w-5 h-[9px]">
              <motion.span
                animate={mobileOpen ? { rotate: 45, y: 3.5 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="absolute top-0 left-0 block h-0.5 w-5 bg-gray-900 dark:bg-white origin-center"
              />
              <motion.span
                animate={mobileOpen ? { rotate: -45, y: -3.5 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="absolute bottom-0 left-0 block h-0.5 w-5 bg-gray-900 dark:bg-white origin-center"
              />
            </span>
          </button>
        </div>
      </motion.nav>

      {/* Mobile full-viewport menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            dir={lang === "ar" ? "rtl" : "ltr"}
            className="fixed inset-0 z-30 bg-background flex flex-col sm:hidden"
          >
            <div className="h-[72px] shrink-0" />

            <div className="flex-1 flex flex-col px-6 pt-6 pb-10 overflow-y-auto">
              <nav className="flex flex-col gap-1">
                {NAV.map((item) => {
                  if (!item.children) {
                    return (
                      <Link
                        key={item.href}
                        href={item.href!}
                        className={`px-4 py-3.5 rounded-[6px] text-base font-medium transition-colors ${
                          pathname === item.href
                            ? "text-foreground bg-accent"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  }

                  return (
                    <div key={item.label}>
                      <button
                        onClick={() => setLegalOpen((v) => !v)}
                        className="w-full flex items-center justify-between px-4 py-3.5 rounded-[6px] text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      >
                        {item.label}
                        <motion.span animate={{ rotate: legalOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                          <ChevronDown size={15} />
                        </motion.span>
                      </button>
                      <AnimatePresence initial={false}>
                        {legalOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="ms-4 mt-1 flex flex-col gap-0.5 border-s border-border ps-4">
                              {item.children.map((child) => (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  className={`py-2.5 text-sm transition-colors ${
                                    pathname === child.href
                                      ? "text-foreground"
                                      : "text-muted-foreground hover:text-foreground"
                                  }`}
                                >
                                  {child.label}
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </nav>

              <div className="h-px bg-accent my-6" />

              <div className="flex items-center border border-input rounded-[9999px] overflow-hidden">
                <Link
                  href="/auth/login"
                  className="flex-1 text-center px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t.nav.login}
                </Link>
                <span className="w-px h-5 bg-border shrink-0" />
                <Link
                  href="/register"
                  className="flex-1 text-center px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "#0066cc" }}
                >
                  {t.nav.getStarted}
                </Link>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
