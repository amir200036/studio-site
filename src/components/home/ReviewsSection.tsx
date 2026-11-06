import type { Review } from "@prisma/client";
import { cardGrid } from "@/lib/card-grid";

interface Props {
  reviews: Review[];
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < rating ? "text-amber-400" : "text-stone-200"}>
          ★
        </span>
      ))}
    </div>
  );
}

export function ReviewsSection({ reviews }: Props) {
  if (reviews.length === 0) return null;

  return (
    <section className="py-20 bg-white border-y border-amber-100/70">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="w-12 h-1 bg-amber-500 rounded-full mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold text-amber-900">מה אומרים עלינו</h2>
          <p className="text-stone-600 mt-2">ביקורות אמיתיות מלקוחות מרוצים</p>
        </div>

        <div className={cardGrid(reviews.length).container}>
          {reviews.map((review) => (
            <div
              key={review.id}
              className={`${cardGrid(reviews.length).item} bg-amber-50/60 p-6 rounded-2xl border border-amber-100 flex flex-col gap-3`}
            >
              <StarRating rating={review.rating} />
              <p className="text-stone-700 leading-relaxed flex-1">&quot;{review.content}&quot;</p>
              <div className="flex items-center gap-2 pt-3 border-t border-amber-100">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold text-sm">
                  {review.authorName.charAt(0)}
                </div>
                <span className="font-semibold text-stone-700 text-sm">{review.authorName}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
