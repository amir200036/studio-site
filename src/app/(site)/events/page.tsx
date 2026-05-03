export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { buildWhatsAppUrl, pageBackground } from "@/lib/utils";

const BASE_URL = "https://studio-site-one-hazel.vercel.app";

export const metadata: Metadata = {
  title: "אירועים מיוחדים וגיבוש חברה | יד יוצרת — סדנת קדרות בנס ציונה",
  description:
    "ימי הולדת, גיבוש חברה ואירועים מיוחדים בסדנת קדרות בנס ציונה. חוויה ייחודית שכולם ייזכרו — צרו קשר לפרטים.",
  alternates: {
    canonical: `${BASE_URL}/events`,
  },
  openGraph: {
    title: "אירועים מיוחדים וגיבוש חברה | יד יוצרת — סדנת קדרות בנס ציונה",
    description:
      "ימי הולדת, גיבוש חברה ואירועים מיוחדים בסדנת קדרות בנס ציונה. חוויה ייחודית שכולם ייזכרו — צרו קשר לפרטים.",
    url: `${BASE_URL}/events`,
    locale: "he_IL",
    type: "website",
    siteName: "יד יוצרת — סדנת קדרות",
  },
};

async function getEvents() {
  const [events, rows] = await Promise.all([
    prisma.event.findMany({ where: { active: true }, orderBy: { order: "asc" } }),
    prisma.siteContent.findMany({ where: { key: { in: ["bg_image_events"] } } }),
  ]);
  const content = Object.fromEntries(rows.map((r: { key: string; value: string }) => [r.key, r.value]));
  return { events, content };
}

export default async function EventsPage() {
  const { events, content } = await getEvents();
  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";

  return (
    <div style={pageBackground("", content["bg_image_events"] || "")}>
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-12">
        <div className="w-12 h-1 bg-amber-500 rounded-full mb-4" />
        <h1 className="text-4xl font-bold text-amber-900">אירועים מיוחדים</h1>
        <p className="text-stone-500 mt-2 text-lg">חגגו יחד עם קדרות — ימי הולדת, ימי גיבוש ועוד</p>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-24 text-stone-400">
          <span className="text-6xl block mb-4">🎉</span>
          <p className="text-xl">אין אירועים כרגע</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {events.map((event) => {
            const waMessage = event.whatsappMessage || `היי! אני מעוניין/ת לשמוע על ${event.name} 🏺`;
            const waUrl = buildWhatsAppUrl(waNumber, waMessage);
            return (
              <div key={event.id} className="bg-white rounded-2xl overflow-hidden shadow border border-stone-100 hover:shadow-lg transition-shadow flex flex-col md:flex-row">
                {event.imageUrl ? (
                  <div className="relative w-full md:w-48 h-48 flex-shrink-0">
                    <Image
                      src={event.imageUrl}
                      alt={event.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 192px"
                    />
                  </div>
                ) : (
                  <div className="w-full md:w-48 h-48 bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-5xl opacity-40">🎉</span>
                  </div>
                )}
                <div className="p-6 flex flex-col gap-3 flex-1">
                  <h2 className="text-xl font-bold text-stone-800">{event.name}</h2>
                  <p className="text-stone-600 text-sm leading-relaxed flex-1">{event.description}</p>
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors text-sm mt-auto w-full sm:w-auto"
                  >
                    💬 לפרטים והרשמה ב-WhatsApp
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
