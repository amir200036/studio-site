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

/** משתנים שאין להם ערך כשהלקוח רק לוחץ "דברו איתנו" בלי למלא טופס */
const FORM_ONLY_TOKENS = ["{{customerName}}", "{{customerEmail}}", "{{seats}}"];

type InterestWorkshop = {
  name: string;
  date?: Date | string | null;
  durationHours: number;
  whatsappMessage?: string | null;
};

/**
 * ההודעה שנפתחת כשלוחצים "דברו איתנו ב-WhatsApp" בדף הסדנה — לחיצה אחת, בלי טופס.
 * אם המנהל שמר תבנית לסדנה, היא משמשת בלי השורות שתלויות בטופס (שם, מקומות)
 * ובלי שורות המחיר. אחרת — הודעה קצרה עם שם הסדנה.
 */
export function workshopInterestMessage(workshop: InterestWorkshop): string {
  const template = workshop.whatsappMessage
    ?.split("\n")
    .filter((line) => !FORM_ONLY_TOKENS.some((token) => line.includes(token)))
    .join("\n")
    .trim();
  if (!template) return `שלום! אשמח לקבל פרטים על ${workshop.name} 🙂`;
  return applyWorkshopWhatsAppTemplate(template, {
    workshopName: workshop.name,
    workshopDate: workshop.date ?? null,
    durationHours: workshop.durationHours,
    pricePerPerson: 0,
    seats: 1,
    total: 0,
    customerName: "",
  });
}

export function workshopInterestWhatsAppHref(workshop: InterestWorkshop, phone: string): string {
  return buildWhatsAppUrl(phone, workshopInterestMessage(workshop));
}
