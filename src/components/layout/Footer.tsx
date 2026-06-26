import Link from "next/link";
import { STUDIO_ADDRESS, STUDIO_EMAIL, formatStudioPhone, studioWhatsAppUrl } from "@/lib/studio-contact";

export async function Footer() {
  return (
    <footer className="bg-stone-800 text-stone-200 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* עמודה 1 — מידע */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🏺</span>
            <span className="text-lg font-bold text-amber-400">סטודיו קדרות</span>
          </div>
          <p className="text-stone-400 text-sm leading-relaxed">
            מקום שבו חמר הופך ליצירה, ואנשים הופכים לאמנים. בואו לגלות את שמחת הקדרות.
          </p>
        </div>

        {/* עמודה 2 — ניווט */}
        <div>
          <h3 className="font-semibold text-amber-400 mb-4">ניווט</h3>
          <nav className="flex flex-col gap-2 text-sm">
            <Link href="/workshops" className="text-stone-400 hover:text-amber-400 transition-colors">סדנאות</Link>
            <Link href="/events" className="text-stone-400 hover:text-amber-400 transition-colors">אירועים מיוחדים</Link>
            <Link href="/faq" className="text-stone-400 hover:text-amber-400 transition-colors">שאלות נפוצות</Link>
            <Link href="/contact" className="text-stone-400 hover:text-amber-400 transition-colors">צרו קשר ומידע</Link>
            <Link href="/terms" className="text-stone-400 hover:text-amber-400 transition-colors">תקנון</Link>
          </nav>
        </div>

        {/* עמודה 3 — פרטי קשר */}
        <div>
          <h3 className="font-semibold text-amber-400 mb-4">יצרו קשר</h3>
          <div className="flex flex-col gap-2 text-sm text-stone-400">
            <p>📞 {formatStudioPhone()}</p>
            <p>✉️ {STUDIO_EMAIL}</p>
            <p>📍 {STUDIO_ADDRESS}</p>
            <a
              href={studioWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-green-400 hover:text-green-300 transition-colors mt-1"
            >
              💬 WhatsApp
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-stone-700">
        <div className="max-w-6xl mx-auto px-4 py-4 text-xs text-stone-500 text-center md:text-start">
          <p>© {new Date().getFullYear()} סטודיו קדרות. כל הזכויות שמורות.</p>
        </div>
      </div>
    </footer>
  );
}
