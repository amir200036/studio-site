"use client";

import { useState } from "react";
import type { GalleryImage } from "@prisma/client";
import Link from "next/link";
import { Eye, EyeOff, ExternalLink, Trash2 } from "lucide-react";
import { GalleryUploadButtons } from "./GalleryUploadButtons";
import { uploadImageToGallery } from "@/lib/gallery-upload-client";
import { OrphanImageImport } from "./OrphanImageImport";

interface Props {
  initialGallery: GalleryImage[];
  showPageHeader?: boolean;
}

export function GalleryLibraryPanel({ initialGallery, showPageHeader }: Props) {
  const [gallery, setGallery] = useState(initialGallery);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const publicImages = gallery.filter((img) => img.showOnHomepage);

  async function handleFile(file: File) {
    setUploading(true);
    setError("");
    const { image, error: err } = await uploadImageToGallery(file, gallery.length);
    if (err || !image) setError(err || "שגיאה");
    else setGallery([...gallery, image]);
    setUploading(false);
  }

  async function remove(id: string) {
    if (!confirm("למחוק את התמונה מהספרייה?")) return;
    await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
    setGallery(gallery.filter((g) => g.id !== id));
  }

  async function toggleShowOnHomepage(id: string, showOnHomepage: boolean) {
    const res = await fetch(`/api/admin/gallery/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ showOnHomepage }),
    });
    if (!res.ok) return;
    const updated = (await res.json()) as GalleryImage;
    setGallery(gallery.map((g) => (g.id === id ? updated : g)));
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {showPageHeader && (
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-800">ספריית תמונות</h1>
          <p className="text-stone-500 mt-1 text-sm">
            העלו מצלמה או מהגלריה בטלפון — התמונות זמינות לכל האתר.
          </p>
        </div>
      )}

      {/* שחזור תמונות שנשארו באחסון בלי הפניה במסד */}
      <OrphanImageImport onImported={setGallery} />

      {/* העלאה ראשונה במובייל */}
      <section className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-200 shadow-sm flex flex-col gap-3">
        <h2 className="text-lg font-bold text-stone-800">העלאת תמונה</h2>
        <GalleryUploadButtons uploading={uploading} onFile={handleFile} error={error} />
      </section>

      <section className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-100 flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-stone-800">גלריה בדף הבית</h2>
            <p className="text-sm text-stone-500 mt-1">
              סמנו תמונות שיופיעו בסקשן &quot;הגלריה שלנו&quot; בדף הבית.
            </p>
          </div>
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1 text-xs text-amber-700 hover:text-amber-800 font-medium min-h-11 px-2"
          >
            צפייה באתר
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {publicImages.length === 0 ? (
          <p className="text-sm text-stone-400 bg-stone-50 rounded-xl p-4 text-center">
            אין עדיין תמונות בגלריה הציבורית.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {publicImages.map((img) => (
              <div key={img.id} className="w-20 h-20 rounded-xl overflow-hidden border-2 border-amber-200 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.caption || ""} className="w-full h-full object-cover" />
              </div>
            ))}
            <p className="w-full text-xs text-stone-400 mt-1">
              {publicImages.length} תמונות מוצגות בגלריה הציבורית
            </p>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-bold text-stone-800">כל התמונות בספרייה</h2>
          <p className="text-sm text-stone-500 mt-1">
            {gallery.length === 0 ? "אין עדיין תמונות." : `${gallery.length} תמונות`}
          </p>
        </div>

        {gallery.length === 0 ? (
          <p className="text-stone-400 text-sm bg-white rounded-2xl p-8 border border-stone-100 text-center">
            העלו תמונה למעלה — מצלמה או גלריה בטלפון.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {gallery.map((img) => (
              <div key={img.id} className="bg-white rounded-xl border border-stone-100 overflow-hidden flex flex-col shadow-sm">
                <div className="relative aspect-square">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.caption || ""} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => remove(img.id)}
                    className="absolute top-1 left-1 p-2 min-h-10 min-w-10 bg-black/50 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center justify-center"
                    aria-label="מחק תמונה"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => toggleShowOnHomepage(img.id, !img.showOnHomepage)}
                  className={`flex items-center justify-center gap-1 px-2 py-3 min-h-12 text-xs font-medium transition-colors ${
                    img.showOnHomepage
                      ? "bg-amber-50 text-amber-800"
                      : "bg-stone-50 text-stone-500 active:bg-stone-100"
                  }`}
                >
                  {img.showOnHomepage ? (
                    <>
                      <Eye className="w-4 h-4" /> מוצג בגלריה
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-4 h-4" /> לא בגלריה
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
