import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { filterAllowedSiteContent, IMAGE_CONTENT_KEYS } from "@/lib/site-content-keys";
import { collectReplacedImageUrls, deleteBlobIfUnreferenced } from "@/lib/blob-cleanup";
import { revalidateSite } from "@/lib/revalidate-site";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const raw: Record<string, string> = await req.json().catch(() => null);
  if (!raw || typeof raw !== "object") {
    return NextResponse.json({ error: "גוף בקשה לא תקין" }, { status: 400 });
  }

  const { data, rejected } = filterAllowedSiteContent(raw);
  if (rejected.length > 0) {
    return NextResponse.json(
      { error: `כתובת תמונה לא חוקית: ${rejected.join(", ")}` },
      { status: 400 }
    );
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "אין מפתחות תקינים לעדכון" }, { status: 400 });
  }

  // הערכים הקודמים של מפתחות התמונה — כדי לנקות קובץ שהוחלף
  const imageKeys = IMAGE_CONTENT_KEYS.filter((k) => k in data);
  const previous = imageKeys.length
    ? await prisma.siteContent.findMany({
        where: { key: { in: [...imageKeys] } },
        select: { key: true, value: true },
      })
    : [];

  await Promise.all(
    Object.entries(data).map(([key, value]) =>
      prisma.siteContent.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
    )
  );

  for (const url of collectReplacedImageUrls(previous, data)) {
    await deleteBlobIfUnreferenced(url);
  }

  revalidateSite();
  return NextResponse.json({ success: true });
}
