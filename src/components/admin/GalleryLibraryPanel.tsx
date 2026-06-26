"use client";

import { useRef, useState } from "react";
import type { GalleryImage } from "@prisma/client";
import Link from "next/link";
import { Eye, EyeOff, ExternalLink, Loader2, Trash2, Upload } from "lucide-react";

interface Props {
  gallery: GalleryImage[];
  onGalleryUpdate: (gallery: GalleryImage[]) => void;
  /** כותרת ראשית מלאה — בדף ייעודי `/admin/gallery` */
  showPageHeader?: boolean;
}

export function GalleryLibraryPanel({ gallery, onGalleryUpdate, showPageHeader }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const publicImages = gallery.filter((img) => img.showOnHomepage);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    const fd = new FormData();
    fd.append("file", file);
    try {
      const up = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const upData = await up.json();
      if (!up.ok) {
        setError(upData.error || "שגיאה בהעלאה");
        return;
      }
      const res = await fetch("/api/admin/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: upData.url, caption: null, order: gallery.length }),
      });
      if (!res.ok) {
        setError("ההעלאה הצליחה אך לא נשמרה בספרייה");
        return;
      }
      const img = (await res.json()) as GalleryImage;
      onGalleryUpdate([...gallery, img]);
    } catch {
      setError("שגיאת רשת");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function remove(id: string) {
    if (!confirm("למחוק את התמונה מהספרייה?")) return;
    await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
    onGalleryUpdate(gallery.filter((g) => g.id !== id));
  }

  async function toggleShowOnHomepage(id: string, showOnHomepage: boolean) {
    const res = await fetch(`/api/admin/gallery/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ showOnHomepage }),
    });
    if (!res.ok) return;
    const updated = (await res.json()) as GalleryImage;
    onGalleryUpdate(gallery.map((g) => (g.id === id ? updated : g)));
  }

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      {showPageHeader && (
        <div>
          <h1 className="text-3xl font-bold text-stone-800">ספריית תמונות</h1>
          <p className="text-stone-500 mt-1 text-sm">
            כל התמונות באתר נשמרות כאן. רקעים, סדנאות ואירועים — בוחרים תמונה מהספרייה.
          </p>
        </div>
      )}

      {/* גלריה ציבורית — תצוגה מקדימה */}
      <section className="bg-white rounded-2xl p-5 border border-stone-100 flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-stone-800">גלריה בדף הבית</h2>
            <p className="text-sm text-stone-500 mt-1">
              תמונות שמסומנות &quot;מוצג באתר&quot; יופיעו בסקשן &quot;הגלריה שלנו&quot; בדף הבית.
            </p>
          </div>
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1 text-xs text-amber-700 hover:text-amber-800 font-medium"
          >
            צפייה באתר
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {publicImages.length === 0 ? (
          <p className="text-sm text-stone-400 bg-stone-50 rounded-xl p-4 text-center">
            אין עדיין תמונות בגלריה הציבורית. סמנו תמונות מהספרייה למטה.
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

      {/* ספריית תמונות — ניהול */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-bold text-stone-800">כל התמונות בספרייה</h2>
          <p className="text-sm text-stone-500 mt-1">
            {gallery.length === 0
              ? "העלו תמונות — הן יהיו זמינות לבחירה ברקעים, סדנאות, אירועים ועוד."
              : `${gallery.length} תמונות בספרייה`}
          </p>
        </div>

        {gallery.length === 0 ? (
          <p className="text-stone-400 text-sm bg-white rounded-2xl p-8 border border-stone-100 text-center">
            אין עדיין תמונות. העלו את התמונה הראשונה למטה.
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
                    className="absolute top-1 left-1 p-1.5 bg-black/50 hover:bg-red-600 text-white rounded-lg transition-colors"
                    aria-label="מחק תמונה"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => toggleShowOnHomepage(img.id, !img.showOnHomepage)}
                  className={`flex items-center justify-center gap-1 px-2 py-2.5 text-xs font-medium transition-colors ${
                    img.showOnHomepage
                      ? "bg-amber-50 text-amber-800"
                      : "bg-stone-50 text-stone-500 hover:bg-stone-100"
                  }`}
                >
                  {img.showOnHomepage ? (
                    <>
                      <Eye className="w-3.5 h-3.5" /> מוצג בגלריה
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5" /> לא בגלריה
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="bg-white rounded-2xl p-5 border border-stone-100 flex flex-col gap-3">
          <h3 className="font-bold text-stone-800">העלאת תמונה חדשה</h3>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm transition-colors disabled:opacity-50 min-h-11 w-full sm:w-auto"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? "מעלה..." : "העלה תמונה לספרייה"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="hidden"
            onChange={handleUpload}
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      </section>
    </div>
  );
}
