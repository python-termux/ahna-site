"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function HeroSlider({ images }: { images: string[] }) {
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(1);

  const go = useCallback((next: number) => {
    setDir(next > idx ? 1 : -1);
    setIdx(next);
  }, [idx]);

  useEffect(() => {
    if (images.length <= 1) return;
    const t = setInterval(() => {
      setDir(1);
      setIdx((i) => (i + 1) % images.length);
    }, 4500);
    return () => clearInterval(t);
  }, [images.length]);

  if (!images.length) return (
    <div className="w-full h-full min-h-[420px] bg-gray-900 rounded-3xl flex items-center justify-center text-gray-700">
      No images
    </div>
  );

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden group select-none">
      <AnimatePresence initial={false} custom={dir} mode="sync">
        <motion.img
          key={idx}
          src={images[idx]}
          alt=""
          custom={dir}
          variants={{
            enter: (d: number) => ({ x: d > 0 ? "6%" : "-6%", opacity: 0 }),
            center: { x: 0, opacity: 1 },
            exit:  (d: number) => ({ x: d > 0 ? "-6%" : "6%", opacity: 0 }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
      </AnimatePresence>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

      {/* Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={() => go((idx - 1 + images.length) % images.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => go((idx + 1) % images.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight size={18} />
          </button>
        </>
      )}

      {/* Dots */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              className={`rounded-full transition-all duration-300 ${
                i === idx ? "w-5 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
