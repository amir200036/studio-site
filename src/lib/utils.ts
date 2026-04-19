import type React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  return `₪${amount.toLocaleString("he-IL")}`;
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("he-IL", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleDateString("he-IL", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString("he-IL", {
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
