"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <Link href="/" className="text-sm font-semibold text-indigo-500 hover:text-indigo-400 transition-colors">
              ahna.ae
            </Link>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs text-muted-foreground">
              <Link href="/pricing" className="hover:text-muted-foreground transition-colors">Pricing</Link>
              <Link href="/auth/login" className="hover:text-muted-foreground transition-colors">Login</Link>
              <Link href="/register" className="hover:text-muted-foreground transition-colors">Register</Link>
              <Link href="/terms" className="hover:text-muted-foreground transition-colors">Terms</Link>
              <Link href="/privacy-policy" className="hover:text-muted-foreground transition-colors">Privacy</Link>
              <Link href="/refund" className="hover:text-muted-foreground transition-colors">Refunds</Link>
              <Link href="/contact" className="hover:text-muted-foreground transition-colors">Contact</Link>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} ahna.ae. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
