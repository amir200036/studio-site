import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { securityLog } from "@/lib/security-log";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * פנייה יומית למסד (vercel.json → crons).
 *
 * פרויקט Supabase חינמי מושהה אחרי כשבוע בלי פעילות, והאתר החי הציג אז
 * תוכן ריק בלי שאיש שם לב. שאילתה אחת ביום מספיקה כדי שזה לא יקרה.
 * אם CRON_SECRET מוגדר ב-Vercel, Cron שולח Authorization: Bearer <CRON_SECRET>
 * ורק בקשה כזו מתקבלת. בלעדיו הנתיב פתוח — הוא מריץ SELECT 1 ולא מחזיר מידע —
 * ומוגבל בקצב כדי שאי אפשר יהיה להשתמש בו להצפת המסד.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!secret) {
    const { allowed } = rateLimit(getClientIp(req), "keepalive", { maxRequests: 3, windowMs: 60_000 });
    if (!allowed) return NextResponse.json({ error: "too many requests" }, { status: 429 });
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true });
  } catch {
    securityLog("database_query_failed", { route: "/api/cron/keepalive", category: "keepalive", outcome: "fatal" });
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
