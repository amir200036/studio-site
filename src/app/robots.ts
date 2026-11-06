import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

// נשמר ב-CDN ומתרענן כל 5 דקות. כל שמירה באדמין קוראת ל-revalidatePath
// ומרעננת מיד, כך שאין המתנה לשינוי תוכן.
export const revalidate = 300;

// בוטי AI מורשים במפורש: האתר רוצה להופיע בתשובות של מנועי AI.
const AI_BOTS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "anthropic-ai",
  "Claude-Web",
  "PerplexityBot",
  "Google-Extended",
  "CCBot",
  "cohere-ai",
  "Bytespider",
];

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl().replace(/\/$/, "");

  // Preview ופיתוח לא נכנסים למנועי חיפוש — אחרת כתובת ה-preview עלולה
  // להתאנדקס ולהתחרות באתר החי. VERCEL_ENV מוגדר תמיד על ידי Vercel.
  if (process.env.VERCEL_ENV !== "production") {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  // בוט מציית רק לקבוצה שנכתבה עבורו ומתעלם מ-"*". לכן ההחרגות חוזרות בכל
  // קבוצה — אחרת בוטי ה-AI מורשים לסרוק גם את /admin ואת /api/.
  const disallow = ["/admin", "/api/"];

  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      ...AI_BOTS.map((userAgent) => ({ userAgent, allow: "/", disallow })),
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
