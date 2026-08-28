import Link from "next/link";
import type { Workshop, Booking } from "@prisma/client";
import { WorkshopCard } from "@/components/workshops/WorkshopCard";

type WorkshopWithBookings = Workshop & { bookings: Pick<Booking, "seats" | "paymentStatus">[] };

interface Props {
  workshops: WorkshopWithBookings[];
}

export function WorkshopsPreview({ workshops }: Props) {
  if (workshops.length === 0) return null;

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="w-12 h-1 bg-amber-500 rounded-full mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold text-amber-900">סדנאות קרובות</h2>
            <p className="text-stone-500 mt-2">הצטרפו אלינו לחוויה יצירתית בלתי נשכחת</p>
          </div>
          <Link
            href="/workshops"
            className="self-start md:self-auto text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1 underline-offset-4 hover:underline min-h-11"
          >
            כל הסדנאות ←
          </Link>
        </div>

        {/* אותו WorkshopCard כמו בעמוד הסדנאות — קודם הייתה כאן העתקה
            נפרדת של הכרטיס, שהתיישנה ברגע שהעיצוב השתנה */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {workshops.map((workshop) => (
            <WorkshopCard key={workshop.id} workshop={workshop} />
          ))}
        </div>
      </div>
    </section>
  );
}
