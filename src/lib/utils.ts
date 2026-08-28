import type React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  return `₪${amount.toLocaleString("he-IL")}`;
}

/** אזור הזמן של הסטודיו — ה-runtime של Vercel רץ ב-UTC */
const TZ = "Asia/Jerusalem";

export function formatDate(date: Date | string | null | undefined): string {
  if (date == null) return "—";
  return new Date(date).toLocaleDateString("he-IL", {
    timeZone: TZ,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** תאריך קצר לטבלאות — 28.8.2026 */
export function formatDateShort(date: Date | string | null | undefined): string {
  if (date == null) return "—";
  return new Date(date).toLocaleDateString("he-IL", {
    timeZone: TZ,
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (date == null) return "—";
  return new Date(date).toLocaleDateString("he-IL", {
    timeZone: TZ,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTime(date: Date | string | null | undefined): string {
  if (date == null) return "—";
  return new Date(date).toLocaleTimeString("he-IL", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const clean = phone.replace(/\D/g, "");
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

export function pageBackground(color: string, image: string): React.CSSProperties | undefined {
  if (image) return { backgroundImage: `url(${image})`, backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" };
  if (color) return { backgroundColor: color };
  return undefined;
}

export function getAvailableSeats(
  maxParticipants: number,
  bookings: { seats: number; paymentStatus: string }[]
): number {
  const booked = bookings
    .filter((b) => b.paymentStatus === "paid")
    .reduce((sum, b) => sum + b.seats, 0);
  return Math.max(0, maxParticipants - booked);
}

/** תצוגה ללקוחות: "עד N מקומות" (במקום "N מקומות פנויים"). כשאין מקומות — "אין מקומות". */
export function formatWorkshopSeatsAvailability(available: number): string {
  if (available <= 0) return "אין מקומות";
  if (available === 1) return "עד מקום אחד";
  return `עד ${available} מקומות`;
}
