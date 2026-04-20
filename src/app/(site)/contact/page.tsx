export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { pageBackground } from "@/lib/utils";
import { ContactForm } from "@/components/contact/ContactForm";

async function getContent() {
  const rows = await prisma.siteContent.findMany({
    where: { key: { in: ["phone", "email", "address", "hours", "whatsapp", "bg_contact", "bg_image_contact", "global_bg_color"] } },
  });
  const map: Record<string, string> = {};
  rows.forEach((r: { key: string; value: string }) => (map[r.key] = r.value));
  return map;
}

export default async function ContactPage() {
  const info = await getContent();
  const waNumber = info.whatsapp || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";
  const waUrl = `https://wa.me/${waNumber}`;

  return (
    <div style={pageBackground(info["bg_contact"] || info["global_bg_color"] || "", info["bg_image_contact"] || "")}>
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

              {info.address && (
                <div className="flex gap-3">
                  <span className="text-2xl">📍</span>
                  <div>
                    <div className="text-xs text-stone-400 mb-0.5">כתובת</div>
                    <div className="font-medium text-stone-700">{info.address}</div>
                  </div>
                </div>
              )}

              {info.phone && (
                <div className="flex gap-3">
                  <span className="text-2xl">📞</span>
                  <div>
                    <div className="text-xs text-stone-400 mb-0.5">טלפון</div>
                    <a href={`tel:${info.phone}`} className="font-medium text-amber-700 hover:text-amber-800">
                      {info.phone}
                    </a>
                  </div>
                </div>
              )}

              {info.email && (
                <div className="flex gap-3">
                  <span className="text-2xl">✉️</span>
                  <div>
                    <div className="text-xs text-stone-400 mb-0.5">מייל</div>
                    <a href={`mailto:${info.email}`} className="font-medium text-amber-700 hover:text-amber-800" dir="ltr">
                      {info.email}
                    </a>
                  </div>
                </div>
              )}

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
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3386.6783134310394!2d34.78697792353003!3d31.9153366275209!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1502b6d74d65d3a7%3A0x5b38c23f0f78960e!2z15DXkdeg16gg15HXnyDXmdeU15XXk9eUIDQxLCDXoNehINem15nXldeg15Q!5e0!3m2!1siw!2sil!4v1776697534538!5m2!1siw!2sil"
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
