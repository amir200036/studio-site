"use client";

import type { Workshop, Booking } from "@prisma/client";
import { useState } from "react";
import { formatDate, formatTime, formatPrice, getAvailableSeats } from "@/lib/utils";
import { BookingModal } from "./BookingModal";

type WorkshopWithBookings = Workshop & { bookings: Pick<Booking, "seats" | "paymentStatus">[] };

interface Props {
  workshop: WorkshopWithBookings;
}

export function WorkshopCard({ workshop }: Props) {
  const [showModal, setShowModal] = useState(false);
  const available = getAvailableSeats(workshop.maxParticipants, workshop.bookings);

  const availabilityColor =
    available === 0 ? "text-red-500" : available <= 3 ? "text-orange-500" : "text-green-600";

  return (
    <>
      <div className="bg-white rounded-2xl overflow-hidden shadow border border-stone-100 hover:shadow-lg transition-shadow flex flex-col">
        {workshop.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={workshop.imageUrl} alt={workshop.name} className="w-full h-48 object-cover" />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-amber-100 to-stone-200 flex items-center justify-center">
            <span className="text-6xl opacity-40">🏺</span>
          </div>
        )}

        <div className="p-5 flex flex-col gap-3 flex-1">
          <h2 className="text-xl font-bold text-stone-800">{workshop.name}</h2>

          <div className="flex flex-col gap-1 text-sm">
            <span className="text-amber-700 font-medium">📅 {formatDate(workshop.date)}</span>
            <span className="text-stone-500">🕐 {formatTime(workshop.date)} · {workshop.durationHours} שעות</span>
          </div>

          <p className="text-stone-600 text-sm leading-relaxed flex-1">{workshop.description}</p>

          <div className="flex justify-between items-center py-2 border-t border-stone-100">
            <span className="text-2xl font-extrabold text-amber-800">{formatPrice(workshop.pricePerPerson)}</span>
            <span className={`text-sm font-medium ${availabilityColor}`}>
              {available} מקומות פנויים
            </span>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="w-full py-3 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl transition-colors text-sm"
          >
            הרשמה לסדנה
          </button>
        </div>
      </div>

      {showModal && (
        <BookingModal workshop={workshop} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
