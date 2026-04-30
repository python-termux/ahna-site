"use client";

import { useState } from "react";
import Script from "next/script";
import Image from "next/image";
import { Loader2, LogIn, ChevronRight, Star, Phone, Globe, MapPin, Mail, Image as ImageIcon, Users, X } from "lucide-react";

const FB_APP_ID = "1463790922054350";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    FB: any;
    fbAsyncInit: () => void;
  }
}

interface FBPage {
  id: string;
  name: string;
  access_token: string;
  category: string;
  picture?: { data: { url: string } };
}

interface PageDetails {
  id: string;
  name: string;
  about?: string;
  description?: string;
  phone?: string;
  emails?: string[];
  website?: string;
  fan_count?: number;
  overall_star_rating?: number;
  rating_count?: number;
  location?: {
    city?: string; country?: string; street?: string; zip?: string;
  };
  cover?: { source: string };
  picture?: { data: { url: string } };
  photos?: { data: { images: { source: string; width: number }[] }[] };
}

type Step = "login" | "pages" | "details";

export default function TestFBPage() {
  const [sdkReady, setSdkReady] = useState(false);
  const [step, setStep] = useState<Step>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pages, setPages] = useState<FBPage[]>([]);
  const [details, setDetails] = useState<PageDetails | null>(null);
  const [rawToken, setRawToken] = useState<string | null>(null);

  function initSDK() {
    window.FB.init({ appId: FB_APP_ID, cookie: true, xfbml: false, version: "v22.0" });
    setSdkReady(true);
  }

  function handleLogin() {
    setError(null);
    setLoading(true);
    window.FB.login(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (res: any) => {
        if (res.authResponse) {
          fetchPages();
        } else {
          setLoading(false);
          setError("Login cancelled or permission denied.");
        }
      },
      { scope: "pages_show_list" }
    );
  }

  function fetchPages() {
    window.FB.api(
      "/me/accounts",
      { fields: "id,name,access_token,category,picture.type(small)" },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (res: any) => {
        setLoading(false);
        if (res.error) { setError(res.error.message); return; }
        setPages(res.data ?? []);
        setStep("pages");
      }
    );
  }

  function fetchDetails(page: FBPage) {
    setLoading(true);
    setError(null);
    setDetails(null);
    setRawToken(page.access_token);
    window.FB.api(
      `/${page.id}`,
      {
        access_token: page.access_token,
        fields: [
          "id", "name", "about", "description", "phone", "emails",
          "website", "fan_count", "overall_star_rating", "rating_count",
          "location", "cover", "picture.type(large)",
          "photos.limit(9){images}",
        ].join(","),
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (res: any) => {
        setLoading(false);
        if (res.error) { setError(res.error.message); return; }
        setDetails(res);
        setStep("details");
      }
    );
  }

  return (
    <>
      <Script
        src="https://connect.facebook.net/en_US/sdk.js"
        strategy="lazyOnload"
        onLoad={initSDK}
      />

      <div className="min-h-screen bg-gray-950 text-white px-4 py-10">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="white" width={20} height={20}>
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold">Facebook Page Connector</h1>
              <p className="text-xs text-gray-400">Test · App ID {FB_APP_ID}</p>
            </div>
          </div>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-6">
            <span className={step === "login" ? "text-blue-400 font-medium" : ""}>Login</span>
            <ChevronRight size={12} />
            <span className={step === "pages" ? "text-blue-400 font-medium" : ""}>Select page</span>
            <ChevronRight size={12} />
            <span className={step === "details" ? "text-blue-400 font-medium" : ""}>Page data</span>
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-950 border border-red-800 rounded-xl px-4 py-3 mb-6 text-sm text-red-300">
              <X size={14} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          {/* ── STEP 1: Login ── */}
          {step === "login" && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-600/15 border border-blue-500/20 flex items-center justify-center mx-auto mb-5">
                <LogIn size={28} className="text-blue-400" />
              </div>
              <h2 className="text-lg font-semibold mb-2">Connect your Facebook page</h2>
              <p className="text-sm text-gray-400 mb-8 max-w-xs mx-auto">
                Click below to log in with Facebook. A popup will ask which pages you want to share.
              </p>
              <button
                onClick={handleLogin}
                disabled={!sdkReady || loading}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-full transition-colors"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : (
                  <svg viewBox="0 0 24 24" fill="white" width={16} height={16}>
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                )}
                {loading ? "Connecting…" : "Login with Facebook"}
              </button>
              {!sdkReady && (
                <p className="text-xs text-gray-600 mt-3">Loading Facebook SDK…</p>
              )}
            </div>
          )}

          {/* ── STEP 2: Page list ── */}
          {step === "pages" && (
            <div className="space-y-3">
              <p className="text-sm text-gray-400 mb-4">
                Found <strong className="text-white">{pages.length}</strong> page{pages.length !== 1 ? "s" : ""}. Click one to pull its data.
              </p>
              {pages.map((page) => (
                <button
                  key={page.id}
                  onClick={() => fetchDetails(page)}
                  disabled={loading}
                  className="w-full flex items-center gap-4 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 rounded-xl p-4 text-left transition-all disabled:opacity-50"
                >
                  {page.picture?.data.url ? (
                    <Image
                      src={page.picture.data.url}
                      alt={page.name}
                      width={44}
                      height={44}
                      className="rounded-full shrink-0"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-blue-600/20 flex items-center justify-center shrink-0">
                      <span className="text-blue-400 font-bold text-sm">{page.name[0]}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{page.name}</p>
                    <p className="text-xs text-gray-500">{page.category} · ID {page.id}</p>
                  </div>
                  {loading ? (
                    <Loader2 size={16} className="text-gray-500 animate-spin shrink-0" />
                  ) : (
                    <ChevronRight size={16} className="text-gray-600 shrink-0" />
                  )}
                </button>
              ))}

              <button
                onClick={() => { setStep("login"); setPages([]); }}
                className="text-xs text-gray-600 hover:text-gray-400 mt-2 transition-colors"
              >
                ← Back to login
              </button>
            </div>
          )}

          {/* ── STEP 3: Page details ── */}
          {step === "details" && details && (
            <div className="space-y-4">
              {/* Cover */}
              {details.cover && (
                <div className="relative w-full h-36 rounded-2xl overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={details.cover.source} alt="cover" className="w-full h-full object-cover" />
                  {details.picture?.data.url && (
                    <div className="absolute bottom-3 left-4">
                      <Image
                        src={details.picture.data.url}
                        alt={details.name}
                        width={56}
                        height={56}
                        className="rounded-full border-2 border-gray-950"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Core info */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3">
                <h2 className="text-lg font-bold">{details.name}</h2>

                {details.fan_count !== undefined && (
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1.5 text-gray-400">
                      <Users size={13} />
                      <strong className="text-white">{details.fan_count.toLocaleString()}</strong> followers
                    </span>
                    {details.overall_star_rating && (
                      <span className="flex items-center gap-1.5 text-gray-400">
                        <Star size={13} className="fill-yellow-400 text-yellow-400" />
                        <strong className="text-white">{details.overall_star_rating.toFixed(1)}</strong>
                        <span>({details.rating_count} ratings)</span>
                      </span>
                    )}
                  </div>
                )}

                {details.about && (
                  <p className="text-sm text-gray-300 leading-relaxed border-t border-gray-800 pt-3">{details.about}</p>
                )}
                {details.description && details.description !== details.about && (
                  <p className="text-sm text-gray-400 leading-relaxed">{details.description}</p>
                )}
              </div>

              {/* Contact */}
              {(details.phone || details.emails?.length || details.website || details.location) && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Contact info</p>
                  <div className="space-y-2.5 text-sm">
                    {details.phone && (
                      <div className="flex items-center gap-2.5 text-gray-300">
                        <Phone size={13} className="text-gray-500 shrink-0" />
                        {details.phone}
                      </div>
                    )}
                    {details.emails?.map((e, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-gray-300">
                        <Mail size={13} className="text-gray-500 shrink-0" />
                        {e}
                      </div>
                    ))}
                    {details.website && (
                      <div className="flex items-center gap-2.5 text-gray-300">
                        <Globe size={13} className="text-gray-500 shrink-0" />
                        <a href={details.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline truncate">
                          {details.website}
                        </a>
                      </div>
                    )}
                    {details.location && (
                      <div className="flex items-start gap-2.5 text-gray-300">
                        <MapPin size={13} className="text-gray-500 shrink-0 mt-0.5" />
                        <span>
                          {[details.location.street, details.location.city, details.location.country].filter(Boolean).join(", ")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Photos */}
              {details.photos?.data && details.photos.data.length > 0 && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5">
                    <ImageIcon size={12} />
                    Photos ({details.photos.data.length})
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {details.photos.data.slice(0, 9).map((photo, i) => {
                      const src = photo.images.sort((a, b) => b.width - a.width)[0]?.source;
                      return src ? (
                        <a key={i} href={src} target="_blank" rel="noopener noreferrer">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={src} alt={`photo ${i + 1}`} className="w-full aspect-square object-cover rounded-lg hover:opacity-80 transition-opacity" />
                        </a>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {/* Page Access Token */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Page Access Token</p>
                <p className="text-[10px] text-gray-600 mb-2">This token is used to access this page&apos;s data from your server.</p>
                <code className="block text-[10px] text-green-400 bg-gray-950 rounded-lg px-3 py-2 break-all">
                  {rawToken}
                </code>
              </div>

              {/* Raw JSON */}
              <details className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                <summary className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 cursor-pointer hover:text-gray-300 transition-colors">
                  Raw JSON response
                </summary>
                <pre className="px-5 pb-5 text-[10px] text-gray-400 overflow-auto max-h-80 leading-relaxed">
                  {JSON.stringify(details, null, 2)}
                </pre>
              </details>

              <button
                onClick={() => { setStep("pages"); setDetails(null); setRawToken(null); }}
                className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
              >
                ← Back to pages
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
