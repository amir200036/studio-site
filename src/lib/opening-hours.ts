/**
 * ממיר את שעות הפעילות שנערכות בפאנל (טקסט חופשי) ל-openingHoursSpecification
 * של schema.org, עבור ה-JSON-LD של העסק.
 *
 * הטקסט נכתב ביד, ולכן הכלל הוא "הכול או כלום": אם שורה אחת לא מתפרשת,
 * מחזירים null ולא מפרסמים שעות בכלל. שעות שגויות בגוגל גרועות מהיעדר שעות.
 *
 * פורמט נתמך, שורה לכל טווח:
 *   ראשון–חמישי: 09:00–20:00
 *   שישי: 09:00–14:00
 *   שבת: סגור
 */

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

type DayOfWeek = (typeof DAYS)[number];

export interface OpeningHoursSpecification {
  "@type": "OpeningHoursSpecification";
  dayOfWeek: DayOfWeek[];
  opens: string;
  closes: string;
}

const DAY_NAMES: Record<string, number> = {
  ראשון: 0,
  שני: 1,
  שלישי: 2,
  רביעי: 3,
  חמישי: 4,
  שישי: 5,
  שבת: 6,
  א: 0,
  ב: 1,
  ג: 2,
  ד: 3,
  ה: 4,
  ו: 5,
};

function parseDay(raw: string): number | null {
  const name = raw
    .trim()
    .replace(/^יום\s+/, "")
    .replace(/['׳"״]/g, "")
    .trim();
  return name in DAY_NAMES ? DAY_NAMES[name] : null;
}

function parseTime(raw: string): string | null {
  const m = raw.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 24 || min > 59) return null;
  return `${String(h).padStart(2, "0")}:${m[2]}`;
}

// מקף רגיל, מקף en ומקף em — כולם מופיעים בטקסט שמוקלד בטלפון
const RANGE = /\s*[-–—]\s*/;

export function parseOpeningHours(text: string | undefined | null): OpeningHoursSpecification[] | null {
  if (!text?.trim()) return null;

  const specs: OpeningHoursSpecification[] = [];

  for (const line of text.split("\n").map((l) => l.trim()).filter(Boolean)) {
    const sep = line.indexOf(":");
    if (sep === -1) return null;
    const daysPart = line.slice(0, sep);
    const timesPart = line.slice(sep + 1).trim();

    const dayBounds = daysPart.split(RANGE);
    if (dayBounds.length > 2) return null;
    const from = parseDay(dayBounds[0]);
    const to = dayBounds.length === 2 ? parseDay(dayBounds[1]) : from;
    if (from === null || to === null || to < from) return null;

    if (/^סגור/.test(timesPart)) continue;

    const timeBounds = timesPart.split(RANGE);
    if (timeBounds.length !== 2) return null;
    const opens = parseTime(timeBounds[0]);
    const closes = parseTime(timeBounds[1]);
    if (!opens || !closes) return null;

    specs.push({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: DAYS.slice(from, to + 1),
      opens,
      closes,
    });
  }

  return specs.length > 0 ? specs : null;
}
