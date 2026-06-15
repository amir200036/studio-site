/** מחזיר fallback כשה-DB לא זמין — מונע 500 בדפים ציבוריים כש-Postgres מנותק או ריק */
export async function safeDbQuery<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error("[DB]", err instanceof Error ? err.message : err);
    return fallback;
  }
}
