import { buildWhatsAppUrl, formatDate, formatPrice, formatTime } from "@/lib/utils";

export function buildWorkshopInquiryMessage(params: {
  workshopName: string;
  workshopDate: Date | string;
  durationHours: number;
  pricePerPerson: number;
  seats: number;
  total: number;
  customerName: string;
  customerEmail: string;
}): string {
  const d = new Date(params.workshopDate);
  return [
    "שלום! אני מעוניין/ת להירשם לסדנה (פנייה מהאתר):",
    "",
    `סדנה: ${params.workshopName}`,
    `תאריך: ${formatDate(d)} בשעה ${formatTime(d)}`,
    `משך: ${params.durationHours} שעות`,
    `מחיר לאדם: ${formatPrice(params.pricePerPerson)}`,
    `מספר מקומות: ${params.seats}`,
    `סכום משוער: ${formatPrice(params.total)}`,
    "",
    `שם מלא: ${params.customerName}`,
    `מייל: ${params.customerEmail}`,
  ].join("\n");
}

export function workshopWhatsAppHref(params: Parameters<typeof buildWorkshopInquiryMessage>[0], phone: string): string {
  const message = buildWorkshopInquiryMessage(params);
  return buildWhatsAppUrl(phone, message);
}
