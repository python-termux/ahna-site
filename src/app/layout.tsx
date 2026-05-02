import type { Metadata } from "next";
import Script from "next/script";
import { Toaster } from "sonner";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/lib/language";

export const metadata: Metadata = {
  title: "syrflow.com — Your Business, One Page",
  description:
    "Turn your Google Maps listing into a beautiful one-page website in seconds.",
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
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn("dark font-sans scroll-smooth")} suppressHydrationWarning>
      <head>
        <Script
          id="anti-flash"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem('theme');document.documentElement.classList.toggle('dark',(t??'dark')==='dark');var l=localStorage.getItem('lang');if(l==='ar'){document.documentElement.dir='rtl';document.documentElement.lang='ar';}}catch(e){}` }}
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
