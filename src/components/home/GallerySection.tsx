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
          <p className="text-stone-500 mt-2">הצצה לעולם הקדרות</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {images.map((img, i) => (
            <div
              key={img.id}
              className={`overflow-hidden rounded-xl shadow-md group cursor-pointer ${
                i === 0 ? "col-span-2 row-span-2" : ""
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.caption || "תמונת גלריה"}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                style={{ minHeight: i === 0 ? "300px" : "150px" }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
