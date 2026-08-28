/**
 * Postgres מנוהל (Supabase/Vercel) דורש SSL, אבל שרת מקומי לא תומך בו כלל
 * ומחזיר "The server does not support SSL connections" אם מנסים.
 * לכן מדלגים על SSL עבור localhost בלבד, ומשאירים אותו בכל שאר המקרים.
 */
export function pgSslFor(url: string | undefined | null): { rejectUnauthorized: boolean } | false {
  try {
    const host = new URL(url ?? "").hostname.toLowerCase();
    if (host === "localhost" || host === "127.0.0.1" || host === "::1" || host === "[::1]") {
      return false;
    }
  } catch {
    /* URL לא תקין — נשארים עם SSL, ההתנהגות הבטוחה */
  }
  return { rejectUnauthorized: false };
}
