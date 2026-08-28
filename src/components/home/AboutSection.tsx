import Image from "next/image";

interface Props {
  content: Record<string, string>;
}

export function AboutSection({ content }: Props) {
  const title = content.about_title || "על הסטודיו שלנו";
  const text =
    content.about_text ||
    "סטודיו הקדרות שלנו הוא מקום שבו חמר הופך ליצירה ואנשים הופכים לאמנים. אנחנו מאמינים שיצירה ידנית מחברת אותנו לרגע, לחומר ולעצמנו. בסדנאות שלנו תמצאו אווירה חמה, מדריכים מנוסים ושפע של שמחת יצירה.";
  const imageUrl = content.about_image || "";

  const stats = [
    { num: content.stat_years || "5+", label: "שנות ניסיון" },
    { num: content.stat_students || "500+", label: "תלמידים" },
    { num: content.stat_workshops || "200+", label: "סדנאות" },
  ];

  // בלי תמונה, פריסת שתי עמודות משאירה חצי מסך ריק. במקרה כזה הטקסט
  // עומד במרכז ברוחב קריא, והנתונים הופכים לפס רחב מתחתיו.
  if (!imageUrl) {
    return (
      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 flex flex-col items-center text-center gap-5">
          <div className="w-12 h-1 bg-amber-500 rounded-full" />
          <h2 className="text-3xl md:text-4xl font-bold text-amber-900 text-balance">{title}</h2>
          <p className="text-stone-600 leading-relaxed text-lg whitespace-pre-wrap text-balance">{text}</p>
        </div>

        <div className="max-w-4xl mx-auto px-4 mt-10">
          <div className="grid grid-cols-3 divide-x divide-x-reverse divide-amber-200/70 bg-white rounded-2xl border border-amber-100 shadow-sm py-6">
            {stats.map((s) => (
              <div key={s.label} className="text-center px-2">
                <div className="text-2xl sm:text-4xl font-extrabold text-amber-700">{s.num}</div>
                <div className="text-xs sm:text-sm text-stone-500 mt-1 leading-tight">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* תמונה */}
          <div className="order-2 md:order-1">
            <div className="relative w-full h-80 rounded-2xl shadow-xl overflow-hidden">
              <Image
                src={imageUrl}
                alt="סדנת קדרות יד יוצרת בנס ציונה"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>

          {/* טקסט */}
          <div className="order-1 md:order-2 flex flex-col gap-4">
            <div className="w-12 h-1 bg-amber-500 rounded-full" />
            <h2 className="text-3xl md:text-4xl font-bold text-amber-900">{title}</h2>
            <p className="text-stone-600 leading-relaxed text-lg whitespace-pre-wrap">{text}</p>

            <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-4">
              {stats.map((s) => (
                <div key={s.label} className="text-center p-2 sm:p-3 bg-amber-50 rounded-xl">
                  <div className="text-lg sm:text-2xl font-extrabold text-amber-700">{s.num}</div>
                  <div className="text-xs text-stone-500 mt-1 leading-tight">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
