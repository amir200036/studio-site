import { NextRequest, NextResponse } from "next/server";
import { sendCustomEmail } from "@/lib/email";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  // Rate limiting — 3 פניות לדקה
  const ip = getClientIp(req);
  const { allowed } = rateLimit(ip, "contact", { maxRequests: 3, windowMs: 60_000 });
  if (!allowed) {
    return NextResponse.json({ error: "יותר מדי הודעות. נסו שוב בעוד דקה." }, { status: 429 });
  }

  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "כל השדות נדרשים." }, { status: 400 });
    }

    const adminEmail = process.env.ADMIN_EMAIL || "";
    await sendCustomEmail(
      adminEmail,
      `פנייה חדשה מ-${name}`,
      `שם: ${name}\nמייל: ${email}\n\nהודעה:\n${message}`
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "שגיאה בשליחה." }, { status: 500 });
  }
}
