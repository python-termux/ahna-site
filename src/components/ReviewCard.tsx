import StarRating from "./StarRating";

interface Review {
  author: string;
  rating: number;
  text: string;
  date: string;
}

export default function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-sm text-white">{review.author}</p>
          {review.date && (
            <p className="text-xs text-gray-500 mt-0.5">{review.date}</p>
          )}
        </div>
        <StarRating rating={review.rating} />
      </div>
      {review.text && (
        <p className="text-sm text-gray-300 leading-relaxed line-clamp-4">
          &ldquo;{review.text}&rdquo;
        </p>
      )}
    </div>
  );
}
