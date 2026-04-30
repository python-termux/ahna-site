"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/language";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <Link href="/" className="text-sm font-semibold hover:opacity-70 transition-opacity" style={{ color: "#0066cc" }}>
              syrflow.com
            </Link>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs text-muted-foreground">
              <Link href="/pricing"        className="hover:text-foreground transition-colors">{t.footer.pricing}</Link>
              <Link href="/auth/login"     className="hover:text-foreground transition-colors">{t.footer.login}</Link>
              <Link href="/register"       className="hover:text-foreground transition-colors">{t.footer.register}</Link>
              <Link href="/terms"          className="hover:text-foreground transition-colors">{t.footer.terms}</Link>
              <Link href="/privacy-policy" className="hover:text-foreground transition-colors">{t.footer.privacy}</Link>
              <Link href="/refund"         className="hover:text-foreground transition-colors">{t.footer.refunds}</Link>
              <Link href="/contact"        className="hover:text-foreground transition-colors">{t.footer.contact}</Link>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} syrflow.com. {t.footer.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
