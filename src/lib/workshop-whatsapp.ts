import { buildWhatsAppUrl, formatDate, formatPrice, formatTime } from "@/lib/utils";

/** טקסט כשאין מועד קבוע בסדנה (בתבניות מותאמות) */
export const WORKSHOP_DATE_TBD_HE = "יתואם ב-WhatsApp";

export type WorkshopWhatsAppParams = {
  workshopName: string;
  /** מועד קבוע בסדנה — אם חסר, לא מוצגים תאריך/שעה בהודעת ברירת המחדל */
  workshopDate?: Date | string | null;
  durationHours: number;
  pricePerPerson: number;
  seats: number;
  total: number;
  customerName: string;
  /** אופציונלי — אם ריק לא מוצג בברירת המחדל */
  customerEmail?: string;
};

/** תבנית ברירת מחדל (כש־whatsappMessage ריק בעריכת סדנה) */
export function buildDefaultWorkshopInquiryMessage(params: WorkshopWhatsAppParams): string {
  const d = params.workshopDate != null && params.workshopDate !== "" ? new Date(params.workshopDate) : null;
  const lines = [
    "שלום! אני מעוניין/ת להירשם לסדנה (פנייה מהאתר):",
    "",
    `סדנה: ${params.workshopName}`,
  ];
  if (d && !Number.isNaN(d.getTime())) {
    lines.push(`תאריך: ${formatDate(d)} בשעה ${formatTime(d)}`);
  } else {
    lines.push(`מועד: ${WORKSHOP_DATE_TBD_HE}`);
  }
  lines.push(
    `משך: ${params.durationHours} שעות`,
    `מחיר לאדם: ${formatPrice(params.pricePerPerson)}`,
    `מספר מקומות: ${params.seats}`,
    `סכום משוער: ${formatPrice(params.total)}`,
    "",
    `שם מלא: ${params.customerName}`
  );
  const email = params.customerEmail?.trim();
  if (email) lines.push(`מייל: ${email}`);
  return lines.join("\n");
}

/**
 * מילוי תבנית מותאמת מהמנהל.
 * מציינים: {{workshopName}}, {{customerName}}, {{customerEmail}}, {{seats}},
 * {{pricePerPerson}}, {{total}}, {{date}}, {{time}}, {{durationHours}}
 * ללא מועד קבוע: {{date}} ו-{{time}} יתמלאו ב־"יתואם ב-WhatsApp"
 */
export function applyWorkshopWhatsAppTemplate(template: string, params: WorkshopWhatsAppParams): string {
  const raw = params.workshopDate;
  const d = raw != null && raw !== "" ? new Date(raw) : null;
  const hasRealDate = d != null && !Number.isNaN(d.getTime());
  const map: Record<string, string> = {
    workshopName: params.workshopName,
    customerName: params.customerName,
    customerEmail: params.customerEmail?.trim() ?? "",
    seats: String(params.seats),
    pricePerPerson: formatPrice(params.pricePerPerson),
    total: formatPrice(params.total),
    date: hasRealDate && d ? formatDate(d) : WORKSHOP_DATE_TBD_HE,
    time: hasRealDate && d ? formatTime(d) : WORKSHOP_DATE_TBD_HE,
    durationHours: String(params.durationHours),
  };
  let out = template;
  for (const [key, val] of Object.entries(map)) {
    out = out.split(`{{${key}}}`).join(val);
  }
  return out;
}

export function buildWorkshopInquiryMessage(
  params: WorkshopWhatsAppParams,
  customTemplate?: string | null
): string {
  const t = customTemplate?.trim();
  if (t) return applyWorkshopWhatsAppTemplate(t, params);
  return buildDefaultWorkshopInquiryMessage(params);
}

export function workshopWhatsAppHref(
  params: WorkshopWhatsAppParams,
  phone: string,
  customTemplate?: string | null
): string {
  const message = buildWorkshopInquiryMessage(params, customTemplate);
  return buildWhatsAppUrl(phone, message);
}
