interface Props {
  content: Record<string, string>;
}

export function AboutSection({ content }: Props) {
  const title = content.about_title || "על הסטודיו שלנו";
  const text =
    content.about_text ||
    "סטודיו הקדרות שלנו הוא מקום שבו חמר הופך ליצירה ואנשים הופכים לאמנים. אנחנו מאמינים שיצירה ידנית מחברת אותנו לרגע, לחומר ולעצמנו. בסדנאות שלנו תמצאו אווירה חמה, מדריכים מנוסים ושפע של שמחת יצירה.";
  const imageUrl = content.about_image || "";

  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* תמונה */}
          <div className="order-2 md:order-1">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt="הסטודיו"
                className="w-full h-80 object-cover rounded-2xl shadow-xl"
              />
            ) : (
              <div className="w-full h-80 bg-gradient-to-br from-amber-100 to-stone-200 rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-8xl opacity-40">🏺</span>
              </div>
            )}
          </div>

          {/* טקסט */}
          <div className="order-1 md:order-2 flex flex-col gap-4">
            <div className="w-12 h-1 bg-amber-500 rounded-full" />
            <h2 className="text-3xl md:text-4xl font-bold text-amber-900">{title}</h2>
            <p className="text-stone-600 leading-relaxed text-lg whitespace-pre-wrap">{text}</p>

            <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-4">
              {[
                { num: content.stat_years || "5+", label: "שנות ניסיון" },
                { num: content.stat_students || "500+", label: "תלמידים" },
                { num: content.stat_workshops || "200+", label: "סדנאות" },
              ].map((s) => (
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
