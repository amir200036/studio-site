"use client";

import { useCallback, useEffect, useState } from "react";
import type { GalleryImage } from "@prisma/client";
import { Check, Loader2, PackageSearch } from "lucide-react";
import { adminPrimaryBtnClass } from "@/lib/admin-ui";

type OrphanBlob = { url: string; size: number; uploadedAt: string };

interface Props {
  onImported: (gallery: GalleryImage[]) => void;
}

/**
 * תמונות שהועלו בעבר ונשארו באחסון בלי שאף רשומה מפנה אליהן.
 * הרכיב מאפשר לשחזר אותן לספרייה במקום להעלות מחדש.
 */
export function OrphanImageImport({ onImported }: Props) {
  const [orphans, setOrphans] = useState<OrphanBlob[] | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/gallery/orphans");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "שגיאה");
      setOrphans(data.orphans as OrphanBlob[]);
      setSelected(new Set((data.orphans as OrphanBlob[]).map((o) => o.url)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "לא ניתן לבדוק את מאגר התמונות");
      setOrphans([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function toggle(url: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(url)) next.delete(url);
      else next.add(url);
      return next;
    });
  }

  async function importSelected() {
    setImporting(true);
    setError("");
    try {
      const res = await fetch("/api/admin/gallery/orphans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls: Array.from(selected) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "הייבוא נכשל");
      onImported(data.images as GalleryImage[]);
      setDone(data.imported as number);
      setOrphans([]);
      setSelected(new Set());
    } catch (e) {
      setError(e instanceof Error ? e.message : "הייבוא נכשל");
    } finally {
      setImporting(false);
    }
  }

  if (loading) {
    return (
      <section className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm flex items-center gap-2 text-sm text-stone-500">
        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
        בודק אם יש תמונות שאפשר לשחזר…
      </section>
    );
  }

  if (done > 0) {
    return (
      <section className="bg-green-50 rounded-2xl p-5 border border-green-200 flex items-center gap-2 text-sm text-green-800">
        <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
        {done} תמונות שוחזרו לספרייה.
      </section>
    );
  }

  if (error && (!orphans || orphans.length === 0)) {
    return (
      <section className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm text-sm text-stone-500">
        {error}
      </section>
    );
  }

  if (!orphans || orphans.length === 0) return null;

  const totalMb = orphans.reduce((s, o) => s + o.size, 0) / 1024 / 1024;

  return (
    <section className="bg-amber-50 rounded-2xl p-4 sm:p-5 border border-amber-200 flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <PackageSearch className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <h2 className="font-bold text-stone-800">
            נמצאו {orphans.length} תמונות שהועלו בעבר ואינן מקושרות
          </h2>
          <p className="text-sm text-stone-600 mt-1 leading-relaxed">
            הקבצים שמורים באחסון ({totalMb.toFixed(1)}MB) אבל שום דבר באתר לא מצביע עליהם. סמנו מה
            לשחזר לספריית התמונות — לא צריך להעלות מחדש.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {orphans.map((o) => {
          const isSelected = selected.has(o.url);
          return (
            <button
              key={o.url}
              type="button"
              onClick={() => toggle(o.url)}
              aria-pressed={isSelected}
              className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all active:scale-[0.98] ${
                isSelected ? "border-amber-600 ring-2 ring-amber-200" : "border-stone-200 opacity-60"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={o.url} alt="" className="w-full h-full object-cover" loading="lazy" />
              {isSelected && (
                <span className="absolute top-1 start-1 bg-amber-600 text-white rounded-full p-0.5">
                  <Check className="w-3 h-3" aria-hidden="true" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={importSelected}
          disabled={importing || selected.size === 0}
          className={adminPrimaryBtnClass + " px-6"}
        >
          {importing && <Loader2 className="w-4 h-4 animate-spin" />}
          שחזור {selected.size} תמונות
        </button>
        <button
          type="button"
          onClick={() => setSelected(selected.size === orphans.length ? new Set() : new Set(orphans.map((o) => o.url)))}
          className="text-sm text-stone-600 hover:text-stone-800 underline-offset-2 hover:underline min-h-11"
        >
          {selected.size === orphans.length ? "בטל בחירה" : "בחר הכל"}
        </button>
      </div>
    </section>
  );
}
