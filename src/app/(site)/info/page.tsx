export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { pageBackground } from "@/lib/utils";

async function getInfo() {
  const rows = await prisma.siteContent.findMany({
    where: { key: { in: ["phone", "email", "address", "hours", "whatsapp", "map_embed", "bg_info", "bg_image_info"] } },
  });
  const map: Record<string, string> = {};
  rows.forEach((r: { key: string; value: string }) => (map[r.key] = r.value));
  return map;
}

export default async function InfoPage() {
  const info = await getInfo();
  const waNumber = info.whatsapp || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";
  return (
    <div style={pageBackground(info["bg_info"] || "", info["bg_image_info"] || "")}>
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-12">
        <div className="w-12 h-1 bg-amber-500 rounded-full mb-4" />
        <h1 className="text-4xl font-bold text-amber-900">מידע והגעה</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col gap-4">
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

            {waNumber && (
              <div className="flex gap-3">
                <span className="text-2xl">💬</span>
                <div>
                  <div className="text-xs text-stone-400 mb-0.5">WhatsApp</div>
                  <a
                    href={`https://wa.me/${waNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-green-600 hover:text-green-700"
                  >
                    שלחו לנו הודעה
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
        </div>

        {/* מפה */}
        <div className="rounded-2xl overflow-hidden shadow-md h-80 md:h-auto bg-stone-100 flex items-center justify-center">
          {info.map_embed ? (
            <iframe
              src={info.map_embed}
              className="w-full h-full border-0"
              allowFullScreen
              loading="lazy"
              title="מיקום הסטודיו"
            />
          ) : (
            <div className="text-center text-stone-400 p-8">
              <span className="text-5xl block mb-3">🗺️</span>
              <p>המפה תופיע לאחר הגדרת קישור Maps בפאנל הניהול</p>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
