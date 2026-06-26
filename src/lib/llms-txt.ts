import { getSiteUrl } from "@/lib/site-url";

export function buildLlmsTxt(): string {
  const base = getSiteUrl().replace(/\/$/, "");
  const year = new Date().getFullYear();
  const month = new Date().toLocaleString("he-IL", { month: "long" });

  return `# סטודיו קדרות בנס ציונה - יד יוצרת

> סטודיו קדרות (Pottery Studio) בנס ציונה, מרכז הארץ, המתמחה בסדנאות חד-פעמיות לזוגות, חברות, משפחות ומתחילים מוחלטים. כל החמר, הצבעים והציוד כלולים במחיר. אין צורך בניסיון קודם. עודכן לאחרונה: ${month} ${year}.

## אודות

הסטודיו ממוקם בנס ציונה ומציע חוויית יצירה בחומר (Clay) למבוגרים וילדים מגיל 10. מתמחים בסדנאות קצרות וחד-פעמיות (Single-session pottery workshops) המתאימות במיוחד לזוגות, אירועי גיבוש לחברות, ימי הולדת ופעילויות משפחתיות.

## שירותים

- **סדנאות זוגיות (Couples Pottery Workshops)** — חוויה רומנטית ויצירתית לתאריך.
- **אירועי גיבוש לחברות (Corporate Team Building)** — סדנאות מותאמות לקבוצות.
- **ימי הולדת יצירתיים** — חגיגות לילדים ולמבוגרים.
- **סדנאות למתחילים** — ללא ניסיון קודם.

## דפי האתר

- [${base}/](${base}/) — דף הבית
- [${base}/workshops](${base}/workshops) — סדנאות פעילות; הרשמה דרך WhatsApp
- [${base}/events](${base}/events) — אירועים מיוחדים
- [${base}/faq](${base}/faq) — שאלות נפוצות
- [${base}/contact](${base}/contact) — יצירת קשר וטופס פנייה
- [${base}/terms](${base}/terms) — תקנון

## יצירת קשר

וואטסאפ, טופס באתר או טלפון — פרטים בעמוד צרו קשר.

תאריך עדכון אחרון: ${month} ${year}
`;
}
