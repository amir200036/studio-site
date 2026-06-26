export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { pageBackground } from "@/lib/utils";
import { ContactForm } from "@/components/contact/ContactForm";
import { getSiteUrl } from "@/lib/site-url";
import { safeDbQuery } from "@/lib/safe-db";
import { resolveWhatsAppNumber } from "@/lib/whatsapp-number";
import { STUDIO_ADDRESS, STUDIO_EMAIL, STUDIO_MAP_EMBED_URL, STUDIO_PHONE, formatStudioPhone } from "@/lib/studio-contact";

const siteUrl = getSiteUrl().replace(/\/$/, "");

export const metadata: Metadata = {
  title: "יצירת קשר | יד יוצרת — סדנת קדרות בנס ציונה",
  description:
    "צרו קשר עם סדנת הקדרות יד יוצרת בנס ציונה — טלפון, WhatsApp, מייל וטופס יצירת קשר. אבנר בן יהודה 41, נס ציונה.",
  alternates: {
    canonical: `${siteUrl}/contact`,
  },
  openGraph: {
    title: "יצירת קשר | יד יוצרת — סדנת קדרות בנס ציונה",
    description:
      "צרו קשר עם סדנת הקדרות יד יוצרת בנס ציונה — טלפון, WhatsApp, מייל וטופס יצירת קשר. אבנר בן יהודה 41, נס ציונה.",
    url: `${siteUrl}/contact`,
    locale: "he_IL",
    type: "website",
    siteName: "יד יוצרת — סדנת קדרות",
  },
};

async function getContent() {
  return safeDbQuery(async () => {
    const rows = await prisma.siteContent.findMany({
      where: { key: { in: ["hours", "bg_image_contact"] } },
    });
    const map: Record<string, string> = {};
    rows.forEach((r: { key: string; value: string }) => (map[r.key] = r.value));
    return map;
  }, {});
}

export default async function ContactPage() {
  const info = await getContent();
  const waNumber = resolveWhatsAppNumber();
  const waUrl = `https://wa.me/${waNumber}`;
  const mapSrc = STUDIO_MAP_EMBED_URL;

  return (
    <div style={pageBackground("", info["bg_image_contact"] || "")}>
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-10">
          <div className="w-12 h-1 bg-amber-500 rounded-full mb-4" />
          <h1 className="text-4xl font-bold text-amber-900">צרו קשר</h1>
          <p className="text-stone-500 mt-2 text-lg">נשמח לשמוע מכם!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* עמודה שמאל — פרטים + מפה */}
          <div className="flex flex-col gap-5">
            {/* WhatsApp */}
            {waNumber && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 py-4 px-6 bg-green-500 hover:bg-green-600 text-white font-bold text-lg rounded-2xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                <span className="text-2xl">💬</span>
                שלחו לנו WhatsApp
              </a>
            )}

            {/* פרטי קשר + שעות */}
            <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm flex flex-col gap-5">
              <h2 className="font-bold text-stone-800 text-lg border-b border-stone-100 pb-3">פרטי הסטודיו</h2>

              <div className="flex gap-3">
                <span className="text-2xl">📍</span>
                <div>
                  <div className="text-xs text-stone-400 mb-0.5">כתובת</div>
                  <div className="font-medium text-stone-700">{STUDIO_ADDRESS}</div>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="text-2xl">📞</span>
                <div>
                  <div className="text-xs text-stone-400 mb-0.5">טלפון</div>
                  <a href={`tel:${STUDIO_PHONE}`} className="font-medium text-amber-700 hover:text-amber-800">
                    {formatStudioPhone()}
                  </a>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="text-2xl">✉️</span>
                <div>
                  <div className="text-xs text-stone-400 mb-0.5">מייל</div>
                  <a href={`mailto:${STUDIO_EMAIL}`} className="font-medium text-amber-700 hover:text-amber-800" dir="ltr">
                    {STUDIO_EMAIL}
                  </a>
                </div>
              </div>

              {info.hours && (
                <div className="flex gap-3">
                  <span className="text-2xl">🕐</span>
                  <div>
                    <div className="text-xs text-stone-400 mb-0.5">שעות פעילות</div>
                    <div className="font-medium text-stone-700 whitespace-pre-wrap">{info.hours}</div>
                  </div>
                </div>
              )}
            </div>

            {/* מפה */}
            <div className="rounded-2xl overflow-hidden shadow-md" style={{ height: 280 }}>
              <iframe
                src={mapSrc}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="מיקום הסטודיו"
              />
            </div>
          </div>

          {/* עמודה ימין — טופס */}
          <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm">
            <h2 className="font-bold text-stone-800 text-lg mb-6">שלחו לנו הודעה</h2>
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
