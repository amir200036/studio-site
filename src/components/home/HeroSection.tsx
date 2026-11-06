import Image from "next/image";
import Link from "next/link";
import { Gift, Home, MessageCircle, Sparkles, Users } from "lucide-react";
import { studioWhatsAppUrl } from "@/lib/studio-contact";

interface Props {
  content: Record<string, string>;
  transparent?: boolean;
}

const HIGHLIGHTS = [
  { Icon: Sparkles, label: "חוויה ייחודית" },
  { Icon: Users, label: "מתאים לכל הגילאים" },
  { Icon: Gift, label: "מתנה מושלמת" },
  { Icon: Home, label: "אווירה חמה ומזמינה" },
];

export function HeroSection({ content, transparent }: Props) {
  const title = content.hero_title || "יצירה מהלב, מהחמר";
  const subtitle = content.hero_subtitle || "סדנאות קדרות לכולם — מתחילים ועד מנוסים";
  const cta = content.hero_cta || "לסדנאות שלנו";

  // התמונה נבדקת כאן ולא רק אצל הקורא — בלי זה next/Image מקבל undefined וזורק
  const bgImage = content.bg_image_home?.trim() || "";
  const overImage = !!transparent && !!bgImage;

  const textContent = (
    <div className="relative max-w-6xl mx-auto px-4 py-14 md:py-24 flex flex-col items-center text-center gap-5 md:gap-6">
      <h1
        className={`text-4xl md:text-7xl font-extrabold leading-tight text-balance ${overImage ? "text-white [text-shadow:0_2px_16px_rgba(0,0,0,0.45)]" : ""}`}
        style={!overImage ? { color: content.hero_text_color || "#78350f" } : undefined}
      >
        {title}
      </h1>

      <p
        className={`text-lg md:text-2xl max-w-2xl text-balance ${overImage ? "text-white/95 [text-shadow:0_1px_8px_rgba(0,0,0,0.5)]" : ""}`}
        style={!overImage ? { color: content.hero_text_color || "#78350f", opacity: 0.85 } : undefined}
      >
        {subtitle}
      </p>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-2 w-full sm:w-auto">
        <Link
          href="/workshops"
          className="px-8 py-3.5 min-h-12 flex items-center justify-center bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          {cta} ←
        </Link>
        <a
          href={studioWhatsAppUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className={`px-8 py-3.5 min-h-12 flex items-center justify-center gap-2 font-bold rounded-full border-2 transition-all ${
            overImage
              ? "bg-white/10 hover:bg-white/20 text-white border-white/70 backdrop-blur-sm"
              : "bg-white hover:bg-green-50 text-green-700 border-green-600/40 shadow-sm hover:shadow-md"
          }`}
        >
          <MessageCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
          דברו איתנו ב-WhatsApp
        </a>
      </div>

      {/* היו hidden sm:flex — כלומר בלתי נראים בדיוק במכשיר של רוב הגולשים */}
      <ul className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-3 md:mt-6">
        {HIGHLIGHTS.map(({ Icon, label }) => (
          <li
            key={label}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium border ${
              overImage
                ? "bg-black/25 border-white/30 text-white backdrop-blur-sm"
                : "bg-white border-amber-200 text-stone-700 shadow-sm"
            }`}
          >
            <Icon className={`w-4 h-4 shrink-0 ${overImage ? "text-amber-200" : "text-amber-700"}`} aria-hidden="true" />
            {label}
          </li>
        ))}
      </ul>
    </div>
  );

  if (overImage) {
    // גובה מינימלי + object-cover. קודם התמונה רונדרה כ-w-full h-auto (רצועה 16:9)
    // והטקסט רחף מעליה ב-absolute — בטלפון הטקסט גלש אל מחוץ לתמונה.
    return (
      <section className="relative overflow-hidden min-h-[560px] md:min-h-[640px] flex items-center justify-center">
        <Image src={bgImage} alt="" fill priority sizes="100vw" className="object-cover" />
        {/* החשכה מדורגת: כהה יותר מאחורי הטקסט ובתחתית, כך שגם תמונה בהירה
            או עמוסה משאירה את הכותרת קריאה */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-black/65" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.25),transparent_70%)]" />
        <div className="relative w-full">{textContent}</div>
      </section>
    );
  }

  return (
    <section
      className="relative overflow-hidden"
      style={{ backgroundColor: content.global_bg_color || "#fdf8f0" }}
    >
      <div className="absolute inset-0 opacity-25">
        <div className="absolute -top-16 right-0 w-80 h-80 bg-amber-300 rounded-full blur-3xl" />
      </div>
      {textContent}
    </section>
  );
}
