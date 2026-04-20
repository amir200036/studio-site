import type { Review } from "@prisma/client";

interface Props {
  reviews: Review[];
  transparent?: boolean;
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

export function ReviewsSection({ reviews, transparent }: Props) {
  if (reviews.length === 0) return null;

  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="w-12 h-1 bg-amber-500 rounded-full mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold text-amber-900">מה אומרים עלינו</h2>
          <p className="text-stone-500 mt-2">ביקורות אמיתיות מלקוחות מרוצים</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white p-6 rounded-2xl shadow-sm border border-amber-100 flex flex-col gap-3"
            >
              <StarRating rating={review.rating} />
              <p className="text-stone-600 leading-relaxed flex-1">&quot;{review.content}&quot;</p>
              <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
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
