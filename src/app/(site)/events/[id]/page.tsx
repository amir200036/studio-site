export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { buildWhatsAppUrl, pageBackground } from "@/lib/utils";

const BASE_URL = "https://studio-site-one-hazel.vercel.app";

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const event = await prisma.event.findFirst({ where: { id: params.id, active: true } });
  if (!event) return { title: "אירוע" };
  const title = `${event.name} | אירועים — יד יוצרת`;
  const description = event.description.slice(0, 160) + (event.description.length > 160 ? "…" : "");
  return {
    title,
    description,
    alternates: { canonical: `${BASE_URL}/events/${params.id}` },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/events/${params.id}`,
      locale: "he_IL",
      type: "website",
      siteName: "יד יוצרת — סדנת קדרות",
    },
  };
}

export default async function EventDetailPage({ params }: Props) {
  const { id } = params;
  const [event, rows] = await Promise.all([
    prisma.event.findFirst({ where: { id, active: true } }),
    prisma.siteContent.findMany({ where: { key: { in: ["bg_image_events"] } } }),
  ]);

  if (!event) notFound();

  const content = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";
  const waMessage = event.whatsappMessage || `היי! אני מעוניין/ת לשמוע על ${event.name} 🏺`;
  const waUrl = buildWhatsAppUrl(waNumber, waMessage);

  return (
    <div style={pageBackground("", content["bg_image_events"] || "")}>
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Link href="/events" className="text-amber-700 hover:underline text-sm mb-6 inline-block">
          ← חזרה לכל האירועים
        </Link>

        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          {event.imageUrl ? (
            <div className="relative w-full h-56 md:h-72">
              <Image src={event.imageUrl} alt={event.name} fill className="object-cover" sizes="(max-width:768px) 100vw, 768px" priority />
            </div>
          ) : (
            <div className="w-full h-48 bg-amber-100 flex items-center justify-center">
              <span className="text-7xl opacity-40">🎉</span>
            </div>
          )}
          <div className="p-6 md:p-8">
            <h1 className="text-3xl font-bold text-amber-900 mb-4">{event.name}</h1>
            <p className="text-stone-600 leading-relaxed whitespace-pre-line mb-8">{event.description}</p>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 py-3 px-8 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors"
            >
              💬 לפרטים ב-WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
