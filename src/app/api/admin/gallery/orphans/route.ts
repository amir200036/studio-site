import { NextRequest, NextResponse } from "next/server";
import { list } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/require-admin";
import { IMAGE_CONTENT_KEYS } from "@/lib/site-content-keys";
import { revalidateSite } from "@/lib/revalidate-site";

export type OrphanBlob = { url: string; size: number; uploadedAt: string };

/**
 * קבצים שקיימים ב-Vercel Blob אך אף רשומה במסד לא מפנה אליהם.
 * נוצרים כשהעלאה ל-Blob מצליחה והכתיבה ל-DB אחריה נכשלת, או כשהמסד
 * אבד את ההפניות. הקבצים עצמם שלמים — רק הקישור אליהם חסר.
 */
async function collectReferencedUrls(): Promise<Set<string>> {
  const [gallery, workshops, events, content] = await Promise.all([
    prisma.galleryImage.findMany({ select: { url: true } }),
    prisma.workshop.findMany({ where: { imageUrl: { not: null } }, select: { imageUrl: true } }),
    prisma.event.findMany({ where: { imageUrl: { not: null } }, select: { imageUrl: true } }),
    prisma.siteContent.findMany({
      where: { key: { in: [...IMAGE_CONTENT_KEYS] } },
      select: { value: true },
    }),
  ]);

  const referenced = new Set<string>();
  gallery.forEach((g) => referenced.add(g.url.trim()));
  workshops.forEach((w) => w.imageUrl && referenced.add(w.imageUrl.trim()));
  events.forEach((e) => e.imageUrl && referenced.add(e.imageUrl.trim()));
  content.forEach((c) => c.value.trim() && referenced.add(c.value.trim()));
  return referenced;
}

export async function GET() {
  const { error } = await requireAdminSession();
  if (error) return error;

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "אחסון התמונות אינו מוגדר בסביבה הזו." },
      { status: 503 }
    );
  }

  try {
    const referenced = await collectReferencedUrls();

    const orphans: OrphanBlob[] = [];
    let cursor: string | undefined;
    do {
      const page = await list({ limit: 1000, cursor });
      for (const b of page.blobs) {
        if (!referenced.has(b.url.trim())) {
          orphans.push({
            url: b.url,
            size: b.size,
            uploadedAt: new Date(b.uploadedAt).toISOString(),
          });
        }
      }
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);

    orphans.sort((a, b) => a.uploadedAt.localeCompare(b.uploadedAt));
    return NextResponse.json({ orphans });
  } catch (e) {
    console.error("[gallery/orphans]", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "לא ניתן לקרוא את מאגר התמונות." }, { status: 502 });
  }
}

/** מייבא כתובות נבחרות לספריית התמונות */
export async function POST(req: NextRequest) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const body = await req.json().catch(() => null);
  const urls: unknown = (body as { urls?: unknown } | null)?.urls;
  if (!Array.isArray(urls) || urls.length === 0) {
    return NextResponse.json({ error: "לא נבחרו תמונות" }, { status: 400 });
  }

  // מייבאים רק כתובות שהן באמת יתומות עכשיו — לא סומכים על מה שהדפדפן שלח
  const orphanUrls = new Set<string>();
  try {
    const referenced = await collectReferencedUrls();
    let cursor: string | undefined;
    do {
      const page = await list({ limit: 1000, cursor });
      page.blobs.forEach((b) => {
        if (!referenced.has(b.url.trim())) orphanUrls.add(b.url.trim());
      });
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);
  } catch (e) {
    console.error("[gallery/orphans:import]", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "לא ניתן לקרוא את מאגר התמונות." }, { status: 502 });
  }

  const toImport = urls
    .filter((u): u is string => typeof u === "string")
    .map((u) => u.trim())
    .filter((u) => orphanUrls.has(u));

  if (toImport.length === 0) {
    return NextResponse.json({ error: "אף אחת מהתמונות אינה יתומה" }, { status: 400 });
  }

  const startOrder = await prisma.galleryImage.count();
  const created = await prisma.galleryImage.createMany({
    data: toImport.map((url, i) => ({ url, order: startOrder + i, showOnHomepage: false })),
  });

  const images = await prisma.galleryImage.findMany({ orderBy: { order: "asc" } });
  revalidateSite();
  return NextResponse.json({ imported: created.count, images });
}
