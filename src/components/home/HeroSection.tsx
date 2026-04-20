import Link from "next/link";

interface Props {
  content: Record<string, string>;
  transparent?: boolean;
}

export function HeroSection({ content, transparent }: Props) {
  const title = content.hero_title || "יצירה מהלב, מהחמר";
  const subtitle = content.hero_subtitle || "סדנאות קדרות לכולם — מתחילים ועד מנוסים";
  const cta = content.hero_cta || "לסדנאות שלנו";

  const textContent = (
    <div className="relative max-w-6xl mx-auto px-4 py-10 md:py-36 flex flex-col items-center text-center gap-4 md:gap-6">
      <h1
        className={`text-3xl md:text-8xl font-extrabold leading-tight text-balance ${transparent ? "text-white drop-shadow-lg" : ""}`}
        style={!transparent ? { color: content.hero_text_color || "#78350f" } : undefined}
      >
        {title}
      </h1>

      <p
        className={`text-base md:text-3xl max-w-2xl text-balance ${transparent ? "text-white/90" : ""}`}
        style={!transparent ? { color: content.hero_text_color || "#78350f", opacity: 0.8 } : undefined}
      >
        {subtitle}
      </p>

      <div className="flex flex-col sm:flex-row gap-4 mt-4">
        <Link
          href="/workshops"
          className="px-8 py-3 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          {cta} ←
        </Link>
        <Link
          href="/contact"
          className="px-8 py-3 bg-white hover:bg-amber-50 text-amber-800 font-bold rounded-full border-2 border-amber-300 transition-all shadow hover:shadow-md"
        >
          צרו קשר
        </Link>
      </div>

      <div className="hidden sm:flex flex-wrap justify-center gap-6 mt-4 md:mt-8 text-sm text-stone-500">
        {["✨ חוויה ייחודית", "👨‍👩‍👧 מתאים לכל הגילאים", "🎁 מתנה מושלמת", "🏡 אווירה חמה ומזמינה"].map((item) => (
          <span key={item} className="bg-white/70 px-4 py-1.5 rounded-full border border-amber-200">
            {item}
          </span>
        ))}
      </div>
    </div>
  );

  if (transparent) {
    return (
      <section className="relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={content.bg_image_home}
          alt=""
          className="w-full block"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          {textContent}
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden" style={{ backgroundColor: content.hero_bg_color || "#fdf6e3" }}>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 right-10 w-64 h-64 bg-amber-400 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-stone-400 rounded-full blur-3xl" />
      </div>
      {textContent}
    </section>
  );
}
