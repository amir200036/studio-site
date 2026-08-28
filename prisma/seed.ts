import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import dotenv from "dotenv";
import { DEFAULT_TERMS } from "../src/lib/default-terms";
import { pgSslFor } from "../src/lib/pg-ssl";

// .env.development.local (מסד הפיתוח המקומי) גובר על .env.local (פרודקשן מ-vercel env pull).
// dotenv לא דורס משתנה שכבר נטען, ולכן הקובץ הראשון מנצח.
dotenv.config({ path: ".env.development.local" });
dotenv.config({ path: ".env.local" });
dotenv.config();

const connectionString =
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL;

// מסיר sslmode מה-URL כדי ש-ssl option ינצח (דרוש בחיבור מ-Mac מקומי ל-Supabase)
let cleanedUrl = connectionString || "";
try {
  const parsed = new URL(cleanedUrl);
  parsed.searchParams.delete("sslmode");
  cleanedUrl = parsed.toString();
} catch { /* fallback to original */ }

const pool = new Pool({
  connectionString: cleanedUrl || undefined,
  ssl: pgSslFor(cleanedUrl),
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_DB_SEED !== "true") {
    console.error(
      "❌ seed חסום בפרודקשן. להרצה מכוונת: ALLOW_DB_SEED=true npm run db:seed"
    );
    process.exit(1);
  }

  console.log("🌱 מאכלס נתוני דמה...");

  await prisma.booking.deleteMany();
  await prisma.workshop.deleteMany();
  await prisma.fAQ.deleteMany();
  await prisma.event.deleteMany();
  await prisma.galleryImage.deleteMany();
  await prisma.review.deleteMany();
  await prisma.siteContent.deleteMany();

  // הגדרות אתר
  await prisma.siteContent.createMany({
    data: [
      { key: "hero_title", value: "יצירה מהלב, מהחמר" },
      { key: "hero_subtitle", value: "סדנאות קדרות לכולם — מתחילים ועד מנוסים. בואו לגלות את שמחת היצירה!" },
      { key: "hero_cta", value: "לסדנאות שלנו" },
      { key: "about_title", value: "על הסטודיו שלנו" },
      { key: "about_text", value: "סטודיו הקדרות שלנו הוא מקום שבו חמר הופך ליצירה ואנשים הופכים לאמנים.\n\nאנחנו מאמינים שיצירה ידנית מחברת אותנו לרגע, לחומר ולעצמנו. בסדנאות שלנו תמצאו אווירה חמה, מדריכים מנוסים ושפע של שמחת יצירה.\n\nמתאים לגמרי לאנשים ללא ניסיון קודם — כל מה שצריך זה רצון ליצור!" },
      { key: "stat_years", value: "5+" },
      { key: "stat_students", value: "800+" },
      { key: "stat_workshops", value: "300+" },
      { key: "hours", value: "ראשון–חמישי: 09:00–20:00\nשישי: 09:00–14:00\nשבת: סגור" },
      { key: "terms_content", value: DEFAULT_TERMS },
    ],
  });

  // סדנאות
  await prisma.workshop.createMany({
    data: [
      {
        name: "יסודות הקדרות",
        date: null,
        durationHours: 3,
        description: "סדנה מושלמת למתחילים! נלמד את יסודות עבודה עם חמר על גלגל הקדרות, נבנה כלי ראשון ונעצב אותו. לא נדרש ניסיון מוקדם — רק חשק גדול.",
        pricePerPerson: 180,
        maxParticipants: 8,
        status: "active",
      },
      {
        name: "ערב קדרות זוגי",
        date: null,
        durationHours: 2.5,
        description: "רומנטי, יצירתי ובלתי נשכח! ערב מיוחד לזוגות שבו תעבדו יחד על גלגל הקדרות. כוסות יין, מוזיקה ושפע של קסם.",
        pricePerPerson: 220,
        maxParticipants: 6,
        status: "active",
      },
      {
        name: "סדנת בניית ביד",
        date: null,
        durationHours: 2,
        description: "סדנה ייחודית לבניית כלים ביד — ללא גלגל קדרות. נלמד טכניקות מסורתיות לבניית קערות, פסלים וצלמיות. מתאים גם לילדים מגיל 10.",
        pricePerPerson: 150,
        maxParticipants: 10,
        status: "active",
      },
      {
        name: "סדנת מתקדמים — גלזור",
        date: null,
        durationHours: 4,
        description: "לאלה שכבר מכירים את הגלגל ורוצים לפתח את היצירות. נעסוק בטכניקות גלזור מתקדמות, שילוב צבעים ואפקטים מיוחדים.",
        pricePerPerson: 280,
        maxParticipants: 6,
        status: "active",
      },
    ],
  });

  // שאלות נפוצות
  await prisma.fAQ.createMany({
    data: [
      { question: "האם צריך ניסיון קודם?", answer: "לא! הסדנאות מותאמות לכל רמה. המדריכים ידריכו צעד אחר צעד.", order: 0 },
      { question: "מה כוללת הסדנה?", answer: "כל הציוד כלול — חמר, צבעים, כלי עבודה. לא צריך להביא כלום!", order: 1 },
      { question: "האם ניתן לקחת את היצירה הביתה?", answer: "בהחלט! יצירות ישלחו לאפייה ויהיו מוכנות לאיסוף תוך כשבוע.", order: 2 },
      { question: "מה מדיניות הביטול?", answer: "ביטול עד 48 שעות לפני — החזר מלא. פחות מ-48 שעות — ניתן להעביר את הכרטיס לאדם אחר.", order: 3 },
      { question: "האם מתאים לילדים?", answer: "סדנת 'בניית ביד' מתאימה לילדים מגיל 10. שאר הסדנאות לגיל 16+.", order: 4 },
      { question: "האם ניתן לבצע אירוע פרטי?", answer: "כן! אנחנו מארחים ימי הולדת, ימי גיבוש ואירועים פרטיים. צרו קשר ונתאים חבילה.", order: 5 },
    ],
  });

  // אירועים מיוחדים
  await prisma.event.createMany({
    data: [
      { name: "יום הולדת קדרות", description: "חגגו יום הולדת ייחודי ובלתי נשכח! מתאים לכל הגילאים. קבוצות 6–15 אנשים.", order: 0 },
      { name: "יום גיבוש עסקי", description: "חיזקו את הצוות דרך יצירה! חוויה ייחודית לחיזוק קשרים ועבודת צוות.", order: 1 },
      { name: "מסיבת רווקות", description: "מסיבת רווקות שלא תישכח! יצירתי, אישי ומהנה. כולל כוסות יין ואווירת ספא.", order: 2 },
      { name: "אירוע משפחתי", description: "זמן איכות משפחתי! צרו יחד יצירות שיזכרו לשנים. מתאים לכל הגילאים.", order: 3 },
    ],
  });

  // ביקורות
  await prisma.review.createMany({
    data: [
      { authorName: "ליאת כהן", content: "חוויה מדהימה! המדריכה הייתה סבלנית ומקצועית. חזרתי עם יצירה שאני גאה בה!", rating: 5, approved: true },
      { authorName: "דניאל לוי", content: "באתי עם חברים ליום הולדת וכולם יצאו עם חיוך. ממליץ בחום!", rating: 5, approved: true },
      { authorName: "שירה מזרחי", content: "הסדנה הזוגית הייתה רומנטית ומהנה. המדריכה יצרה אווירה נהדרת.", rating: 5, approved: true },
      { authorName: "עמית ברק", content: "לא ציפיתי שאוהב — אבל הרגשתי כל כך רגוע ושמח. מגיע שוב!", rating: 5, approved: true },
      { authorName: "נועה פרידמן", content: "מקום קסום, אנשים מקסימים. היצירה שיצרתי מתנוססת עכשיו בסלון!", rating: 5, approved: true },
    ],
  });

  console.log("✅ נתוני דמה הוכנסו בהצלחה!");
  console.log("📊 סדנאות: 4 | שאלות: 6 | אירועים: 4 | ביקורות: 5");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
