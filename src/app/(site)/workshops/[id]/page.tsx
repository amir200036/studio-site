// נשמר ב-CDN ומתרענן כל 5 דקות. כל שמירה באדמין קוראת ל-revalidatePath
// ומרעננת מיד, כך שאין המתנה לשינוי תוכן.
export const revalidate = 300;
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  formatDate,
  formatTime,
  formatWorkshopSeatsAvailability,
  getAvailableSeats,
  pageBackground,
} from "@/lib/utils";
import { WorkshopInterestLink } from "@/components/workshops/WorkshopInterestLink";
import { CalendarDays, Clock, Users } from "lucide-react";
import { getSiteUrl } from "@/lib/site-url";
import { safeDbQuery } from "@/lib/safe-db";
import { resolveWhatsAppNumber } from "@/lib/whatsapp-number";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const base = getSiteUrl().replace(/\/$/, "");
  const { id } = await params;
  const workshop = await safeDbQuery(
    () =>
      prisma.workshop.findUnique({
        where: { id },
        include: { bookings: { where: { paymentStatus: "paid" } } },
      }),
    null
  );
  if (!workshop || workshop.status !== "active") {
    return { title: "סדנה" };
  }
  const title = `${workshop.name} | סדנאות קדרות — יד יוצרת`;
  const when = workshop.date
    ? `${formatDate(workshop.date)} · `
    : `${workshop.durationHours} שעות · מועד ב-WhatsApp · `;
  const description = `${when}${workshop.description.slice(0, 100)}${workshop.description.length > 100 ? "…" : ""}`;
  return {
    title,
    description,
    alternates: { canonical: `${base}/workshops/${id}` },
    openGraph: {
      title,
      description,
      url: `${base}/workshops/${id}`,
      locale: "he_IL",
      type: "website",
      siteName: "יד יוצרת — סדנת קדרות",
    },
  };
}

export default async function WorkshopDetailPage({ params }: Props) {
  const { id } = await params;
  const { workshop, content } = await safeDbQuery(async () => {
    const [w, rows] = await Promise.all([
      prisma.workshop.findUnique({
        where: { id },
        include: { bookings: { where: { paymentStatus: "paid" } } },
      }),
      prisma.siteContent.findMany({ where: { key: { in: ["bg_image_workshops"] } } }),
    ]);
    return { workshop: w, content: Object.fromEntries(rows.map((r) => [r.key, r.value])) };
  }, { workshop: null, content: {} as Record<string, string> });

  if (!workshop || workshop.status !== "active") notFound();
  const waNumber = resolveWhatsAppNumber();
  const available = getAvailableSeats(workshop.maxParticipants, workshop.bookings);
  const isPast = workshop.date != null && workshop.date < new Date();

  if (isPast || available <= 0) {
    return (
      <div style={pageBackground("", content["bg_image_workshops"] || "")}>
        <div className="max-w-3xl mx-auto px-4 py-16">
          <Link href="/workshops" className="text-amber-700 hover:underline text-sm mb-6 inline-block">
            → חזרה לכל הסדנאות
          </Link>
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-8 text-center">
            <h1 className="text-2xl font-bold text-stone-800 mb-2">{workshop.name}</h1>
            <p className="text-stone-600">
              {isPast ? "סדנה זו כבר התקיימה." : "הסדנה מלאה."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageBackground("", content["bg_image_workshops"] || "")}>
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Link href="/workshops" className="text-amber-700 hover:underline text-sm mb-6 inline-block">
          → חזרה לכל הסדנאות
        </Link>

        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden mb-8">
          {workshop.imageUrl ? (
            <div className="relative w-full h-56 md:h-72">
              <Image src={workshop.imageUrl} alt={workshop.name} fill className="object-cover" sizes="(max-width:768px) 100vw, 768px" priority />
            </div>
          ) : (
            /* בלי תמונה — פס מבטא כמו ב-WorkshopCard, לא ריבוע ממלא מקום */
            <div className="h-1.5 bg-gradient-to-l from-amber-500 via-amber-600 to-orange-500" aria-hidden="true" />
          )}
          <div className="p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-amber-900 mb-4">{workshop.name}</h1>
            <ul className="flex flex-wrap gap-2 mb-6 text-sm">
              {workshop.date && (
                <li className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-800 font-medium">
                  <CalendarDays className="w-4 h-4 shrink-0" aria-hidden="true" />
                  {formatDate(workshop.date)} · {formatTime(workshop.date)}
                </li>
              )}
              <li className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-800 font-medium">
                <Clock className="w-4 h-4 shrink-0" aria-hidden="true" />
                כ־{workshop.durationHours} שעות
              </li>
              <li className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-800 font-medium">
                <Users className="w-4 h-4 shrink-0" aria-hidden="true" />
                {formatWorkshopSeatsAvailability(available)}
              </li>
              {!workshop.date && (
                <li className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 text-green-800 font-medium">
                  המועד מתואם ב-WhatsApp
                </li>
              )}
            </ul>
            <p className="text-stone-700 text-lg leading-relaxed whitespace-pre-line">{workshop.description}</p>
          </div>
        </div>

        <WorkshopInterestLink workshop={workshop} whatsappNumber={waNumber} />
      </div>
    </div>
  );
}
