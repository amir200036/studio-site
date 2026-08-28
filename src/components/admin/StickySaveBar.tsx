"use client";

import { useEffect } from "react";
import { Check, Loader2, Save } from "lucide-react";
import { adminPrimaryBtnClass } from "@/lib/admin-ui";

interface Props {
  /** האם יש שינויים שלא נשמרו */
  dirty: boolean;
  saving: boolean;
  /** הודעת הצלחה/שגיאה זמנית; גובר על מחוון המצב */
  message?: string;
  onSave: () => void;
}

/**
 * סרגל שמירה נעוץ לתחתית הכרטיס.
 * קודם כפתור השמירה ישב בתחתית טופס ארוך — בטאב "דף בית" הוא היה
 * ב-y=1204 מתוך דף בגובה 1309, כלומר חייבים לגלול עד הסוף כדי לשמור.
 * בנוסף אפשר היה לנווט החוצה ולאבד את השינויים בלי שום אזהרה.
 */
export function StickySaveBar({ dirty, saving, message, onSave }: Props) {
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  return (
    <div className="sticky bottom-0 z-20 -mx-6 -mb-6 mt-2 px-6 py-3.5 bg-white/95 backdrop-blur border-t border-stone-200 rounded-b-2xl flex items-center justify-between gap-3 pb-[max(0.875rem,env(safe-area-inset-bottom))]">
      <span
        className={`text-sm font-medium flex items-center gap-1.5 ${
          message ? "text-stone-700" : dirty ? "text-amber-700" : "text-stone-400"
        }`}
        aria-live="polite"
      >
        {message ? (
          message
        ) : dirty ? (
          <>
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" aria-hidden="true" />
            שינויים שלא נשמרו
          </>
        ) : (
          <>
            <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
            הכל שמור
          </>
        )}
      </span>

      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className={adminPrimaryBtnClass + " px-8 shrink-0"}
      >
        {saving ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Save className="w-4 h-4" aria-hidden="true" />
        )}
        שמירה
      </button>
    </div>
  );
}
