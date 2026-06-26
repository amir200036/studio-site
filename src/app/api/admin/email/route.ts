import { NextRequest, NextResponse } from "next/server";
import { sendCustomEmail } from "@/lib/email";
import { parseAdminEmailInput } from "@/lib/admin-api-validation";
import { requireAdminSession } from "@/lib/require-admin";

export async function POST(req: NextRequest) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const body = await req.json();
  const data = parseAdminEmailInput(body, true);
  if (!data?.to) return NextResponse.json({ error: "נתוני מייל לא תקינים" }, { status: 400 });

  const ok = await sendCustomEmail(data.to, data.subject, data.body);
  if (!ok) {
    return NextResponse.json({ error: "שליחת המייל נכשלה" }, { status: 502 });
  }
  return NextResponse.json({ success: true });
}
