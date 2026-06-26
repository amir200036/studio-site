"use client";

import { useRef, useState } from "react";
import { Camera, ImagePlus, Loader2, Upload } from "lucide-react";
import { IMAGE_ACCEPT, prepareImageFileForUpload } from "@/lib/prepare-image-file";

interface Props {
  uploading: boolean;
  onFile: (file: File) => void | Promise<void>;
  error?: string;
  /** כפתור יחיד בדסקטופ; במובייל תמיד מצלמה + גלריה */
  compactLabel?: string;
}

export function GalleryUploadButtons({ uploading, onFile, error, compactLabel = "העלה תמונה לספרייה" }: Props) {
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState("");

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.files?.[0];
    if (!raw) return;
    setLocalError("");
    try {
      const file = await prepareImageFileForUpload(raw);
      await onFile(file);
    } catch {
      setLocalError("לא ניתן לעבד את התמונה. נסו צילום חדש או תמונה בפורמט JPG.");
    } finally {
      if (galleryRef.current) galleryRef.current.value = "";
      if (cameraRef.current) cameraRef.current.value = "";
    }
  }

  const displayError = error || localError;
  const btnClass =
    "flex items-center justify-center gap-2 px-4 py-3 min-h-12 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 w-full";

  return (
    <div className="flex flex-col gap-3">
      {/* מובייל: מצלמה + גלריה */}
      <div className="grid grid-cols-2 gap-2 sm:hidden">
        <button
          type="button"
          disabled={uploading}
          onClick={() => cameraRef.current?.click()}
          className={`${btnClass} bg-stone-800 hover:bg-stone-900 text-white`}
        >
          {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
          צלם תמונה
        </button>
        <button
          type="button"
          disabled={uploading}
          onClick={() => galleryRef.current?.click()}
          className={`${btnClass} bg-amber-700 hover:bg-amber-800 text-white`}
        >
          {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImagePlus className="w-5 h-5" />}
          מהגלריה בטלפון
        </button>
      </div>

      {/* דסקטופ / טאבלט */}
      <button
        type="button"
        disabled={uploading}
        onClick={() => galleryRef.current?.click()}
        className={`${btnClass} hidden sm:flex bg-amber-700 hover:bg-amber-800 text-white sm:w-auto`}
      >
        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
        {uploading ? "מעלה..." : compactLabel}
      </button>

      <p className="text-xs text-stone-400 sm:hidden">
        תמונות מאייפון (HEIC) מומרות אוטומטית. מקסימום 8MB.
      </p>

      <input
        ref={galleryRef}
        type="file"
        accept={IMAGE_ACCEPT}
        className="sr-only"
        onChange={handleChange}
      />
      <input
        ref={cameraRef}
        type="file"
        accept={IMAGE_ACCEPT}
        capture="environment"
        className="sr-only"
        onChange={handleChange}
      />

      {displayError && <p className="text-xs text-red-500">{displayError}</p>}
    </div>
  );
}
