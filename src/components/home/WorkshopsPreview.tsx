import Image from "next/image";
import Link from "next/link";
import type { Workshop, Booking } from "@prisma/client";
import { formatDate, formatTime, formatPrice, getAvailableSeats } from "@/lib/utils";

type WorkshopWithBookings = Workshop & { bookings: Pick<Booking, "seats" | "paymentStatus">[] };

interface Props {
  workshops: WorkshopWithBookings[];
}

export function WorkshopsPreview({ workshops }: Props) {
  if (workshops.length === 0) return null;

  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="w-12 h-1 bg-amber-500 rounded-full mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold text-amber-900">סדנאות קרובות</h2>
            <p className="text-stone-500 mt-2">הצטרפו אלינו לחוויה יצירתית בלתי נשכחת</p>
          </div>
          <Link
            href="/workshops"
            className="self-start md:self-auto text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1 underline-offset-4 hover:underline"
          >
            כל הסדנאות ←
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {workshops.map((workshop) => {
            const available = getAvailableSeats(workshop.maxParticipants, workshop.bookings);
            return (
              <div
                key={workshop.id}
                className="bg-stone-50 rounded-2xl overflow-hidden shadow-sm border border-stone-100 hover:shadow-md transition-shadow flex flex-col"
              >
                {workshop.imageUrl ? (
                  <div className="relative w-full h-44">
                    <Image
                      src={workshop.imageUrl}
                      alt={workshop.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                ) : (
                  <div className="w-full h-44 bg-amber-100 flex items-center justify-center">
                    <span className="text-5xl opacity-40">🏺</span>
                  </div>
                )}
                <div className="p-5 flex flex-col gap-2 flex-1">
                  <h3 className="font-bold text-lg text-stone-800">{workshop.name}</h3>
                  <p className="text-sm text-amber-700">{formatDate(workshop.date)}</p>
                  <p className="text-xs text-stone-400">{formatTime(workshop.date)} · {workshop.durationHours} שעות</p>
                  <p className="text-stone-600 text-sm line-clamp-2 flex-1">{workshop.description}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-bold text-amber-800 text-lg">{formatPrice(workshop.pricePerPerson)}</span>
                    <span className="text-xs text-stone-400">{available} מקומות פנויים</span>
                  </div>
                  <Link
                    href="/workshops"
                    className="mt-2 text-center py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-semibold text-sm transition-colors"
                  >
                    להרשמה ←
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
