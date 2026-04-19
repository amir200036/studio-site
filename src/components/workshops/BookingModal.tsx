"use client";

import { useState } from "react";
import Link from "next/link";
import type { Workshop, Booking } from "@prisma/client";
import { formatPrice, getAvailableSeats } from "@/lib/utils";
import { X, Loader2 } from "lucide-react";

type WorkshopWithBookings = Workshop & { bookings: Pick<Booking, "seats" | "paymentStatus">[] };

interface Props {
  workshop: WorkshopWithBookings;
  onClose: () => void;
}

export function BookingModal({ workshop, onClose }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [seats, setSeats] = useState(1);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [retryable, setRetryable] = useState(false);

  const available = getAvailableSeats(workshop.maxParticipants, workshop.bookings);
  const maxSeats = Math.min(4, available);
  const total = workshop.pricePerPerson * seats;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setRetryable(false);
    setLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workshopId: workshop.id, customerName: name, customerEmail: email, seats }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "אירעה שגיאה, נסו שוב.");
        setRetryable(true);
        return;
      }

      // הפנייה לדף תשלום Stripe
      window.location.href = data.url;
    } catch {
      setError("אירעה שגיאה בחיבור לשרת.");
      setRetryable(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 rounded-lg hover:bg-stone-100 transition-colors"
          aria-label="סגור"
        >
          <X className="w-5 h-5 text-stone-500" />
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-amber-900 mb-1">הרשמה לסדנה</h2>
          <p className="text-stone-500 text-sm mb-6">{workshop.name}</p>

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
              <label className="block text-sm font-medium text-stone-700 mb-1">
                מספר מקומות (עד {maxSeats})
              </label>
              <select
                value={seats}
                onChange={(e) => setSeats(Number(e.target.value))}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
              >
                {Array.from({ length: maxSeats }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>{n} {n === 1 ? "מקום" : "מקומות"}</option>
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

            {error && (
              <div className="bg-red-50 px-4 py-3 rounded-lg flex items-center justify-between gap-3">
                <p className="text-red-600 text-sm">{error}</p>
                {retryable && (
                  <button
                    type="submit"
                    className="text-xs font-bold text-red-700 underline whitespace-nowrap"
                  >
                    נסה שוב
                  </button>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-700 hover:bg-amber-800 disabled:bg-stone-300 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {loading ? "מעבד..." : `לתשלום — ${formatPrice(total)}`}
            </button>
            <p className="text-xs text-stone-400 text-center">תשלום מאובטח דרך Stripe</p>
          </form>
        </div>
      </div>
    </div>
  );
}
