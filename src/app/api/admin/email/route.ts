import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendCustomEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { to, subject, body } = await req.json();
  if (typeof to !== "string" || typeof subject !== "string" || typeof body !== "string") {
    return NextResponse.json({ error: "קלט לא תקין" }, { status: 400 });
  }
  const ok = await sendCustomEmail(to, subject, body);
  if (!ok) {
    return NextResponse.json({ error: "שליחת המייל נכשלה" }, { status: 502 });
  }
  return NextResponse.json({ success: true });
}
