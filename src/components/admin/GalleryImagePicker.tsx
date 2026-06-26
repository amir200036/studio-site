"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { GalleryImage } from "@prisma/client";
import { Check, ImageIcon, Loader2, Upload, X } from "lucide-react";

interface Props {
  value: string;
  onChange: (url: string) => void;
  /** אם לא מועבר — נטען מהשרת בפתיחת הבוחר */
  gallery?: GalleryImage[];
  onGalleryUpdate?: (gallery: GalleryImage[]) => void;
  allowClear?: boolean;
}

async function uploadAndRegister(
  file: File,
  order: number
): Promise<{ image?: GalleryImage; error?: string }> {
  const fd = new FormData();
  fd.append("file", file);
  const up = await fetch("/api/admin/upload", { method: "POST", body: fd });
  let upData: { url?: string; error?: string };
  try {
    upData = await up.json();
  } catch {
    return { error: `שגיאת שרת (${up.status})` };
  }
  if (!up.ok) return { error: upData.error || "שגיאה בהעלאה" };

  const res = await fetch("/api/admin/gallery", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: upData.url, caption: null, order }),
  });
  if (!res.ok) return { error: "ההעלאה הצליחה אך לא נשמרה בספרייה" };
  const image = (await res.json()) as GalleryImage;
  return { image };
}

export function GalleryImagePicker({
  value,
  onChange,
  gallery: galleryProp,
  onGalleryUpdate,
  allowClear = true,
}: Props) {
  const [open, setOpen] = useState(false);
  const [gallery, setGallery] = useState<GalleryImage[]>(galleryProp ?? []);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const syncGallery = useCallback(
    (next: GalleryImage[]) => {
      setGallery(next);
      onGalleryUpdate?.(next);
    },
    [onGalleryUpdate]
  );

  useEffect(() => {
    if (galleryProp) setGallery(galleryProp);
  }, [galleryProp]);

  async function loadGallery() {
    setLoadingGallery(true);
    setError("");
    try {
      const res = await fetch("/api/admin/gallery");
      if (!res.ok) throw new Error();
      const data = (await res.json()) as GalleryImage[];
      syncGallery(data);
    } catch {
      setError("לא ניתן לטעון את ספריית התמונות");
    } finally {
      setLoadingGallery(false);
    }
  }

  function openPicker() {
    setOpen(true);
    if (!galleryProp) loadGallery();
  }

  function select(url: string) {
    onChange(url);
    setOpen(false);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    const { image, error: err } = await uploadAndRegister(file, gallery.length);
    if (err || !image) {
      setError(err || "שגיאה");
    } else {
      syncGallery([...gallery, image]);
      onChange(image.url);
      setOpen(false);
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={openPicker}
          className="flex items-center justify-center gap-1.5 px-3 py-2.5 min-h-11 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-sm font-medium transition-colors w-full sm:w-auto"
        >
          <ImageIcon className="w-4 h-4 shrink-0" />
          <span className="sm:hidden">בחר תמונה</span>
          <span className="hidden sm:inline">בחר מספריית תמונות</span>
        </button>
        {allowClear && value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="flex items-center justify-center gap-1 px-3 py-2.5 min-h-11 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl text-sm transition-colors border border-stone-200 w-full sm:w-auto"
          >
            <X className="w-4 h-4" />
            הסר
          </button>
        )}
      </div>

      {value && (
        <div className="h-24 w-full max-w-xs rounded-xl overflow-hidden border border-stone-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      {error && !open && <p className="text-xs text-red-500">{error}</p>}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50"
          onClick={() => setOpen(false)}
          role="presentation"
        >
          <div
            className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-2xl max-h-[90vh] sm:max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="בחירת תמונה מספריית התמונות"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
              <h3 className="font-bold text-stone-800">ספריית תמונות</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500"
                aria-label="סגור"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {loadingGallery ? (
                <div className="flex justify-center py-12 text-stone-400">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : gallery.length === 0 ? (
                <p className="text-center text-stone-500 py-8 text-sm">
                  אין עדיין תמונות בספרייה. העלו תמונה חדשה למטה.
                </p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {gallery.map((img) => {
                    const selected = value === img.url;
                    return (
                      <button
                        key={img.id}
                        type="button"
                        onClick={() => select(img.url)}
                        className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                          selected
                            ? "border-amber-600 ring-2 ring-amber-200"
                            : "border-stone-200 hover:border-amber-400"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.url} alt={img.caption || ""} className="w-full h-full object-cover" />
                        {selected && (
                          <span className="absolute top-1 left-1 bg-amber-600 text-white rounded-full p-0.5">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
              {error && open && <p className="text-xs text-red-500 mt-3">{error}</p>}
            </div>

            <div className="px-4 sm:px-5 py-4 border-t border-stone-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <p className="text-xs text-stone-400 hidden sm:block">
                לחצו על תמונה לבחירה · העלאה חדשה נשמרת אוטומטית בספרייה
              </p>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex items-center justify-center gap-1.5 px-4 py-3 min-h-11 w-full sm:w-auto bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 sm:ms-auto"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {uploading ? "מעלה..." : "העלה תמונה חדשה"}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                onChange={handleUpload}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
