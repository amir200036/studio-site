import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { filterAllowedSiteContent } from "@/lib/site-content-keys";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const raw: Record<string, string> = await req.json();
  const data = filterAllowedSiteContent(raw);

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "אין מפתחות תקינים לעדכון" }, { status: 400 });
  }

  await Promise.all(
    Object.entries(data).map(([key, value]) =>
      prisma.siteContent.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
    )
  );

  return NextResponse.json({ success: true });
}
