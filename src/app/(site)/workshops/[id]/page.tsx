export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate, formatTime, formatPrice, getAvailableSeats, pageBackground } from "@/lib/utils";
import { WorkshopWhatsAppForm } from "@/components/workshops/WorkshopWhatsAppForm";
import { getSiteUrl } from "@/lib/site-url";

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const base = getSiteUrl().replace(/\/$/, "");
  const { id } = params;
  const workshop = await prisma.workshop.findUnique({
    where: { id },
    include: { bookings: { where: { paymentStatus: "paid" } } },
  });
  if (!workshop || workshop.status !== "active") {
    return { title: "סדנה" };
  }
  const title = `${workshop.name} | סדנאות קדרות — יד יוצרת`;
  const when = workshop.date
    ? `${formatDate(workshop.date)} · `
    : `${workshop.durationHours} שעות · מועד ב-WhatsApp · `;
  const description = `${when}${formatPrice(workshop.pricePerPerson)} לאדם · ${workshop.description.slice(0, 100)}${workshop.description.length > 100 ? "…" : ""}`;
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
  const { id } = params;
  const [workshop, rows] = await Promise.all([
    prisma.workshop.findUnique({
      where: { id },
      include: { bookings: { where: { paymentStatus: "paid" } } },
    }),
    prisma.siteContent.findMany({ where: { key: { in: ["bg_image_workshops"] } } }),
  ]);

  if (!workshop || workshop.status !== "active") notFound();

  const content = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  const available = getAvailableSeats(workshop.maxParticipants, workshop.bookings);
  const isPast = workshop.date != null && workshop.date < new Date();

  if (isPast || available <= 0) {
    return (
      <div style={pageBackground("", content["bg_image_workshops"] || "")}>
        <div className="max-w-3xl mx-auto px-4 py-16">
          <Link href="/workshops" className="text-amber-700 hover:underline text-sm mb-6 inline-block">
            ← חזרה לכל הסדנאות
          </Link>
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-8 text-center">
            <h1 className="text-2xl font-bold text-stone-800 mb-2">{workshop.name}</h1>
            <p className="text-stone-500">
              {isPast ? "סדנה זו כבר התקיימה." : "אין מקומות פנויים בסדנה זו."}
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
          ← חזרה לכל הסדנאות
        </Link>

        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden mb-8">
          {workshop.imageUrl ? (
            <div className="relative w-full h-56 md:h-72">
              <Image src={workshop.imageUrl} alt={workshop.name} fill className="object-cover" sizes="(max-width:768px) 100vw, 768px" priority />
            </div>
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-amber-100 to-stone-200 flex items-center justify-center">
              <span className="text-7xl opacity-40">🏺</span>
            </div>
          )}
          <div className="p-6 md:p-8">
            <h1 className="text-3xl font-bold text-amber-900 mb-2">{workshop.name}</h1>
            {workshop.date ? (
              <>
                <p className="text-amber-700 font-medium mb-1">📅 {formatDate(workshop.date)}</p>
                <p className="text-stone-500 text-sm mb-6">
                  🕐 {formatTime(workshop.date)} · {workshop.durationHours} שעות · נותרו {available} מקומות
                </p>
              </>
            ) : (
              <p className="text-stone-600 text-sm mb-6">
                ⏱️ משך כ־{workshop.durationHours} שעות · המועד יתואם ב-WhatsApp · נותרו {available} מקומות
              </p>
            )}
            <p className="text-stone-600 leading-relaxed whitespace-pre-line mb-6">{workshop.description}</p>
            <div className="flex flex-wrap items-baseline gap-3 py-4 border-t border-stone-100">
              <span className="text-sm text-stone-500">מחיר לאדם</span>
              <span className="text-3xl font-extrabold text-amber-800">{formatPrice(workshop.pricePerPerson)}</span>
            </div>
          </div>
        </div>

        <WorkshopWhatsAppForm workshop={workshop} />
      </div>
    </div>
  );
}
