import { NextRequest, NextResponse } from "next/server";
import { sendContactFormEmail } from "@/lib/email";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { STUDIO_EMAIL } from "@/lib/studio-contact";

export async function POST(req: NextRequest) {
  // Rate limiting — 3 פניות לדקה
  const ip = getClientIp(req);
  const { allowed } = rateLimit(ip, "contact", { maxRequests: 3, windowMs: 60_000 });
  if (!allowed) {
    return NextResponse.json({ error: "יותר מדי הודעות. נסו שוב בעוד דקה." }, { status: 429 });
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "קלט לא תקין." }, { status: 400 });
    }
    const { name, email, message } = body as Record<string, unknown>;

    if (!name || !email || !message) {
      return NextResponse.json({ error: "כל השדות נדרשים." }, { status: 400 });
    }

    if (typeof name !== "string" || typeof email !== "string" || typeof message !== "string") {
      return NextResponse.json({ error: "קלט לא תקין." }, { status: 400 });
    }

    if (name.length > 100 || message.length > 2000) {
      return NextResponse.json({ error: "הקלט ארוך מדי." }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || email.length > 254) {
      return NextResponse.json({ error: "כתובת מייל לא תקינה." }, { status: 400 });
    }

    const sent = await sendContactFormEmail(STUDIO_EMAIL, name, email, message);

    if (!sent) {
      return NextResponse.json(
        { error: "שליחת המייל נכשלה. נסו שוב מאוחר יותר או צרו קשר ב-WhatsApp." },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "שגיאה בשליחה." }, { status: 500 });
  }
}
