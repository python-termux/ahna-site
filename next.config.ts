import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Client Router Cache: reuse fetched page payloads for 5 minutes on
  // client-side navigations. Revisiting a page (e.g. back to the dashboard)
  // within that window never hits the server — zero Supabase auth/DB calls.
  // After Save the dashboard calls router.refresh(), replacing its cache
  // entry with fresh data immediately.
  experimental: {
    staleTimes: {
      dynamic: 300,
      static: 300,
    },
  },
  // Strip console output from production bundles (keeps console.error for
  // server-side observability). Nothing leaks to the browser console.
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false,
  },
  // Never ship readable client source maps in production.
  productionBrowserSourceMaps: false,
  // Don't advertise the framework.
  poweredByHeader: false,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "**.googleusercontent.com" },
      { protocol: "https", hostname: "maps.googleapis.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "streetviewpixels-pa.googleapis.com" },
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
