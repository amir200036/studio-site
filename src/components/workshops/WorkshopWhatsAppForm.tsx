"use client";

import { useState } from "react";
import Link from "next/link";
import type { Workshop, Booking } from "@prisma/client";
import { formatPrice, getAvailableSeats } from "@/lib/utils";
import { workshopWhatsAppHref } from "@/lib/workshop-whatsapp";

type WorkshopWithBookings = Workshop & { bookings: Pick<Booking, "seats" | "paymentStatus">[] };

interface Props {
  workshop: WorkshopWithBookings;
  onSubmitted?: () => void;
}

export function WorkshopWhatsAppForm({ workshop, onSubmitted }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [seats, setSeats] = useState(1);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState("");

  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";
  const available = getAvailableSeats(workshop.maxParticipants, workshop.bookings);
  const maxSeats = Math.min(4, available);
  const total = workshop.pricePerPerson * seats;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!waNumber.replace(/\D/g, "")) {
      setError("מספר WhatsApp לא הוגדר באתר. צרו קשר בטלפון או בעמוד צרו קשר.");
      return;
    }
    const href = workshopWhatsAppHref(
      {
        workshopName: workshop.name,
        workshopDate: workshop.date,
        durationHours: workshop.durationHours,
        pricePerPerson: workshop.pricePerPerson,
        seats,
        total,
        customerName: name.trim(),
        customerEmail: email.trim(),
      },
      waNumber
    );
    window.open(href, "_blank", "noopener,noreferrer");
    onSubmitted?.();
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
      <h2 className="text-xl font-bold text-amber-900 mb-1">הרשמה ב-WhatsApp</h2>
      <p className="text-stone-500 text-sm mb-6">מלאו את הפרטים — נפתח WhatsApp עם הודעה מוכנה לשליחה.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">שם מלא *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            placeholder="ישראל ישראלי"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">כתובת מייל *</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            placeholder="israel@example.com"
            dir="ltr"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">מספר מקומות (עד {maxSeats})</label>
          <select
            value={seats}
            onChange={(e) => setSeats(Number(e.target.value))}
            className="w-full border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
          >
            {Array.from({ length: maxSeats }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "מקום" : "מקומות"}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-amber-50 rounded-xl p-4 flex justify-between items-center">
          <span className="text-stone-600 text-sm">
            {seats} × {formatPrice(workshop.pricePerPerson)}
          </span>
          <span className="font-extrabold text-xl text-amber-800">{formatPrice(total)}</span>
        </div>

        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            required
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded accent-amber-700 flex-shrink-0"
          />
          <span className="text-sm text-stone-600 leading-snug">
            קראתי ואני מסכים/ה ל
            <Link href="/terms" target="_blank" className="text-amber-700 underline hover:text-amber-800 mx-1">
              תקנון האתר
            </Link>
          </span>
        </label>

        {error && <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

        <button
          type="submit"
          className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          שליחה ב-WhatsApp — {formatPrice(total)}
        </button>
        <p className="text-xs text-stone-400 text-center">
          נפתח חלון WhatsApp עם פרטי הבקשה. שמירת מקום ותשלום — מול הסטודיו.
        </p>
      </form>
    </div>
  );
}
