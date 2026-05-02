"use client";

import Image from "next/image";

interface Props {
  name: string;
  tagline?: string;
  category?: string;
  heroImage?: string;
  stats: { label: string; value: string }[];
  phone?: string;
  address?: string;
  themeBtn: string;
  themeText: string;
  themeAccent: string;
  themeBorder: string;
}

export default function AnimatedHero({
  name, tagline, category, heroImage, stats, phone, address,
  themeBtn, themeText, themeAccent, themeBorder,
}: Props) {
  return (
    <section className="relative min-h-[85vh] flex items-end">
      {heroImage ? (
        <div className="absolute inset-0 anim-in" style={{ animationDuration: "1.1s" }}>
          <Image src={heroImage} alt={name} fill className="object-cover" priority sizes="100vw" />
        </div>
      ) : (
        <div className={`absolute inset-0 ${themeAccent}`} />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 anim-in bg-gradient-to-t from-gray-950 via-gray-950/60 to-gray-950/10" />

      {/* Content — sequential fade-ups */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-16">
        {category && (
          <span className={`anim-up anim-d1 inline-block text-xs font-medium ${themeText} ${themeAccent} border ${themeBorder} px-3 py-1 site-btn mb-4`}>
            {category}
          </span>
        )}

        <h1 className="anim-up anim-d2 text-5xl sm:text-7xl font-extrabold tracking-tight mb-4 max-w-3xl">
          {name}
        </h1>

        {tagline && (
          <p className="anim-up anim-d3 text-xl text-gray-300 mb-8 max-w-xl">
            {tagline}
          </p>
        )}

        {stats.length > 0 && (
          <div className="anim-up anim-d4 flex flex-wrap gap-6 mb-8">
            {stats.map((s) => (
              <div key={s.label}>
                <p className={`text-3xl font-bold ${themeText}`}>{s.value}</p>
                <p className="text-xs text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="anim-up anim-d5 flex flex-wrap gap-3">
          {phone && (
            <a
              href={`tel:${phone}`}
              className={`${themeBtn} text-white font-semibold px-6 py-3 rounded-xl transition-colors`}
            >
              Call now
            </a>
          )}
          {address && (
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-white/20 hover:border-white/40 text-white px-6 py-3 rounded-xl transition-colors"
            >
              Get directions
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
