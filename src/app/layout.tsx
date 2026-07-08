import type { Metadata } from "next";
import Script from "next/script";
import { Toaster } from "sonner";
import { cookies, headers } from "next/headers";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/lib/language";

export const metadata: Metadata = {
  metadataBase: new URL("https://syrflow.com"),
  title: {
    template: "%s | syrflow.com",
    default: "syrflow.com — Turn Your Business Into a Website",
  },
  description: "Create a professional one-page website from your Google Maps listing in under 5 minutes. No coding. $5/month, billed annually with a $10 discount.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    other: [
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    siteName: "syrflow.com",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const theme = cookieStore.get("syrflow_theme")?.value === "light" ? "light" : "dark";

  // Single source of truth: explicit cookie choice → otherwise the device
  // language (Accept-Language). Resolved on the server so the very first paint
  // has the correct direction (no English-in-RTL flash).
  const cookieLang = cookieStore.get("syrflow_lang")?.value;
  const deviceAr = /(^|,)\s*ar\b/i.test(headerStore.get("accept-language") ?? "");
  const lang: "ar" | "en" =
    cookieLang === "ar" ? "ar" : cookieLang === "en" ? "en" : deviceAr ? "ar" : "en";

  return (
    <html
      lang={lang}
      dir={lang === "ar" ? "rtl" : "ltr"}
      className={cn(theme === "dark" ? "dark" : "", "font-sans scroll-smooth")}
      suppressHydrationWarning
    >
      <head>
        <Script
          id="anti-flash"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem('theme')||document.cookie.match(/syrflow_theme=([^;]+)/)?.[1];document.documentElement.classList.toggle('dark',(t??'dark')==='dark');var lc=document.cookie.match(/syrflow_lang=(ar|en)/);var l=lc?lc[1]:((navigator.language||'').toLowerCase().indexOf('ar')===0?'ar':'en');document.documentElement.dir=l==='ar'?'rtl':'ltr';document.documentElement.lang=l;}catch(e){}` }}
        />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <LanguageProvider initialLang={lang}>
            {children}
            <Toaster
              position="bottom-right"
              dir={lang === "ar" ? "rtl" : "ltr"}
              toastOptions={{
                style: { background: "oklch(0.2795 0.0368 260.0310)", border: "1px solid oklch(0.4461 0.0263 256.8018)", color: "oklch(0.9288 0.0126 255.5078)" },
              }}
              richColors
            />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
