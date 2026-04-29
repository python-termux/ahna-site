"use client";

import { Star } from "lucide-react";

interface Review { author: string; role: string; text: string; rating: number }

function ReviewCard({ r, isLight }: { r: Review; isLight: boolean }) {
  return (
    <div className={`shrink-0 w-72 rounded-lg p-5 border flex flex-col gap-3 ${
      isLight
        ? "bg-white border-gray-200"
        : "bg-gray-900 border-gray-800"
    }`}>
      <div className="flex gap-0.5">
        {[1,2,3,4,5].map((n) => (
          <Star
            key={n}
            size={13}
            className={n <= r.rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-700 text-gray-700"}
          />
        ))}
      </div>
      <p className={`text-sm leading-relaxed line-clamp-3 flex-1 ${isLight ? "text-gray-600" : "text-gray-300"}`}>
        &ldquo;{r.text}&rdquo;
      </p>
      <div>
        <p className={`font-semibold text-sm ${isLight ? "text-gray-900" : "text-white"}`}>{r.author}</p>
        {r.role && <p className={`text-xs ${isLight ? "text-gray-400" : "text-gray-500"}`}>{r.role}</p>}
      </div>
    </div>
  );
}

export default function ReviewMarquee({
  reviews,
  isLight,
}: {
  reviews: Review[];
  isLight: boolean;
}) {
  const doubled = [...reviews, ...reviews];

  return (
    <div className="w-full overflow-hidden">
      <div
        className="max-w-6xl mx-auto overflow-hidden"
        style={{
          WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
          maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
        }}
      >
        <style>{`
          @keyframes marquee-scroll {
            from { transform: translateX(0) }
            to   { transform: translateX(-50%) }
          }
          .marquee-track {
            animation: marquee-scroll 40s linear infinite;
            will-change: transform;
          }
          .marquee-track:hover {
            animation-play-state: paused;
          }
        `}</style>
        <div className="marquee-track flex gap-5 w-max py-2 px-2">
          {doubled.map((r, i) => (
            <ReviewCard key={i} r={r} isLight={isLight} />
          ))}
        </div>
      </div>
    </div>
  );
}