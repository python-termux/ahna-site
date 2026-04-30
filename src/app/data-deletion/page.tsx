"use client";

import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import { useLanguage } from "@/lib/language";

export default function DataDeletionPage() {
  const { t } = useLanguage();
  const d = t.dataDeletion;

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteHeader />

      <section className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 py-16 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">{d.title}</h1>
        <p className="text-muted-foreground text-sm mb-8">
          {new Date().toLocaleDateString("en-AE", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <div className="space-y-6 text-sm text-foreground leading-relaxed">
          <div className="bg-card border border-border rounded-[8px] p-5">
            <h2 className="font-semibold text-base mb-2">{d.whatTitle}</h2>
            <p className="text-muted-foreground">{d.whatBody}</p>
          </div>

          <div className="bg-card border border-border rounded-[8px] p-5">
            <h2 className="font-semibold text-base mb-2">{d.howTitle}</h2>
            <p className="text-muted-foreground mb-4">{d.howIntro}</p>
            <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
              <li>
                <strong className="text-foreground">{d.opt1Title}</strong>{" "}
                {d.opt1Body}
              </li>
              <li>
                <strong className="text-foreground">{d.opt2Title}</strong>{" "}
                {d.opt2Body.split("support@syrflow.com")[0]}
                <a href="mailto:support@syrflow.com" className="underline" style={{ color: "#0066cc" }}>
                  support@syrflow.com
                </a>
                {d.opt2Body.split("support@syrflow.com")[1]}
              </li>
            </ol>
          </div>

          <div className="bg-card border border-border rounded-[8px] p-5">
            <h2 className="font-semibold text-base mb-2">{d.fbTitle}</h2>
            <p className="text-muted-foreground">
              {d.fbPre}{" "}
              <a
                href="https://www.facebook.com/settings?tab=applications"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
                style={{ color: "#0066cc" }}
              >
                {d.fbLink}
              </a>{" "}
              {d.fbPost}
            </p>
          </div>

          <div className="bg-card border border-border rounded-[8px] p-5">
            <h2 className="font-semibold text-base mb-2">{d.contactTitle}</h2>
            <p className="text-muted-foreground">
              {d.contactBody}{" "}
              <a href="mailto:support@syrflow.com" className="underline" style={{ color: "#0066cc" }}>
                support@syrflow.com
              </a>
              .
            </p>
          </div>
        </div>

        <div className="flex gap-4 mt-10 text-xs text-muted-foreground">
          <Link href="/privacy-policy" className="hover:text-foreground transition-colors">{t.nav.privacy}</Link>
          <Link href="/terms"          className="hover:text-foreground transition-colors">{t.nav.terms}</Link>
          <Link href="/"               className="hover:text-foreground transition-colors">Home</Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
