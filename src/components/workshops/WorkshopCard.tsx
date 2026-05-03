import Image from "next/image";
import Link from "next/link";
import type { Workshop, Booking } from "@prisma/client";
import { formatPrice, formatWorkshopSeatsAvailability, getAvailableSeats } from "@/lib/utils";

type WorkshopWithBookings = Workshop & { bookings: Pick<Booking, "seats" | "paymentStatus">[] };

interface Props {
  workshop: WorkshopWithBookings;
}

export function WorkshopCard({ workshop }: Props) {
  const available = getAvailableSeats(workshop.maxParticipants, workshop.bookings);

  const availabilityColor =
    available === 0 ? "text-red-500" : available <= 3 ? "text-orange-500" : "text-green-600";

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow border border-stone-100 hover:shadow-lg transition-shadow flex flex-col">
      <Link href={`/workshops/${workshop.id}`} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-t-2xl">
        {workshop.imageUrl ? (
          <div className="relative w-full h-48">
            <Image
              src={workshop.imageUrl}
              alt={workshop.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-amber-100 to-stone-200 flex items-center justify-center">
            <span className="text-6xl opacity-40">🏺</span>
          </div>
        )}
      </Link>

      <div className="p-5 flex flex-col gap-3 flex-1">
        <Link href={`/workshops/${workshop.id}`} className="hover:text-amber-800 transition-colors">
          <h2 className="text-xl font-bold text-stone-800">{workshop.name}</h2>
        </Link>

          <div className="flex flex-col gap-1 text-sm">
            <span className="text-amber-700 font-medium">⏱️ משך: {workshop.durationHours} שעות</span>
            <span className="text-stone-500">המועד יתואם ב-WhatsApp</span>
          </div>

        <p className="text-stone-600 text-sm leading-relaxed flex-1 line-clamp-4">{workshop.description}</p>

        <div className="flex justify-between items-center py-2 border-t border-stone-100">
          <span className="text-2xl font-extrabold text-amber-800">{formatPrice(workshop.pricePerPerson)}</span>
          <span className={`text-sm font-medium ${availabilityColor}`}>{formatWorkshopSeatsAvailability(available)}</span>
        </div>

        <Link
          href={`/workshops/${workshop.id}`}
          className="w-full py-3 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl transition-colors text-sm text-center"
        >
          פרטים והרשמה ב-WhatsApp
        </Link>
      </div>
    </div>
  );
}
