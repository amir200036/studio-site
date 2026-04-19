import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 px-4 text-center">
      <div className="text-7xl mb-6">🏺</div>
      <h1 className="text-6xl font-extrabold text-amber-700 mb-2">404</h1>
      <h2 className="text-2xl font-bold text-stone-700 mb-3">הדף לא נמצא</h2>
      <p className="text-stone-500 mb-8 max-w-sm">
        נראה שהדף שחיפשת לא קיים. אולי הוא עוצב מחדש, או שהקישור שגוי.
      </p>
      <Link
        href="/"
        className="inline-block bg-amber-700 hover:bg-amber-800 text-white font-bold px-8 py-3 rounded-xl transition-colors"
      >
        חזרה לדף הבית
      </Link>
    </div>
  );
}
