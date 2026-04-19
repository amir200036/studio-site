import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function SuccessPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-amber-900 mb-3">ההרשמה הושלמה! 🎉</h1>
        <p className="text-stone-600 mb-6">
          תודה! מייל אישור נשלח לכתובת שמסרת. מחכים לראותך בסדנה!
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/workshops"
            className="px-6 py-3 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl transition-colors"
          >
            לסדנאות נוספות
          </Link>
          <Link
            href="/"
            className="px-6 py-3 bg-white hover:bg-amber-50 text-amber-800 font-bold rounded-xl border-2 border-amber-200 transition-colors"
          >
            לדף הבית
          </Link>
        </div>
      </div>
    </div>
  );
}
