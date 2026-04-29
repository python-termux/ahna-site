import { Star } from "lucide-react";

export default function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={16}
          className={
            n <= Math.round(rating)
              ? "text-yellow-400 fill-yellow-400"
              : "text-gray-600 fill-gray-600"
          }
        />
      ))}
    </div>
  );
}
