"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 px-4 text-center">
      <div className="text-7xl mb-6">😕</div>
      <h1 className="text-3xl font-extrabold text-stone-700 mb-3">משהו השתבש</h1>
      <p className="text-stone-500 mb-8 max-w-sm">
        אירעה שגיאה בלתי צפויה. אנחנו מתנצלים על אי הנוחות.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="bg-amber-700 hover:bg-amber-800 text-white font-bold px-6 py-3 rounded-xl transition-colors"
        >
          נסה שוב
        </button>
        <a
          href="/"
          className="bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold px-6 py-3 rounded-xl transition-colors"
        >
          דף הבית
        </a>
      </div>
    </div>
  );
}
