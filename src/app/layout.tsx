import type { Metadata } from "next";
import Script from "next/script";
import { Toaster } from "sonner";
import { cookies } from "next/headers";
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
  description: "Create a professional one-page website from your Google Maps listing in under 5 minutes. No coding. Plans from $2/month.",
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
  const theme = cookieStore.get("syrflow_theme")?.value === "light" ? "light" : "dark";
  const lang = cookieStore.get("syrflow_lang")?.value === "ar" ? "ar" : "en";

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
          dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem('theme')||document.cookie.match(/syrflow_theme=([^;]+)/)?.[1];document.documentElement.classList.toggle('dark',(t??'dark')==='dark');var l=localStorage.getItem('lang')||document.cookie.match(/syrflow_lang=([^;]+)/)?.[1];if(l==='ar'){document.documentElement.dir='rtl';document.documentElement.lang='ar';}else{document.documentElement.dir='ltr';}}catch(e){}` }}
        />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <LanguageProvider>
            {children}
            <Toaster
              position="bottom-right"
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
