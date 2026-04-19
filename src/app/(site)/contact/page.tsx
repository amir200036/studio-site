export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { pageBackground } from "@/lib/utils";
import { ContactForm } from "@/components/contact/ContactForm";

async function getContactInfo() {
  const rows = await prisma.siteContent.findMany({
    where: { key: { in: ["phone", "email", "address", "whatsapp", "map_embed", "bg_contact", "bg_image_contact"] } },
  });
  const map: Record<string, string> = {};
  rows.forEach((r: { key: string; value: string }) => (map[r.key] = r.value));
  return map;
}

export default async function ContactPage() {
  const info = await getContactInfo();
  const waNumber = info.whatsapp || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";
  const waUrl = `https://wa.me/${waNumber}`;
  return (
    <div style={pageBackground(info["bg_contact"] || "", info["bg_image_contact"] || "")}>
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-12">
        <div className="w-12 h-1 bg-amber-500 rounded-full mb-4" />
        <h1 className="text-4xl font-bold text-amber-900">צרו קשר</h1>
        <p className="text-stone-500 mt-2 text-lg">נשמח לשמוע מכם!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* עמודה שמאל — פרטים */}
        <div className="flex flex-col gap-6">
          {/* כפתור WhatsApp גדול */}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 py-4 px-6 bg-green-500 hover:bg-green-600 text-white font-bold text-lg rounded-2xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <span className="text-2xl">💬</span>
            שלחו לנו WhatsApp
          </a>

          <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm flex flex-col gap-4">
            <h2 className="font-bold text-stone-800 text-lg">פרטי התקשרות</h2>
            {info.phone && (
              <a href={`tel:${info.phone}`} className="flex items-center gap-3 text-stone-600 hover:text-amber-700 transition-colors">
                <span className="text-xl">📞</span> {info.phone}
              </a>
            )}
            {info.email && (
              <a href={`mailto:${info.email}`} className="flex items-center gap-3 text-stone-600 hover:text-amber-700 transition-colors">
                <span className="text-xl">✉️</span> {info.email}
              </a>
            )}
            {info.address && (
              <div className="flex items-center gap-3 text-stone-600">
                <span className="text-xl">📍</span> {info.address}
              </div>
            )}
          </div>

          {/* מפה מוטמעת */}
          {info.map_embed && (
            <div className="rounded-2xl overflow-hidden shadow h-48">
              <iframe
                src={info.map_embed}
                className="w-full h-full border-0"
                allowFullScreen
                loading="lazy"
                title="מפת הסטודיו"
              />
            </div>
          )}
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
