import Image from "next/image";
import type { GalleryImage } from "@prisma/client";

interface Props {
  images: GalleryImage[];
}

export function GallerySection({ images }: Props) {
  if (images.length === 0) return null;

  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="w-12 h-1 bg-amber-500 rounded-full mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold text-amber-900">הגלריה שלנו</h2>
          <p className="text-stone-600 mt-2">הצצה לעולם הקדרות</p>
        </div>

        {/* עמודות בסגנון "מייסונרי": כל תמונה ביחס הטבעי שלה. תמונות הטלפון
            לאורך לא נחתכות, ואין תא יתום בסוף כמו ברשת עם אריח גדול. */}
        <div className="columns-2 md:columns-3 gap-3 [&>*]:mb-3">
          {images.map((img) => (
            <div key={img.id} className="break-inside-avoid overflow-hidden rounded-xl shadow-md group">
              <Image
                src={img.url}
                alt={img.caption || "תמונה מסדנת קדרות בנס ציונה"}
                width={600}
                height={800}
                className="w-full h-auto transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
