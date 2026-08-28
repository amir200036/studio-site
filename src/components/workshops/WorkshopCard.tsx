import Image from "next/image";
import Link from "next/link";
import type { Workshop, Booking } from "@prisma/client";
import { Clock, MessageCircle, Users } from "lucide-react";
import { formatPrice, formatWorkshopSeatsAvailability, getAvailableSeats } from "@/lib/utils";

type WorkshopWithBookings = Workshop & { bookings: Pick<Booking, "seats" | "paymentStatus">[] };

interface Props {
  workshop: WorkshopWithBookings;
}

export function WorkshopCard({ workshop }: Props) {
  const available = getAvailableSeats(workshop.maxParticipants, workshop.bookings);
  const hasImage = !!workshop.imageUrl?.trim();

  const availabilityColor =
    available === 0 ? "text-red-600" : available <= 3 ? "text-orange-600" : "text-green-700";

  return (
    <article className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-200/70 hover:shadow-xl hover:border-amber-200 hover:-translate-y-1 transition-all duration-200 flex flex-col">
      {hasImage ? (
        <Link
          href={`/workshops/${workshop.id}`}
          className="block relative w-full h-52 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          <Image
            src={workshop.imageUrl as string}
            alt={workshop.name}
            fill
            className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <span className="absolute bottom-3 start-3 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur text-amber-800 font-extrabold text-lg shadow-sm">
            {formatPrice(workshop.pricePerPerson)}
          </span>
        </Link>
      ) : (
        /* בלי תמונה לא מציגים מלבן ריק עם אימוג'י — פס מבטא צר והמחיר
           כגיבור הכרטיס. הכרטיס נראה מוגמר, לא חסר. */
        <div className="h-1.5 bg-gradient-to-l from-amber-500 via-amber-600 to-orange-500" aria-hidden="true" />
      )}

      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-3">
          <Link
            href={`/workshops/${workshop.id}`}
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded"
          >
            <h2 className="text-xl font-bold text-stone-800 group-hover:text-amber-800 transition-colors text-balance">
              {workshop.name}
            </h2>
          </Link>
          {!hasImage && (
            <span className="text-2xl font-extrabold text-amber-800 shrink-0 leading-none pt-0.5">
              {formatPrice(workshop.pricePerPerson)}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-stone-500">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />
            {workshop.durationHours} שעות
          </span>
          <span className={`inline-flex items-center gap-1.5 font-medium ${availabilityColor}`}>
            <Users className="w-4 h-4 shrink-0" aria-hidden="true" />
            {formatWorkshopSeatsAvailability(available)}
          </span>
        </div>

        <p className="text-stone-600 text-sm leading-relaxed flex-1 line-clamp-4">
          {workshop.description}
        </p>

        <Link
          href={`/workshops/${workshop.id}`}
          className="w-full py-3 min-h-12 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl transition-colors text-sm inline-flex items-center justify-center gap-2 mt-1"
        >
          <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          פרטים והרשמה
        </Link>
      </div>
    </article>
  );
}
