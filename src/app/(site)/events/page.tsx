// נשמר ב-CDN ומתרענן כל 5 דקות. כל שמירה באדמין קוראת ל-revalidatePath
// ומרעננת מיד, כך שאין המתנה לשינוי תוכן.
export const revalidate = 300;
import type { Metadata } from "next";
import Image from "next/image";
import { MessageCircle } from "lucide-react";
import { cardGrid } from "@/lib/card-grid";
import { prisma } from "@/lib/prisma";
import { buildWhatsAppUrl, pageBackground } from "@/lib/utils";
import { getSiteUrl, OG_IMAGE } from "@/lib/site-url";
import { safeDbQuery } from "@/lib/safe-db";
import { resolveWhatsAppNumber } from "@/lib/whatsapp-number";

const siteUrl = getSiteUrl().replace(/\/$/, "");

export const metadata: Metadata = {
  title: "אירועים מיוחדים וגיבוש חברה",
  description:
    "ימי הולדת, גיבוש חברה ואירועים מיוחדים בסדנת קדרות בנס ציונה. חוויה ייחודית שכולם ייזכרו — צרו קשר לפרטים.",
  alternates: {
    canonical: `${siteUrl}/events`,
  },
  openGraph: {
    images: [OG_IMAGE],
    title: "אירועים מיוחדים וגיבוש חברה | יד יוצרת — סדנת קדרות בנס ציונה",
    description:
      "ימי הולדת, גיבוש חברה ואירועים מיוחדים בסדנת קדרות בנס ציונה. חוויה ייחודית שכולם ייזכרו — צרו קשר לפרטים.",
    url: `${siteUrl}/events`,
    locale: "he_IL",
    type: "website",
    siteName: "יד יוצרת — סדנת קדרות",
  },
};

async function getEvents() {
  return safeDbQuery(async () => {
    const [events, rows] = await Promise.all([
      prisma.event.findMany({ where: { active: true }, orderBy: { order: "asc" } }),
      prisma.siteContent.findMany({ where: { key: { in: ["bg_image_events"] } } }),
    ]);
    const content = Object.fromEntries(rows.map((r: { key: string; value: string }) => [r.key, r.value]));
    return { events, content };
  }, { events: [], content: {} });
}

export default async function EventsPage() {
  const { events, content } = await getEvents();
  const waNumber = resolveWhatsAppNumber();

  return (
    <div style={pageBackground("", content["bg_image_events"] || "")}>
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-12">
        <div className="w-12 h-1 bg-amber-500 rounded-full mb-4" />
        <h1 className="text-4xl font-bold text-amber-900">אירועים מיוחדים</h1>
        <p className="text-stone-600 mt-2 text-lg">חגגו יחד עם קדרות — ימי הולדת, ימי גיבוש ועוד</p>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-24 text-stone-500">
          <p className="text-xl">אין אירועים כרגע</p>
        </div>
      ) : (
        <div className={cardGrid(events.length).container}>
          {events.map((event) => {
            const waMessage = event.whatsappMessage || `היי! אני מעוניין/ת לשמוע על ${event.name} 🏺`;
            const waUrl = buildWhatsAppUrl(waNumber, waMessage);
            return (
              <div key={event.id} className={`${cardGrid(events.length).item} bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-200/70 hover:shadow-lg transition-shadow flex flex-col`}>
                {event.imageUrl ? (
                  <div className="relative w-full h-52 flex-shrink-0">
                    <Image
                      src={event.imageUrl}
                      alt={event.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                ) : (
                  /* בלי תמונה — פס מבטא, לא ריבוע ממלא מקום עם אימוג'י */
                  <div className="h-1.5 flex-shrink-0 bg-gradient-to-l from-amber-500 via-amber-600 to-orange-500" aria-hidden="true" />
                )}
                <div className="p-6 flex flex-col gap-3 flex-1">
                  <h2 className="text-xl font-bold text-stone-800">{event.name}</h2>
                  <p className="text-stone-600 text-sm leading-relaxed flex-1">{event.description}</p>
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 py-3 px-4 min-h-11 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors text-sm mt-auto w-full"
                  >
                    <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                    לפרטים ב-WhatsApp
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
    </div>
  );
}
