"use client";

import { motion } from "framer-motion";
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

const item = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } },
};

export default function AnimatedHero({
  name, tagline, category, heroImage, stats, phone, address,
  themeBtn, themeText, themeAccent, themeBorder,
}: Props) {
  return (
    <section className="relative min-h-[85vh] flex items-end">
      {heroImage ? (
        <motion.div
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <Image src={heroImage} alt={name} fill className="object-cover" priority sizes="100vw" />
        </motion.div>
      ) : (
        <div className={`absolute inset-0 ${themeAccent}`} />
      )}

      {/* Gradient overlay — animates in */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-gray-950/10"
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-16">
        <motion.div
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } } }}
          initial="hidden"
          animate="show"
        >
          {category && (
            <motion.span
              variants={item}
              className={`inline-block text-xs font-medium ${themeText} ${themeAccent} border ${themeBorder} px-3 py-1 site-btn mb-4`}
            >
              {category}
            </motion.span>
          )}

          <motion.h1
            variants={item}
            className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-4 max-w-3xl"
          >
            {name}
          </motion.h1>

          {tagline && (
            <motion.p variants={item} className="text-xl text-gray-300 mb-8 max-w-xl">
              {tagline}
            </motion.p>
          )}

          {stats.length > 0 && (
            <motion.div variants={item} className="flex flex-wrap gap-6 mb-8">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className={`text-3xl font-bold ${themeText}`}>{s.value}</p>
                  <p className="text-xs text-gray-400">{s.label}</p>
                </div>
              ))}
            </motion.div>
          )}

          <motion.div variants={item} className="flex flex-wrap gap-3">
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
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
