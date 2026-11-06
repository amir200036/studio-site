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

const PRICE_TOKENS = ["{{pricePerPerson}}", "{{total}}"];

/** תבנית ברירת מחדל (כש־whatsappMessage ריק בעריכת סדנה) */
const DEFAULT_WHATSAPP_TEMPLATE = `שלום! אני מעוניין/ת להירשם לסדנה {{workshopName}}
משך הסדנה: {{durationHours}} שעות
מספר מקומות: {{seats}}
שם מלא: {{customerName}}`;

export function buildDefaultWorkshopInquiryMessage(params: WorkshopWhatsAppParams): string {
  let msg = applyWorkshopWhatsAppTemplate(DEFAULT_WHATSAPP_TEMPLATE, params);
  const email = params.customerEmail?.trim();
  if (email) msg += `\nמייל: ${email}`;
  return msg;
}

/**
 * מילוי תבנית מותאמת מהמנהל.
 * משתנים: {{workshopName}}, {{customerName}}, {{seats}},
 * {{durationHours}}, {{date}}, {{time}} — שורות עם {{pricePerPerson}} / {{total}} מושמטות
 */
export function applyWorkshopWhatsAppTemplate(template: string, params: WorkshopWhatsAppParams): string {
  // המחיר לא מוצג באתר ולא נשלח בהודעה. תבנית ישנה מהפאנל עדיין עלולה להכיל
  // {{pricePerPerson}} או {{total}} — השורה כולה יורדת, כדי שלא תישאר "מחיר לאדם:" ריקה.
  template = template
    .split("\n")
    .filter((line) => !PRICE_TOKENS.some((token) => line.includes(token)))
    .join("\n");
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
